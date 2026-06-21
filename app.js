// BrainQ10 — 主應用程式
'use strict';

const APP_VERSION = 'v1.3';

// ─────────────────────────────────────────
// 狀態
// ─────────────────────────────────────────
const S = {
  view: 'home',          // 'home' | 'questionnaire' | 'report'
  profile: {
    subjectName: '',
    subjectAge: '',
    subjectDOB: '',
    subjectGender: '',
    subjectPhone: '',
    subjectEmail: '',
    respondentName: '',
    respondentRelationship: '', // self | parent | teacher | other
    assessmentDate: todayStr()
  },
  activeScaleId: null,
  copsoqVersion: null,   // 'short' | 'middle' | 'long'（versioned 量表用，null = 用 defaultVersion）
  answers: {},           // { questionId: value }
  completedReports: {},  // { scaleId: reportData }
  subjectSynced: false   // true once contact info has been pushed to backend in this session
};

function todayStr() {
  return new Date().toLocaleDateString('zh-TW', { year:'numeric', month:'2-digit', day:'2-digit' });
}

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function ageFromDOB(iso) {
  if (!iso) return '';
  const dob = new Date(iso);
  if (isNaN(dob)) return '';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 0 && age <= 130 ? String(age) : '';
}

// ─────────────────────────────────────────
// i18n display resolvers (zh source-of-truth + dict in i18n-data.js)
// ─────────────────────────────────────────
// TR(zhString): resolve a Traditional-Chinese display string to the current
// language via window.SCALE_TR. Unknown strings fall through unchanged, so
// wrapping is always safe. Scoring/logic keep using the raw zh strings.
function TR(s) {
  if (s == null) return '';
  var lang = (window.I18N && I18N.lang) || 'zh';
  if (lang === 'zh') return s;
  var m = window.SCALE_TR && window.SCALE_TR[s];
  if (!m) return s;
  if (lang === 'zh-Hans') return m.hans != null ? m.hans : s;
  if (lang === 'en') return m.en != null ? m.en : (m.hans != null ? m.hans : s);
  return s;
}
// L3(zh, hans, en): inline 3-way for interpolated templates that can't be a
// single dict key (word order differs across languages).
function L3(zh, hans, en) {
  var lang = (window.I18N && I18N.lang) || 'zh';
  return lang === 'en' ? en : lang === 'zh-Hans' ? hans : zh;
}

// ─────────────────────────────────────────
// 主入口
// ─────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (S.view === 'home')          app.innerHTML = renderHome();
  else if (S.view === 'questionnaire') app.innerHTML = renderQuestionnaire();
  else if (S.view === 'report')   app.innerHTML = renderReport();
  bindEvents();
}

// ─────────────────────────────────────────
// 工具：量表適用判斷
// ─────────────────────────────────────────
function isProjectLaunched() {
  return !!(window.ScalarMyndAPI && window.ScalarMyndAPI.isProjectLaunched && window.ScalarMyndAPI.isProjectLaunched());
}

function getScaleStatus(scale) {
  const age = parseInt(S.profile.subjectAge);
  const rel = S.profile.respondentRelationship;

  if (!S.profile.subjectDOB && !S.profile.respondentRelationship) {
    return { enabled: false, reason: TR('請先填寫出生日期與填答者關係') };
  }
  if (!S.profile.subjectName) {
    return { enabled: false, reason: TR('請先填寫受測者姓名') };
  }
  if (!S.profile.subjectDOB || !S.profile.subjectAge) {
    return { enabled: false, reason: TR('請先填寫受測者出生日期') };
  }
  if (!S.profile.respondentRelationship) {
    return { enabled: false, reason: TR('請先填寫填答者與本人關係') };
  }
  if (isProjectLaunched()) {
    if (!S.profile.subjectPhone) return { enabled: false, reason: TR('請先填寫聯絡電話') };
    if (!S.profile.subjectEmail) return { enabled: false, reason: TR('請先填寫聯絡信箱') };
  }

  const c = scale.criteria;
  if (c.minAge && age < c.minAge) {
    return { enabled: false, reason: L3(`此量表適用 ${c.minAge} 歲以上`, `此量表适用 ${c.minAge} 岁以上`, `For ages ${c.minAge} and above`) };
  }
  if (c.maxAge && age > c.maxAge) {
    return { enabled: false, reason: L3(`此量表適用 ${c.minAge}–${c.maxAge} 歲`, `此量表适用 ${c.minAge}–${c.maxAge} 岁`, `For ages ${c.minAge}–${c.maxAge}`) };
  }
  if (c.roles && !c.roles.includes(rel)) {
    const roleMap = { self: TR('本人'), parent: TR('父母/監護人'), teacher: TR('教師'), other: TR('其他') };
    const required = c.roles.map(r => roleMap[r] || r).join(L3(' 或 ', ' 或 ', ' or '));
    return { enabled: false, reason: L3(`此量表需由${required}填寫`, `此量表需由${required}填写`, `Must be completed by ${required}`) };
  }

  return { enabled: true };
}

function profileComplete() {
  const p = S.profile;
  const base = p.subjectName && p.subjectDOB && p.subjectAge && p.subjectGender && p.respondentRelationship;
  if (!base) return false;
  if (isProjectLaunched()) return !!(p.subjectPhone && p.subjectEmail);
  return true;
}

// ─────────────────────────────────────────
// 首頁渲染
// ─────────────────────────────────────────
function renderScaleCards() {
  return SCALES.map(scale => {
    const st = getScaleStatus(scale);
    const done = S.completedReports[scale.id];
    let badgeCls = 'badge-emotion';
    if (scale.category.includes('ADHD'))      badgeCls = 'badge-adhd';
    else if (scale.category.includes('認知')) badgeCls = 'badge-cognitive';
    else if (scale.category.includes('行為')) badgeCls = 'badge-behavior';
    else if (scale.category.includes('職場')) badgeCls = 'badge-work';

    const rolesLabel = (scale.criteria.roles || []).map(r =>
      ({self:TR('本人'),parent:TR('家長'),teacher:TR('教師'),other:TR('其他')}[r])
    ).join('／');

    const ageLabel = scale.criteria.maxAge
      ? L3(`${scale.criteria.minAge}–${scale.criteria.maxAge} 歲`, `${scale.criteria.minAge}–${scale.criteria.maxAge} 岁`, `Ages ${scale.criteria.minAge}–${scale.criteria.maxAge}`)
      : L3(`${scale.criteria.minAge} 歲以上`, `${scale.criteria.minAge} 岁以上`, `Ages ${scale.criteria.minAge}+`);

    let actionHtml = '';
    if (!st.enabled) {
      actionHtml = `<div class="scale-card-lock"><span>🔒</span><span>${st.reason}</span></div>`;
    } else if (done) {
      actionHtml = `
        <div class="scale-card-done">✓</div>
        <div class="scale-card-action">
          <button class="btn-start" data-action="view-report" data-id="${scale.id}">${TR('查看報告')}</button>
          <button class="btn-redo" data-action="redo" data-id="${scale.id}">${TR('重新作答')}</button>
        </div>`;
    } else {
      actionHtml = `
        <div class="scale-card-action">
          <button class="btn-start" data-action="start" data-id="${scale.id}">${L3('開始作答 →','开始作答 →','Start →')}</button>
        </div>`;
    }

    return `
      <div class="scale-card ${st.enabled ? (done ? 'completed' : 'enabled') : 'disabled'}" data-id="${scale.id}">
        <div class="scale-card-badge ${badgeCls}">${TR(scale.category)}</div>
        <div class="scale-card-name">${TR(scale.name)}</div>
        <div class="scale-card-full">${TR(scale.fullName)}</div>
        <div class="scale-card-desc">${TR(scale.description)}</div>
        <div class="scale-card-meta">
          <span class="meta-tag">⏱ ${L3(`約${scale.estimatedMinutes}分鐘`,`约${scale.estimatedMinutes}分钟`,`~${scale.estimatedMinutes} min`)}</span>
          <span class="meta-tag">👤 ${ageLabel}</span>
          <span class="meta-tag">✍️ ${L3(`${rolesLabel}填答`,`${rolesLabel}填答`,`By ${rolesLabel}`)}</span>
        </div>
        ${actionHtml}
      </div>`;
  }).join('');
}

function renderProfileNotice() {
  return profileComplete() ? '' : `
    <div class="profile-notice">
      <span class="profile-notice-icon">💡</span>
      <span>${TR('請先填寫左側個人資料（受測者出生日期與填答者關係為必填），系統將自動開放適用的量表。')}</span>
    </div>`;
}

// Re-read form fields from the DOM and update S.profile. Runs before any
// scale action so that iPad Safari date-picker quirks (where `change` may
// not fire on a second edit) cannot leave the state stale.
function syncProfileFromDOM() {
  const dob = document.getElementById('f-subjectDOB');
  if (dob && dob.value && dob.value !== S.profile.subjectDOB) {
    S.profile.subjectDOB = dob.value;
    S.profile.subjectAge = ageFromDOB(dob.value);
    const ageEl = document.getElementById('f-subjectAge');
    if (ageEl) ageEl.value = S.profile.subjectAge ? S.profile.subjectAge + L3(' 歲',' 岁',' yrs') : '';
  }
  const name = document.getElementById('f-subjectName');
  if (name && name.value !== S.profile.subjectName) S.profile.subjectName = name.value;
  const gender = document.getElementById('f-subjectGender');
  if (gender && gender.value !== S.profile.subjectGender) S.profile.subjectGender = gender.value;
  const phone = document.getElementById('f-subjectPhone');
  if (phone && phone.value.trim() !== S.profile.subjectPhone) S.profile.subjectPhone = phone.value.trim();
  const email = document.getElementById('f-subjectEmail');
  if (email && email.value.trim() !== S.profile.subjectEmail) S.profile.subjectEmail = email.value.trim();
  const rel = document.getElementById('f-respondentRelationship');
  if (rel && rel.value !== S.profile.respondentRelationship) S.profile.respondentRelationship = rel.value;
}

function bindScaleCardEvents() {
  document.querySelectorAll('.scales-grid [data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      // Re-read DOM in case iPad Safari ate a date-picker change event.
      // If profile state was stale and the click no longer satisfies criteria,
      // refresh the cards so the user sees the correct lock reason.
      syncProfileFromDOM();
      if (action === 'start' || action === 'redo') {
        const scale = SCALES.find(s => s.id === id);
        const st = scale ? getScaleStatus(scale) : { enabled: false };
        if (!st.enabled) { refreshScalesInline(); return; }
      }
      if (action === 'start') {
        S.activeScaleId = id; S.answers = {}; S.copsoqVersion = null;
        S.view = 'questionnaire'; render(); window.scrollTo(0, 0);
      } else if (action === 'redo') {
        S.activeScaleId = id; S.answers = {}; S.copsoqVersion = null;
        delete S.completedReports[id];
        S.view = 'questionnaire'; render(); window.scrollTo(0, 0);
      } else if (action === 'view-report') {
        S.activeScaleId = id; S.copsoqVersion = (S.completedReports[id] && S.completedReports[id].copsoqVersion) || null;
        S.view = 'report'; render(); window.scrollTo(0, 0);
      }
    });
  });
}

function refreshScalesInline() {
  const grid = document.querySelector('.scales-grid');
  if (grid) grid.innerHTML = renderScaleCards();
  const panel = document.querySelector('.scales-panel');
  if (panel) {
    const oldNotice = panel.querySelector('.profile-notice');
    if (oldNotice) oldNotice.remove();
    const noticeHtml = renderProfileNotice();
    if (noticeHtml) {
      const title = panel.querySelector('.section-title');
      if (title) title.insertAdjacentHTML('afterend', noticeHtml);
    }
  }
  bindScaleCardEvents();
}

function renderHome() {
  const cards = renderScaleCards();
  const noticeHtml = renderProfileNotice();

  return `
    <div class="view home-layout">
      <!-- 個人資料面板 -->
      <aside class="profile-panel">
        <div class="profile-header">
          <h2>${TR('個人資料')}</h2>
          <p>${TR('請填寫以下資訊，系統將篩選適用量表')}</p>
        </div>
        <div class="profile-body">
          <div class="profile-divider">${TR('受測者資料')}</div>
          <div class="form-group">
            <label>${TR('姓名')}</label>
            <input type="text" id="f-subjectName" value="${esc(S.profile.subjectName)}" placeholder="${TR('受測者姓名')}">
          </div>
          <div class="form-group">
            <label>${TR('出生日期')} <span style="color:#e74c3c">*</span></label>
            <input type="date" id="f-subjectDOB" value="${esc(S.profile.subjectDOB)}" max="${todayISO()}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${TR('年齡（自動帶入）')}</label>
              <input type="text" id="f-subjectAge" value="${S.profile.subjectAge ? S.profile.subjectAge + L3(' 歲',' 岁',' yrs') : ''}" placeholder="—" readonly>
            </div>
            <div class="form-group">
              <label>${TR('性別')}</label>
              <select id="f-subjectGender">
                <option value="" ${!S.profile.subjectGender ? 'selected' : ''}>${TR('請選擇')}</option>
                <option value="male"   ${S.profile.subjectGender==='male'   ? 'selected' : ''}>${TR('男')}</option>
                <option value="female" ${S.profile.subjectGender==='female' ? 'selected' : ''}>${TR('女')}</option>
                <option value="other"  ${S.profile.subjectGender==='other'  ? 'selected' : ''}>${TR('第三性')}</option>
              </select>
            </div>
          </div>
          ${isProjectLaunched() ? `
          <div class="form-group">
            <label>${TR('聯絡電話')} <span style="color:#e74c3c">*</span></label>
            <input type="tel" id="f-subjectPhone" value="${esc(S.profile.subjectPhone)}" placeholder="${TR('例：0912345678')}" autocomplete="tel">
          </div>
          <div class="form-group">
            <label>${TR('聯絡信箱')} <span style="color:#e74c3c">*</span></label>
            <input type="email" id="f-subjectEmail" value="${esc(S.profile.subjectEmail)}" placeholder="example@email.com" autocomplete="email">
          </div>` : ''}

          <div class="profile-divider">${TR('填答者資料')}</div>
          <div class="form-group">
            <label>${TR('填答者姓名')}</label>
            <input type="text" id="f-respondentName" value="${esc(S.profile.respondentName)}" placeholder="${TR('填答者姓名')}">
          </div>
          <div class="form-group">
            <label>${TR('與受測者關係')} <span style="color:#e74c3c">*</span></label>
            <select id="f-respondentRelationship">
              <option value="" ${!S.profile.respondentRelationship ? 'selected' : ''}>${TR('請選擇')}</option>
              <option value="self"    ${S.profile.respondentRelationship==='self'    ? 'selected' : ''}>${TR('本人')}</option>
              <option value="parent"  ${S.profile.respondentRelationship==='parent'  ? 'selected' : ''}>${TR('父母／監護人')}</option>
              <option value="teacher" ${S.profile.respondentRelationship==='teacher' ? 'selected' : ''}>${TR('教師')}</option>
              <option value="other"   ${S.profile.respondentRelationship==='other'   ? 'selected' : ''}>${TR('其他')}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${TR('評估日期（測驗當日自動帶入）')}</label>
            <input type="text" id="f-assessmentDate" value="${esc(S.profile.assessmentDate)}" readonly>
          </div>
        </div>
      </aside>

      <!-- 量表選擇區 -->
      <main class="scales-panel">
        <div class="section-title">${TR('評量量表')}</div>
        ${noticeHtml}
        <div class="scales-grid">${cards}</div>
        <p class="disclaimer">
          ${TR('本系統提供之評量結果僅供參考，不構成任何診斷依據。')}<br>
          ${TR('如有相關疑慮，請洽專業醫師或心理師進行完整評估。')}
        </p>
      </main>
    </div>`;
}

// ─────────────────────────────────────────
// 問卷渲染
// ─────────────────────────────────────────
// 版本選擇晶片（短／中／長）— 僅 versioned 量表（COPSOQ）顯示
function renderVersionSelector(scale, total) {
  if (!scale.versioned) return '';
  const cur = activeVersion(scale);
  const labels = {
    short:  L3('短版', '短版', 'Short'),
    middle: L3('中版', '中版', 'Middle'),
    long:   L3('長版', '長版', 'Long')
  };
  const chips = (scale.versions || []).map(v => `
    <button class="ver-chip ${v === cur ? 'active' : ''}" data-action="copsoq-ver" data-ver="${v}">${labels[v]}</button>
  `).join('');
  return `
    <div class="ver-selector">
      <span class="ver-selector-label">${L3('問卷版本', '问卷版本', 'Version')}</span>
      <div class="ver-chips">${chips}</div>
      <span class="ver-selector-count">${L3(`共 ${total} 題`, `共 ${total} 题`, `${total} items`)}</span>
    </div>`;
}

function renderQuestionnaire() {
  const scale = SCALES.find(s => s.id === S.activeScaleId);
  if (!scale) return `<p>${TR('錯誤：找不到量表')}</p>`;

  // 計算題目總數與已答數
  const allQ = getAllQuestions(scale);
  const total = allQ.length;
  const answered = allQ.filter(q => S.answers[q.id] !== undefined).length;
  const pct = total > 0 ? Math.round(answered / total * 100) : 0;

  // 版本過濾後的可見題目與連續顯示編號（versioned 量表會跳過不屬於該版本的題）
  const visibleIds = new Set(allQ.map(q => q.id));
  const numMap = {};
  allQ.forEach((q, i) => { numMap[q.id] = i + 1; });

  const sectionsHtml = scale.sections.map(section => {
    const visibleQ = section.questions.filter(q => visibleIds.has(q.id));
    if (!visibleQ.length) return '';

    const sectionHeader = section.label
      ? `<div class="q-section-header">📋 ${TR(section.label)}</div>` : '';
    const sectionNote = section.note
      ? `<div class="q-section-note">ℹ️ ${TR(section.note)}</div>` : '';

    const questionsHtml = visibleQ.map(q => {
      const val = S.answers[q.id];
      const isAnswered = val !== undefined;
      const isFlag = q.flag && val && val > 0;

      // 決定選項樣式
      const optCount = q.options.length;
      let optClass = 'opt4';
      if (optCount === 2)  optClass = 'yn';
      else if (optCount === 5 && q.options[0].label.length > 6) optClass = 'opt5';
      else if (optCount === 5) optClass = 'likert';

      const optionsHtml = q.options.map(opt => {
        const sel = val === opt.value ? 'selected' : '';
        return `<button class="opt-btn ${sel}" data-qid="${q.id}" data-val="${opt.value}">${TR(opt.label)}</button>`;
      }).join('');

      return `
        <div class="q-item ${isAnswered ? 'answered' : ''} ${isFlag ? 'flagged' : ''}" id="q-${q.id}" data-no="${numMap[q.id]}">
          <div class="q-num">${numMap[q.id]}</div>
          <div>
            <div class="q-text">${TR(q.text)}</div>
            <div class="q-options ${optClass}">${optionsHtml}</div>
          </div>
        </div>`;
    }).join('');

    return `<div class="q-section">${sectionHeader}${sectionNote}${questionsHtml}</div>`;
  }).join('');

  const canSubmit = answered === total;

  return `
    <div class="view">
      <!-- 標題列 -->
      <div class="q-header">
        <div class="q-title-area">
          <h1>${TR(scale.fullName)}</h1>
          <p>${TR('受測者：')}${esc(S.profile.subjectName) || L3('（未填寫）','（未填写）','(not filled)')} ／ ${TR('填答者：')}${esc(S.profile.respondentName) || L3('（未填寫）','（未填写）','(not filled)')}</p>
        </div>
        <div class="q-progress-area">
          <div class="q-progress-label">${L3(`${answered} / ${total} 題已作答（${pct}%）`, `${answered} / ${total} 题已作答（${pct}%）`, `${answered} / ${total} answered (${pct}%)`)}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
      </div>

      <!-- 版本選擇器（versioned 量表） -->
      ${renderVersionSelector(scale, total)}

      <!-- 作答說明 -->
      <div class="q-instructions">${TR(scale.instructions)}</div>

      <!-- 題目區 -->
      ${sectionsHtml}

      <!-- 底部操作列 -->
      <div class="q-footer">
        <button class="btn-back" data-action="back-home">${L3('← 返回首頁','← 返回首页','← Home')}</button>
        <div class="q-answered-count">${L3(`已完成 <strong>${answered}</strong> / ${total} 題`, `已完成 <strong>${answered}</strong> / ${total} 题`, `Done <strong>${answered}</strong> / ${total}`)}</div>
        <button class="btn-submit" data-action="submit" ${canSubmit ? '' : 'disabled'}>
          ${canSubmit ? L3('✓ 完成並查看報告','✓ 完成并查看报告','✓ Finish & view report') : L3(`尚餘 ${total - answered} 題未作答`,`尚余 ${total - answered} 题未作答`,`${total - answered} item(s) remaining`)}
        </button>
      </div>
    </div>`;
}

// ─────────────────────────────────────────
// 報告渲染
// ─────────────────────────────────────────
// Build standalone HTML report containing every completed scale, with embedded
// CSS so admins can open it in any browser. Used when sending to backend
// (finalize → R2 → admin "報告" download button).
function buildReportHTML() {
  const ids = Object.keys(S.completedReports);
  if (!ids.length) return null;
  const p = S.profile;
  const genderMap = { male:TR('男'), female:TR('女'), other:TR('第三性') };
  const relMap = { self:TR('本人'), parent:TR('父母／監護人'), teacher:TR('教師'), other:TR('其他') };
  const prevId = S.activeScaleId;
  const sections = ids.map(id => {
    S.activeScaleId = id;
    const scale = SCALES.find(s => s.id === id);
    if (!scale) return '';
    const report = S.completedReports[id];
    let body = '';
    if (scale.scoring.type === 'sum')               body = renderSumReport(report, scale);
    else if (scale.scoring.type === 'subscale_sum') body = renderSubscaleSumReport(report, scale);
    else if (scale.scoring.type === 'subscale_avg') body = renderSubscaleAvgReport(report, scale);
    else if (scale.scoring.type === 'vanderbilt')   body = renderVanderbiltReport(report, scale);
    else if (scale.scoring.type === 'bach')         body = renderBachReport(report, scale);
    else if (scale.scoring.type === 'mdq')          body = renderMdqReport(report, scale);
    else if (scale.scoring.type === 'audit')        body = renderAuditReport(report, scale);
    else if (scale.scoring.type === 'copsoq')       body = renderCopsoqReport(report, scale);
    const flags = (report.flags || []).map(f => `<div class="report-flag">⚠️ ${TR(f.message)}</div>`).join('');
    return `
      <section class="report-section-doc">
        <h2 class="report-scale-name">${TR(scale.fullName)}</h2>
        ${flags}
        ${body}
      </section>`;
  });
  S.activeScaleId = prevId;
  const styles = `
    body { font-family: -apple-system, "Helvetica Neue", "PingFang TC", "Noto Sans TC", sans-serif; background:#f7f5ee; color:#1f1d1a; margin:0; padding:24px; }
    .doc-wrap { max-width: 880px; margin: 0 auto; background: #fff; padding: 32px 36px; border-radius: 12px; box-shadow: 0 1px 6px rgba(0,0,0,.06); }
    .doc-header { border-bottom: 1px solid #e5e1d6; padding-bottom: 16px; margin-bottom: 24px; }
    .doc-brand { font-weight: 700; font-size: 1.1rem; letter-spacing: .04em; color: #2c3e50; }
    .doc-subtitle { color: #6b6b6b; font-size: .85rem; margin-top: 4px; font-style: italic; }
    .doc-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; margin-top: 12px; font-size: .85rem; color: #444; }
    .doc-meta strong { color: #1f1d1a; font-weight: 600; }
    .report-section-doc { margin-bottom: 32px; padding-top: 8px; border-top: 1px solid #eee; }
    .report-section-doc:first-of-type { border-top: none; padding-top: 0; }
    .report-scale-name { font-size: 1.15rem; color: #2c3e50; margin: 12px 0 14px; }
    .report-summary { padding: 12px 16px; border-radius: 8px; border: 1.5px solid #ddd; margin: 8px 0 14px; }
    .report-summary-label { font-size: .75rem; opacity: .7; margin-bottom: 4px; }
    .report-summary-result { font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; }
    .report-summary-score { font-size: .9rem; margin-bottom: 4px; }
    .report-summary-note { font-size: .8rem; opacity: .85; line-height: 1.5; }
    .report-section { margin: 14px 0; }
    .report-section-title { font-weight: 600; font-size: .92rem; margin-bottom: 8px; color: #2c3e50; }
    table { width: 100%; border-collapse: collapse; font-size: .85rem; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #faf8f0; font-weight: 600; }
    .mini-bar { height: 6px; background: #eee; border-radius: 3px; overflow: hidden; min-width: 80px; }
    .mini-bar-fill { height: 100%; }
    .dsm-badge { padding: 2px 8px; border-radius: 4px; font-size: .75rem; font-weight: 600; }
    .report-flag { background: #fff3e0; border-left: 3px solid #f59e0b; padding: 8px 12px; margin: 8px 0; font-size: .85rem; color: #92400e; border-radius: 4px; }
    .disclaimer { font-size: .75rem; color: #888; line-height: 1.6; margin-top: 24px; padding-top: 14px; border-top: 1px dashed #ddd; }
  `;
  return `<!DOCTYPE html>
<html lang="${(window.I18N && I18N.htmlLang(I18N.lang)) || 'zh-TW'}"><head><meta charset="UTF-8"><title>${L3('ScalarMynd 評估報告','ScalarMynd 评估报告','ScalarMynd Assessment Report')} — ${esc(p.subjectName) || ''}</title>
<style>${styles}</style></head><body>
  <div class="doc-wrap">
    <div class="doc-header">
      <div class="doc-brand">ScalarMynd ─ Measuring the depth of your mind</div>
      <div class="doc-subtitle">${TR('心理與行為健康評量報告')}</div>
      <div class="doc-meta">
        <div>${TR('受測者：')}<strong>${esc(p.subjectName) || '─'}</strong></div>
        <div>${TR('性別：')}<strong>${genderMap[p.subjectGender] || '─'}</strong></div>
        <div>${TR('年齡：')}<strong>${p.subjectAge ? p.subjectAge + L3(' 歲',' 岁',' yrs') : '─'}</strong></div>
        <div>${TR('出生日期：')}<strong>${esc(p.subjectDOB) || '─'}</strong></div>
        <div>${TR('填答者：')}<strong>${esc(p.respondentName) || '─'}</strong></div>
        <div>${TR('關係：')}<strong>${relMap[p.respondentRelationship] || '─'}</strong></div>
        <div>${TR('聯絡電話：')}<strong>${esc(p.subjectPhone) || '─'}</strong></div>
        <div>${TR('聯絡信箱：')}<strong>${esc(p.subjectEmail) || '─'}</strong></div>
        <div>${TR('評估日期：')}<strong>${esc(p.assessmentDate)}</strong></div>
      </div>
    </div>
    ${sections.join('')}
    <p class="disclaimer">${TR('本報告結果僅供參考，不構成任何診斷依據。如有相關疑慮，請洽專業醫師或臨床心理師進行完整評估。')}</p>
  </div>
</body></html>`;
}

function renderReport() {
  const report = S.completedReports[S.activeScaleId];
  if (!report) return `<p>${TR('錯誤：找不到報告')}</p>`;

  const scale = SCALES.find(s => s.id === S.activeScaleId);
  const p = S.profile;

  const genderMap = { male:TR('男'), female:TR('女'), other:TR('第三性') };
  const relMap = { self:TR('本人'), parent:TR('父母／監護人'), teacher:TR('教師'), other:TR('其他') };

  let bodyHtml = '';

  if (scale.scoring.type === 'sum') {
    bodyHtml = renderSumReport(report, scale);
  } else if (scale.scoring.type === 'subscale_sum') {
    bodyHtml = renderSubscaleSumReport(report, scale);
  } else if (scale.scoring.type === 'subscale_avg') {
    bodyHtml = renderSubscaleAvgReport(report, scale);
  } else if (scale.scoring.type === 'vanderbilt') {
    bodyHtml = renderVanderbiltReport(report, scale);
  } else if (scale.scoring.type === 'bach') {
    bodyHtml = renderBachReport(report, scale);
  } else if (scale.scoring.type === 'mdq') {
    bodyHtml = renderMdqReport(report, scale);
  } else if (scale.scoring.type === 'audit') {
    bodyHtml = renderAuditReport(report, scale);
  } else if (scale.scoring.type === 'copsoq') {
    bodyHtml = renderCopsoqReport(report, scale);
  }

  // Flags
  const flagsHtml = (report.flags || []).map(f =>
    `<div class="report-flag">⚠️ ${TR(f.message)}</div>`
  ).join('');

  return `
    <div class="view">
      <div class="report-container">
        <div class="report-header">
          <div class="report-brand">ScalarMynd ─ Measuring the depth of your mind</div>
          <div class="report-scale-name">${TR(scale.fullName)}</div>
          <div class="report-meta-row">
            <div class="report-meta-item">${TR('受測者：')}<strong>${esc(p.subjectName) || '─'}</strong></div>
            <div class="report-meta-item">${TR('年齡：')}<strong>${p.subjectAge ? p.subjectAge + L3(' 歲',' 岁',' yrs') : '─'}</strong></div>
            <div class="report-meta-item">${TR('性別：')}<strong>${genderMap[p.subjectGender] || '─'}</strong></div>
            <div class="report-meta-item">${TR('填答者：')}<strong>${esc(p.respondentName) || '─'}</strong></div>
            <div class="report-meta-item">${TR('關係：')}<strong>${relMap[p.respondentRelationship] || '─'}</strong></div>
            <div class="report-meta-item">${TR('聯絡電話：')}<strong>${esc(p.subjectPhone) || '─'}</strong></div>
            <div class="report-meta-item">${TR('聯絡信箱：')}<strong>${esc(p.subjectEmail) || '─'}</strong></div>
            <div class="report-meta-item">${TR('評估日期：')}<strong>${esc(p.assessmentDate)}</strong></div>
          </div>
        </div>

        <div class="report-body">
          ${flagsHtml}
          ${bodyHtml}
          <p class="disclaimer">
            ${TR('本報告結果僅供參考，不構成任何診斷依據。如有相關疑慮，請洽專業醫師或臨床心理師進行完整評估。')}
          </p>
        </div>

        <div class="report-actions">
          <button class="btn-print" onclick="window.print()">${L3('🖨 列印報告','🖨 打印报告','🖨 Print')}</button>
          <button class="btn-new-scale" data-action="back-home">${L3('← 返回主頁選擇其他量表','← 返回主页选择其他量表','← Back to scale list')}</button>
        </div>
      </div>
    </div>`;
}

// ── 計分：sum（GDS-15, PHQ-9）
function renderSumReport(report, scale) {
  const sc = scale.scoring;
  const sub = sc.subscales[0];
  const total = report.subscores[sub.id];
  const maxScore = sub.questionIds.length * Math.max(...getAllQuestions(scale).map(q => Math.max(...q.options.map(o => o.value))));
  const interp = getRange(sc.interpretation.ranges, total);

  const summaryStyle = `background:${interp.color}18; border-color:${interp.color}; color:${interp.color};`;

  return `
    <div class="report-summary" style="${summaryStyle}">
      <div class="report-summary-label">${TR('評估結果')}</div>
      <div class="report-summary-result">${TR(interp.label)}</div>
      <div class="report-summary-score">${L3(`總分：${total} 分（滿分 ${getMaxSum(scale)} 分）`, `总分：${total} 分（满分 ${getMaxSum(scale)} 分）`, `Total: ${total} (max ${getMaxSum(scale)})`)}</div>
      <div class="report-summary-note">${TR(interp.note)}</div>
    </div>
    ${renderScoreBreakdown(scale, report)}`;
}

// ── 計分：subscale_sum（ASRS）
function renderSubscaleSumReport(report, scale) {
  const sc = scale.scoring;
  const rows = sc.subscales.map(sub => {
    const score = report.subscores[sub.id];
    const maxS = sub.maxScore;
    const pct = Math.round(score / maxS * 100);
    const interp = getRange(sc.interpretation.subscales[sub.id].ranges, score);
    return `
      <tr>
        <td><strong>${TR(sub.name)}</strong></td>
        <td>${score} / ${maxS}</td>
        <td class="score-bar-cell">
          <div class="mini-bar">
            <div class="mini-bar-fill" style="width:${pct}%; background:${interp.color}"></div>
          </div>
        </td>
        <td><span class="dsm-badge" style="background:${interp.color}20; color:${interp.color}">${TR(interp.label)}</span></td>
      </tr>`;
  }).join('');

  // Part A 篩查結果
  const partAPositive = report.partAPositive;
  const screenHtml = partAPositive !== undefined ? `
    <div class="report-section">
      <div class="report-section-title">Part A ${TR('快速篩查結果')}</div>
      <div class="report-summary" style="background:${partAPositive ? '#fde8e820' : '#e8f8ee20'}; border-color:${partAPositive ? '#e74c3c' : '#27ae60'}; color:${partAPositive ? '#e74c3c' : '#27ae60'}">
        <div class="report-summary-result">${partAPositive ? TR('篩查陽性（建議進一步評估）') : TR('篩查陰性')}</div>
        <div class="report-summary-note">${partAPositive
          ? 'Part A ' + TR('篩查顯示有明顯ADHD症狀風險，建議由專業醫師進行完整診斷評估。')
          : 'Part A ' + TR('篩查結果未達陽性門檻，但全量表仍可提供參考。')}</div>
      </div>
    </div>` : '';

  return `
    ${screenHtml}
    <div class="report-section">
      <div class="report-section-title">${TR('各分向度得分')}</div>
      <table class="score-table">
        <thead><tr><th>${TR('向度')}</th><th>${TR('得分')}</th><th>${TR('分布')}</th><th>${TR('程度')}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${renderScoreBreakdown(scale, report)}`;
}

// ── 計分：subscale_avg（SNAP-IV）
function renderSubscaleAvgReport(report, scale) {
  const sc = scale.scoring;
  const rows = sc.subscales.map(sub => {
    const avg = report.subscoreAvgs[sub.id].toFixed(2);
    const positives = report.positiveItems[sub.id];
    const meetsThreshold = positives >= sub.dsmRequired;
    const pct = Math.round(report.subscoreAvgs[sub.id] / 3 * 100);
    return `
      <tr>
        <td><strong>${TR(sub.name)}</strong></td>
        <td>${L3(`平均 ${avg} / 3.00`, `平均 ${avg} / 3.00`, `Mean ${avg} / 3.00`)}</td>
        <td class="score-bar-cell">
          <div class="mini-bar">
            <div class="mini-bar-fill" style="width:${pct}%; background:${meetsThreshold ? '#e74c3c' : '#27ae60'}"></div>
          </div>
        </td>
        <td>${L3(`陽性題數：${positives}/${sub.questionIds.length}`, `阳性题数：${positives}/${sub.questionIds.length}`, `Positive items: ${positives}/${sub.questionIds.length}`)}
          <br><span class="dsm-badge ${meetsThreshold ? 'dsm-positive' : 'dsm-negative'}">
            ${meetsThreshold ? L3(`✗ 達門檻（≥${sub.dsmRequired}題）`,`✗ 达门槛（≥${sub.dsmRequired}题）`,`✗ Threshold met (≥${sub.dsmRequired})`) : L3('✓ 未達門檻','✓ 未达门槛','✓ Below threshold')}
          </span>
        </td>
      </tr>`;
  }).join('');

  const overallRule = sc.interpretation.rules.find(r => r.condition === report.overallCondition);
  const summaryStyle = `background:${overallRule.color}18; border-color:${overallRule.color}; color:${overallRule.color};`;

  // ODD summary
  const oddSub = sc.subscales.find(s => s.id === 'odd');
  const oddHtml = oddSub && report.oddPositive ? `
    <div class="report-flag">⚠️ ${L3(`對立反抗向度（ODD）達DSM-IV門檻（陽性題數 ${report.positiveItems['odd']} ≥ ${oddSub.dsmRequired}），建議轉介專業評估。`, `对立反抗向度（ODD）达DSM-IV门槛（阳性题数 ${report.positiveItems['odd']} ≥ ${oddSub.dsmRequired}），建议转介专业评估。`, `Oppositional Defiant (ODD) meets the DSM-IV threshold (positive items ${report.positiveItems['odd']} ≥ ${oddSub.dsmRequired}); referral for professional evaluation is recommended.`)}</div>` : '';

  return `
    <div class="report-summary" style="${summaryStyle}">
      <div class="report-summary-label">ADHD ${TR('綜合評估')}</div>
      <div class="report-summary-result">${TR(overallRule.label)}</div>
      <div class="report-summary-note">${L3('各向度平均分 ≥ 2.0 且 ≥ 指定題數達陽性標準（評分 ≥ 2）為符合DSM-IV診斷門檻。本結果僅供參考，診斷需由專業醫師判定。', '各向度平均分 ≥ 2.0 且 ≥ 指定题数达阳性标准（评分 ≥ 2）为符合DSM-IV诊断门槛。本结果仅供参考，诊断需由专业医师判定。', 'A subscale mean ≥ 2.0 with at least the required number of positive items (rated ≥ 2) meets the DSM-IV threshold. This result is for reference only; diagnosis must be made by a qualified physician.')}</div>
    </div>
    ${oddHtml}
    <div class="report-section">
      <div class="report-section-title">${TR('各向度分析')}</div>
      <table class="score-table">
        <thead><tr><th>${TR('向度')}</th><th>${TR('平均分')}</th><th>${TR('分布')}</th><th>DSM-IV${TR('門檻')}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${renderScoreBreakdown(scale, report)}`;
}

// ── 計分：vanderbilt
function renderVanderbiltReport(report, scale) {
  const sc = scale.scoring;
  const rows = sc.symptomSubscales.map(sub => {
    const positives = report.positiveItems[sub.id];
    const total = report.subtotals[sub.id];
    const maxT = sub.questionIds.length * 3;
    const pct = Math.round(total / maxT * 100);
    const meets = positives >= sub.dsmRequired;
    return `
      <tr>
        <td><strong>${TR(sub.name)}</strong></td>
        <td>${total} / ${maxT}</td>
        <td class="score-bar-cell">
          <div class="mini-bar">
            <div class="mini-bar-fill" style="width:${pct}%; background:${meets ? '#e74c3c' : '#3a8fd4'}"></div>
          </div>
        </td>
        <td>${L3(`陽性題數：${positives}/${sub.questionIds.length}`, `阳性题数：${positives}/${sub.questionIds.length}`, `Positive items: ${positives}/${sub.questionIds.length}`)}
          <br><span class="dsm-badge ${meets ? 'dsm-positive' : 'dsm-negative'}">
            ${meets ? L3(`✗ 達門檻（≥${sub.dsmRequired}題）`,`✗ 达门槛（≥${sub.dsmRequired}题）`,`✗ Threshold met (≥${sub.dsmRequired})`) : L3('✓ 未達門檻','✓ 未达门槛','✓ Below threshold')}
          </span>
        </td>
      </tr>`;
  }).join('');

  const perfSub = sc.performanceSubscale;
  const impaired = report.performanceImpaired;
  const perfRows = perfSub.questionIds.map(qid => {
    const allQ = getAllQuestions(scale);
    const q = allQ.find(x => x.id === qid);
    const val = S.answers[qid];
    const isImpaired = val >= perfSub.impairmentThreshold;
    return `<tr>
      <td>${q ? TR(q.text) : qid}</td>
      <td>${['', TR('優秀'), TR('平均以上'), TR('平均'), TR('有點問題'), TR('有嚴重問題')][val] || val}</td>
      <td><span class="dsm-badge ${isImpaired ? 'dsm-positive' : 'dsm-negative'}">${isImpaired ? TR('有功能障礙') : TR('尚可')}</span></td>
    </tr>`;
  }).join('');

  // Overall diagnosis
  const diagList = report.diagnoses || [];
  const diagHtml = diagList.length > 0
    ? diagList.map(d => `<span class="dsm-badge dsm-positive" style="margin:3px 4px; display:inline-block">${TR(d)}</span>`).join('')
    : `<span class="dsm-badge dsm-negative">${TR('未達任何主要診斷門檻')}</span>`;

  return `
    <div class="report-section">
      <div class="report-section-title">${TR('主要診斷門檻評估')}</div>
      <div style="padding: 12px 0">${diagHtml}</div>
      <p style="font-size:12px; color:var(--text-muted); margin-top:8px">* ${TR('達門檻表示該向度症狀數量符合DSM-IV診斷標準，最終診斷須由專業醫師判定。')}</p>
    </div>
    <div class="report-section">
      <div class="report-section-title">${TR('症狀向度得分')}</div>
      <table class="score-table">
        <thead><tr><th>${TR('向度')}</th><th>${TR('總分')}</th><th>${TR('分布')}</th><th>DSM-IV${TR('門檻')}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="report-section">
      <div class="report-section-title">${TR('功能表現評估')}</div>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom:10px">${L3('功能障礙定義：評分 ≥ 4（有點問題／有嚴重問題）','功能障碍定义：评分 ≥ 4（有点问题／有严重问题）','Impairment defined as a rating ≥ 4 (Somewhat of a problem / Problematic)')}</p>
      <table class="score-table">
        <thead><tr><th>${TR('項目')}</th><th>${TR('評分')}</th><th>${TR('功能狀態')}</th></tr></thead>
        <tbody>${perfRows}</tbody>
      </table>
      ${impaired > 0 ? `<p style="margin-top:10px; font-size:13px; color:var(--orange)">${L3(`共 <strong>${impaired}</strong> 個功能領域出現障礙（評分 ≥ 4）。`, `共 <strong>${impaired}</strong> 个功能领域出现障碍（评分 ≥ 4）。`, `<strong>${impaired}</strong> functional domain(s) show impairment (rating ≥ 4).`)}</p>` : ''}
    </div>
    ${renderScoreBreakdown(scale, report)}`;
}

// ── 計分：bach
function renderBachReport(report, scale) {
  const sc = scale.scoring;
  const threshold = sc.significantThreshold;
  const byCategory = report.byCategory;

  const totalHighlighted = Object.values(byCategory).flat().filter(i => i.score >= threshold).length;

  const summaryColor = totalHighlighted === 0 ? '#27ae60' : totalHighlighted <= 5 ? '#f39c12' : '#e74c3c';

  const categoriesHtml = scale.sections.map(section => {
    const items = byCategory[section.id] || [];
    const catLabel = TR(sc.categoryLabels[section.id] || section.label);

    const itemsHtml = items.map(item => {
      const significant = item.score >= 5;
      const notable = item.score >= threshold;
      const dotColor = significant ? '#e74c3c' : notable ? '#f39c12' : '#bdc3c7';
      return `
        <div class="bach-item ${significant ? 'very-significant' : notable ? 'significant' : ''}">
          <div class="bach-score-dot" style="background:${dotColor}20; color:${dotColor}">${item.score}</div>
          <div style="flex:1; font-size:13px">${TR(item.text)}</div>
          ${notable ? `<div style="font-size:11px; color:${dotColor}; font-weight:700; white-space:nowrap">${significant ? TR('非常顯著') : TR('值得關注')}</div>` : ''}
        </div>`;
    }).join('');

    const hasSignificant = items.some(i => i.score >= threshold);
    return `
      <div class="bach-category">
        <div class="bach-category-title">${catLabel} ${hasSignificant ? '⚡' : ''}</div>
        ${itemsHtml}
      </div>`;
  }).join('');

  return `
    <div class="report-summary" style="background:${summaryColor}18; border-color:${summaryColor}; color:${summaryColor}">
      <div class="report-summary-label">${TR('情緒評估摘要')}</div>
      <div class="report-summary-result">
        ${totalHighlighted === 0 ? TR('情緒狀態良好') : L3(`共 ${totalHighlighted} 個情緒面向值得關注`, `共 ${totalHighlighted} 个情绪面向值得关注`, `${totalHighlighted} emotional dimension(s) worth attention`)}
      </div>
      <div class="report-summary-note">
        ${L3(`評分 ≥ ${threshold} 分為值得關注的情緒面向，≥ 5 分為非常顯著。以下結果僅供自我覺察參考。`, `评分 ≥ ${threshold} 分为值得关注的情绪面向，≥ 5 分为非常显著。以下结果仅供自我觉察参考。`, `A rating ≥ ${threshold} marks a dimension worth attention; ≥ 5 is highly significant. The results below are for self-awareness reference only.`)}
      </div>
    </div>
    <div class="report-section">
      <div class="report-section-title">${L3('各情緒面向評估結果（1=完全不符合，5=非常符合）','各情绪面向评估结果（1=完全不符合，5=非常符合）','Results by emotional dimension (1 = Not at all, 5 = Completely)')}</div>
      ${categoriesHtml}
    </div>`;
}

// ── 計分：mdq
function renderMdqReport(report, scale) {
  const sc = scale.scoring;
  const positive = report.mdqPositive;
  const color = positive ? '#e74c3c' : '#27ae60';
  const summaryStyle = `background:${color}18; border-color:${color}; color:${color};`;

  const impairmentLabel = [TR('沒有問題'),TR('輕度問題'),TR('中度問題'),TR('嚴重問題')][report.impairment] || '─';

  return `
    <div class="report-summary" style="${summaryStyle}">
      <div class="report-summary-label">MDQ ${TR('篩查結果')}</div>
      <div class="report-summary-result">${positive ? TR('篩查陽性（建議進一步評估）') : TR('篩查陰性')}</div>
      <div class="report-summary-note">
        ${positive
          ? TR('結果符合 MDQ 陽性條件，建議由精神科醫師進行雙相情感障礙完整評估。本結果僅供參考，最終診斷須由專業醫師判定。')
          : TR('目前結果未達 MDQ 陽性條件。若仍有疑慮，請尋求專業協助。')}
      </div>
    </div>
    <div class="report-section">
      <div class="report-section-title">${TR('篩查條件評估')}</div>
      <table class="score-table">
        <thead><tr><th>${TR('條件')}</th><th>${TR('結果')}</th><th>${TR('是否符合')}</th></tr></thead>
        <tbody>
          <tr>
            <td>${L3(`第一部分：症狀數量（≥${sc.symptomThreshold} 項回答「是」）`, `第一部分：症状数量（≥${sc.symptomThreshold} 项回答「是」）`, `Part 1: Symptom count (≥${sc.symptomThreshold} answered "Yes")`)}</td>
            <td>${report.symptomPositive} / ${sc.symptomIds.length}</td>
            <td><span class="dsm-badge ${report.symptomPositive >= sc.symptomThreshold ? 'dsm-positive' : 'dsm-negative'}">
              ${report.symptomPositive >= sc.symptomThreshold ? L3('✗ 達門檻','✗ 达门槛','✗ Met') : L3('✓ 未達門檻','✓ 未达门槛','✓ Not met')}
            </span></td>
          </tr>
          <tr>
            <td>${TR('第二部分：症狀同時發生')}</td>
            <td>${report.concurrent ? TR('是') : TR('否')}</td>
            <td><span class="dsm-badge ${report.concurrent ? 'dsm-positive' : 'dsm-negative'}">
              ${report.concurrent ? L3('✗ 是','✗ 是','✗ Yes') : L3('✓ 否','✓ 否','✓ No')}
            </span></td>
          </tr>
          <tr>
            <td>${L3('第三部分：困擾程度（≥中度問題）','第三部分：困扰程度（≥中度问题）','Part 3: Impairment (≥ Moderate problem)')}</td>
            <td>${impairmentLabel}</td>
            <td><span class="dsm-badge ${report.impairment >= sc.impairmentThreshold ? 'dsm-positive' : 'dsm-negative'}">
              ${report.impairment >= sc.impairmentThreshold ? L3('✗ 達門檻','✗ 达门槛','✗ Met') : L3('✓ 未達門檻','✓ 未达门槛','✓ Not met')}
            </span></td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:12px; color:var(--text-muted); margin-top:8px">
        ${L3(`* MDQ 陽性需同時滿足：第一部分 ≥${sc.symptomThreshold} 項陽性、第二部分為「是」、第三部分困擾程度 ≥ 中度。`, `* MDQ 阳性需同时满足：第一部分 ≥${sc.symptomThreshold} 项阳性、第二部分为「是」、第三部分困扰程度 ≥ 中度。`, `* An MDQ-positive screen requires all three: Part 1 ≥${sc.symptomThreshold} positive, Part 2 "Yes", and Part 3 impairment ≥ Moderate.`)}
      </p>
    </div>
    ${renderScoreBreakdown(scale, report)}`;
}

// ── 計分：audit
function renderAuditReport(report, scale) {
  const sc = scale.scoring;
  const r = report.range;
  const summaryStyle = `background:${r.color}18; border-color:${r.color}; color:${r.color};`;
  const genderNote = report.cutoffLabel === '女性切點'
    ? L3(`女性以 ${sc.cutoffFemale} 分為問題性飲酒切點`, `女性以 ${sc.cutoffFemale} 分为问题性饮酒切点`, `Cutoff for women: ${sc.cutoffFemale}`)
    : L3(`男性以 ${sc.cutoffMale} 分為問題性飲酒切點`, `男性以 ${sc.cutoffMale} 分为问题性饮酒切点`, `Cutoff for men: ${sc.cutoffMale}`);

  return `
    <div class="report-summary" style="${summaryStyle}">
      <div class="report-summary-label">AUDIT ${TR('評估結果')}</div>
      <div class="report-summary-result">${TR(r.label)}</div>
      <div class="report-summary-score">${L3(`總分：${report.total} / 40 分（${genderNote}）`, `总分：${report.total} / 40 分（${genderNote}）`, `Total: ${report.total} / 40 (${genderNote})`)}</div>
      <div class="report-summary-note">${TR(r.note)}</div>
    </div>
    <div class="report-section">
      <div class="report-section-title">${TR('分數區間說明')}</div>
      <table class="score-table">
        <thead><tr><th>${TR('分數區間')}</th><th>${TR('分類')}</th><th>${TR('建議')}</th></tr></thead>
        <tbody>
          ${sc.ranges.map(rg => `
            <tr ${report.total >= rg.min && report.total <= rg.max ? 'style="background:'+rg.color+'12; font-weight:600"' : ''}>
              <td>${rg.min}–${rg.max}</td>
              <td><span class="dsm-badge" style="background:${rg.color}20; color:${rg.color}">${TR(rg.label)}</span></td>
              <td style="font-size:12px">${TR(rg.note)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${renderScoreBreakdown(scale, report)}`;
}

// ── 計分：copsoq（COPSOQ III，各向度 0–100 + 紅黃綠三區）
function copsoqBand(score, dir) {
  // 回傳 { key, color, label } — demand：高分=不利；resource：高分=有利
  const GOOD = { key: 'good', color: '#27ae60', icon: '🟢', label: TR('良好') };
  const MID  = { key: 'mid',  color: '#f39c12', icon: '🟡', label: TR('中等') };
  const BAD  = { key: 'bad',  color: '#e74c3c', icon: '🔴', label: TR('需關注') };
  const tier = score <= 33.3 ? 'low' : score <= 66.6 ? 'mid' : 'high';
  if (tier === 'mid') return MID;
  if (dir === 'demand') return tier === 'high' ? BAD : GOOD;
  return tier === 'high' ? GOOD : BAD; // resource
}

function renderCopsoqReport(report, scale) {
  const sc = scale.scoring;
  const dims = sc.dimensions;
  const dimScores = report.dimScores || {};
  const verLabel = { short: L3('短版','短版','Short'), middle: L3('中版','中版','Middle'), long: L3('長版','長版','Long') }[report.copsoqVersion] || '';

  // 統計需關注（紅燈）向度
  const badDims = [];
  Object.keys(dimScores).forEach(d => {
    if (!dims[d]) return;
    const b = copsoqBand(dimScores[d].score, dims[d].dir);
    if (b.key === 'bad') badDims.push(TR(dims[d].name));
  });

  const summaryStyle = badDims.length
    ? 'background:#fde8e818; border-color:#e74c3c; color:#c0392b;'
    : 'background:#e8f8ee18; border-color:#27ae60; color:#1e8449;';
  const summary = `
    <div class="report-summary" style="${summaryStyle}">
      <div class="report-summary-label">${TR('職場心理社會風險概覽')}（${verLabel}）</div>
      <div class="report-summary-result">${badDims.length
        ? L3(`${badDims.length} 個向度需關注`, `${badDims.length} 个向度需关注`, `${badDims.length} dimension(s) need attention`)
        : L3('未發現高風險向度','未发现高风险向度','No high-risk dimensions')}</div>
      <div class="report-summary-note">${badDims.length
        ? L3('🔴 需關注：','🔴 需关注：','🔴 Attention: ') + badDims.join('、')
        : L3('各向度均落在中等或良好範圍。','各向度均落在中等或良好范围。','All dimensions fall in the moderate or favourable range.')}</div>
    </div>`;

  // 依領域分組呈現
  const domainsHtml = (sc.domainOrder || []).map(domain => {
    const rows = Object.keys(dims).filter(d => dims[d].domain === domain && dimScores[d]).map(d => {
      const score = dimScores[d].score;
      const band = copsoqBand(score, dims[d].dir);
      const dirTag = dims[d].dir === 'demand'
        ? L3('要求','要求','demand') : L3('資源','资源','resource');
      return `
        <tr>
          <td><strong>${TR(dims[d].name)}</strong> <span class="copsoq-dir">(${dirTag})</span></td>
          <td class="score-bar-cell">
            <div class="mini-bar"><div class="mini-bar-fill" style="width:${score}%; background:${band.color}"></div></div>
          </td>
          <td style="text-align:right; white-space:nowrap;">${score}/100</td>
          <td><span class="dsm-badge" style="background:${band.color}20; color:${band.color}">${band.icon} ${band.label}</span></td>
        </tr>`;
    }).join('');
    if (!rows) return '';
    return `
      <div class="report-section">
        <div class="report-section-title">${TR(domain)}</div>
        <table class="score-table">
          <thead><tr>
            <th>${TR('向度')}</th><th>${TR('分布')}</th><th style="text-align:right;">${L3('得分','得分','Score')}</th><th>${TR('程度')}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }).join('');

  const cdNote = sc.cdNote ? `
    <p class="copsoq-footnote">${L3(
      '※「認知要求」向度本系統採「要求」方向（高分=較高負荷）；國際上此向度方向尚有討論。',
      '※「认知要求」向度本系统采「要求」方向（高分=较高负荷）；国际上此向度方向尚有讨论。',
      '※ "Cognitive Demands" is treated here as a demand (higher = heavier load); its direction is debated internationally.')}</p>` : '';

  const method = `
    <p class="copsoq-footnote">${L3(
      '計分：各向度作答平均轉為 0–100 分，依固定三分位（0–33 / 34–66 / 67–100）配「要求／資源」方向給予紅黃綠燈號（此為啟發式分區，非官方母群三分位）。',
      '计分：各向度作答平均转为 0–100 分，依固定三分位（0–33 / 34–66 / 67–100）配「要求／资源」方向给予红黄绿灯号（此为启发式分区，非官方母群三分位）。',
      'Scoring: each dimension is averaged to 0–100 and coloured by fixed tertiles (0–33 / 34–66 / 67–100) per demand/resource direction (a heuristic split, not official population tertiles).')}</p>`;

  const validityNote = `
    <div class="report-flag" style="background:#fff8e1; border-color:#f0c000; color:#7a5b00;">⚠️ ${L3(
      '繁體中文為本系統依官方英文之台灣譯本；除「疲勞」相關向度採台灣職場疲勞量表用詞外，其餘未經官方心理計量實證。本結果僅供參考，不構成診斷。',
      '繁体中文为本系统依官方英文之台湾译本；除「疲劳」相关向度采台湾职场疲劳量表用词外，其余未经官方心理计量实证。本结果仅供参考，不构成诊断。',
      'Traditional Chinese is this system\'s Taiwan translation of the official English items; except the burnout-related dimensions (Taiwan burnout scale wording), it has not been psychometrically validated. For reference only; not a diagnosis.')}</div>`;

  return `${summary}${validityNote}${domainsHtml}${method}${cdNote}`;
}

// ── 原始作答詳情
function renderScoreBreakdown(scale, report) {
  const allQ = getAllQuestions(scale);
  const rows = allQ.map(q => {
    const val = S.answers[q.id];
    const opt = q.options.find(o => o.value === val);
    return `<tr>
      <td style="width:40px; text-align:center; color:var(--text-muted)">${q.id}</td>
      <td>${TR(q.text)}</td>
      <td style="white-space:nowrap; font-weight:600">${opt ? TR(opt.label) : '─'}</td>
      <td style="text-align:center">${opt ? opt.value : '─'}</td>
    </tr>`;
  }).join('');

  return `
    <div class="report-section">
      <div class="report-section-title">${TR('作答詳細記錄')}</div>
      <table class="score-table">
        <thead><tr><th style="width:40px">${TR('題號')}</th><th>${TR('題目')}</th><th>${TR('作答')}</th><th style="text-align:center">${TR('分值')}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────
// 計分函數
// ─────────────────────────────────────────
function calculateScore(scale, answers) {
  const sc = scale.scoring;
  const result = { flags: [] };

  // Flags
  if (sc.flags) {
    sc.flags.forEach(f => {
      if (f.triggerValues.includes(answers[f.questionId])) {
        result.flags.push({ message: f.message, severity: f.severity });
      }
    });
  }

  if (sc.type === 'sum') {
    const sub = sc.subscales[0];
    result.subscores = {};
    result.subscores[sub.id] = sub.questionIds.reduce((s, id) => s + (answers[id] || 0), 0);

  } else if (sc.type === 'subscale_sum') {
    result.subscores = {};
    sc.subscales.forEach(sub => {
      result.subscores[sub.id] = sub.questionIds.reduce((s, id) => s + (answers[id] || 0), 0);
    });
    // Part A screening
    if (sc.screeningPartA) {
      let posCount = 0;
      sc.screeningPartA.items.forEach(item => {
        if ((answers[item.qId] || 0) >= item.threshold) posCount++;
      });
      result.partAPositive = posCount >= sc.screeningPartA.positiveCount;
    }

  } else if (sc.type === 'subscale_avg') {
    result.subscoreAvgs = {};
    result.positiveItems = {};
    sc.subscales.forEach(sub => {
      const vals = sub.questionIds.map(id => answers[id] || 0);
      result.subscoreAvgs[sub.id] = vals.reduce((s,v)=>s+v,0) / vals.length;
      result.positiveItems[sub.id] = vals.filter(v => v >= sc.positiveItemThreshold).length;
    });
    const innPos = result.positiveItems['inattention']   >= sc.subscales.find(s=>s.id==='inattention').dsmRequired;
    const hypPos = result.positiveItems['hyperactivity'] >= sc.subscales.find(s=>s.id==='hyperactivity').dsmRequired;
    result.overallCondition = innPos && hypPos ? 'both'
      : innPos ? 'inattention_only'
      : hypPos ? 'hyperactivity_only'
      : 'neither';
    // ODD
    const oddSub = sc.subscales.find(s => s.id === 'odd');
    if (oddSub) {
      result.oddPositive = result.positiveItems['odd'] >= oddSub.dsmRequired;
    }

  } else if (sc.type === 'vanderbilt') {
    result.positiveItems = {};
    result.subtotals = {};
    result.diagnoses = [];
    sc.symptomSubscales.forEach(sub => {
      const vals = sub.questionIds.map(id => answers[id] || 0);
      result.subtotals[sub.id] = vals.reduce((s,v)=>s+v,0);
      result.positiveItems[sub.id] = vals.filter(v => v >= sc.positiveThreshold).length;
      if (result.positiveItems[sub.id] >= sub.dsmRequired) {
        if (sub.id === 'inattention')   result.diagnoses.push('ADHD 注意力不集中型');
        if (sub.id === 'hyperactivity') result.diagnoses.push('ADHD 過動／衝動型');
        if (sub.id === 'odd')           result.diagnoses.push('對立反抗症（ODD）');
        if (sub.id === 'cd')            result.diagnoses.push('品行障礙（CD）');
        if (sub.id === 'odd_cd')        result.diagnoses.push('對立反抗／品行問題');
        if (sub.id === 'anxiety')       result.diagnoses.push('焦慮／憂鬱症狀');
      }
    });
    // Combined ADHD
    if (result.diagnoses.includes('ADHD 注意力不集中型') && result.diagnoses.includes('ADHD 過動／衝動型')) {
      result.diagnoses = result.diagnoses.filter(d => d !== 'ADHD 注意力不集中型' && d !== 'ADHD 過動／衝動型');
      result.diagnoses.unshift('ADHD 混合型');
    }
    const perfSub = sc.performanceSubscale;
    result.performanceImpaired = perfSub.questionIds.filter(id => (answers[id] || 1) >= perfSub.impairmentThreshold).length;

  } else if (sc.type === 'bach') {
    result.byCategory = {};
    const allQ = getAllQuestions(scale);
    scale.sections.forEach(section => {
      result.byCategory[section.id] = section.questions.map(q => ({
        id: q.id,
        text: q.text,
        score: answers[q.id] || 1
      }));
    });

  } else if (sc.type === 'mdq') {
    const symPositive = sc.symptomIds.filter(id => answers[id] === 1).length;
    const concurrent = answers[sc.concurrentId] === 1;
    const impairment = answers[sc.impairmentId] || 0;
    const meetsSymCount = symPositive >= sc.symptomThreshold;
    const meetsImpairment = impairment >= sc.impairmentThreshold;
    result.symptomPositive = symPositive;
    result.concurrent = concurrent;
    result.impairment = impairment;
    result.mdqPositive = meetsSymCount && concurrent && meetsImpairment;

  } else if (sc.type === 'audit') {
    const total = sc.questionIds.reduce((s, id) => s + (answers[id] || 0), 0);
    result.total = total;
    const gender = (S.profile.subjectGender || '').toLowerCase();
    const cutoff = gender === 'female' ? sc.cutoffFemale : sc.cutoffMale;
    result.cutoff = cutoff;
    result.cutoffLabel = gender === 'female' ? '女性切點' : '男性切點';
    result.problematic = total >= cutoff;
    result.range = sc.ranges.find(r => total >= r.min && total <= r.max) || sc.ranges[sc.ranges.length - 1];

  } else if (sc.type === 'copsoq') {
    // 各向度：作答題（含反向）平均 → 0–100；未作答題不計入分母
    result.copsoqVersion = activeVersion(scale);
    const qs = getAllQuestions(scale); // 已依版本過濾
    const byDim = {};
    qs.forEach(q => {
      const v = answers[q.id];
      if (v === undefined) return;
      const s = q.rev ? (4 - v) : v;
      (byDim[q.dim] = byDim[q.dim] || []).push(s);
    });
    result.dimScores = {};
    Object.keys(byDim).forEach(dim => {
      const arr = byDim[dim];
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      result.dimScores[dim] = { score: Math.round(mean / 4 * 100), n: arr.length };
    });
  }

  return result;
}

// ─────────────────────────────────────────
// 工具函數
// ─────────────────────────────────────────
// 取得目前作答中（或預設）的版本 — 僅 versioned 量表（COPSOQ）有意義
function activeVersion(scale) {
  if (!scale || !scale.versioned) return null;
  return S.copsoqVersion || scale.defaultVersion;
}

// 依版本過濾題目：short→core；middle→core+middle；long→全部
function getAllQuestions(scale) {
  const all = scale.sections.flatMap(s => s.questions);
  if (!scale.versioned) return all;
  const v = activeVersion(scale);
  const allow = v === 'short' ? ['core']
              : v === 'middle' ? ['core', 'middle']
              : ['core', 'middle', 'long'];
  return all.filter(q => allow.indexOf(q.lvl) !== -1);
}

function getRange(ranges, score) {
  return ranges.find(r => score >= r.min && score <= r.max) || ranges[ranges.length - 1];
}

function getMaxSum(scale) {
  return getAllQuestions(scale).reduce((sum, q) => {
    return sum + Math.max(...q.options.map(o => o.value));
  }, 0);
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ─────────────────────────────────────────
// 事件綁定
// ─────────────────────────────────────────
function bindEvents() {
  // Subject name input
  const subjectNameEl = document.getElementById('f-subjectName');
  if (subjectNameEl) {
    subjectNameEl.addEventListener('input', e => {
      S.profile.subjectName = e.target.value;
      // 若填答者選「本人」，同步姓名
      if (S.profile.respondentRelationship === 'self') {
        S.profile.respondentName = e.target.value;
        const respEl = document.getElementById('f-respondentName');
        if (respEl) respEl.value = e.target.value;
      }
    });
  }

  // DOB → auto-fill age inline, no full re-render.
  // iPad Safari quirk: when the same date input is opened twice (e.g. user
  // first picks an out-of-range date then corrects it), the second commit may
  // fire only `input` (not `change`). Bind all three events so we always
  // capture the latest value.
  const dobEl = document.getElementById('f-subjectDOB');
  if (dobEl) {
    const syncDOB = () => {
      const v = dobEl.value || '';
      if (v === S.profile.subjectDOB) return; // no-op debounce
      S.profile.subjectDOB = v;
      const age = ageFromDOB(v);
      S.profile.subjectAge = age;
      const ageEl = document.getElementById('f-subjectAge');
      if (ageEl) ageEl.value = age ? age + L3(' 歲',' 岁',' yrs') : '';
      refreshScalesInline();
    };
    dobEl.addEventListener('change', syncDOB);
    dobEl.addEventListener('input', syncDOB);
    dobEl.addEventListener('blur', syncDOB);
  }

  // Gender
  const genderEl = document.getElementById('f-subjectGender');
  if (genderEl) {
    genderEl.addEventListener('change', e => {
      S.profile.subjectGender = e.target.value;
      refreshScalesInline();
    });
  }

  // Phone / Email (only present when project-launched; both required)
  const phoneEl = document.getElementById('f-subjectPhone');
  if (phoneEl) {
    phoneEl.addEventListener('input', e => {
      S.profile.subjectPhone = e.target.value.trim();
      refreshScalesInline();
    });
  }
  const emailEl = document.getElementById('f-subjectEmail');
  if (emailEl) {
    emailEl.addEventListener('input', e => {
      S.profile.subjectEmail = e.target.value.trim();
      refreshScalesInline();
    });
  }

  // Respondent name
  const respondentNameEl = document.getElementById('f-respondentName');
  if (respondentNameEl) {
    respondentNameEl.addEventListener('input', e => {
      S.profile.respondentName = e.target.value;
    });
  }

  // Relationship → inline scale refresh + auto-fill name on "self"
  const relEl = document.getElementById('f-respondentRelationship');
  if (relEl) {
    relEl.addEventListener('change', e => {
      S.profile.respondentRelationship = e.target.value;
      if (e.target.value === 'self') {
        S.profile.respondentName = S.profile.subjectName;
        const respEl = document.getElementById('f-respondentName');
        if (respEl) respEl.value = S.profile.subjectName;
      }
      refreshScalesInline();
    });
  }

  // Assessment date is read-only; always reflects today
  const dateEl = document.getElementById('f-assessmentDate');
  if (dateEl) {
    S.profile.assessmentDate = todayStr();
    dateEl.value = S.profile.assessmentDate;
  }

  // Scale action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'start') {
        syncProfileFromDOM();
        const scale = SCALES.find(s => s.id === id);
        const st = scale ? getScaleStatus(scale) : { enabled: false };
        if (!st.enabled) { refreshScalesInline(); return; }
        if (!ensureSubjectSynced()) return;
        S.activeScaleId = id;
        S.answers = {};
        S.copsoqVersion = null;
        S.view = 'questionnaire';
        render();
        window.scrollTo(0, 0);
      } else if (action === 'redo') {
        syncProfileFromDOM();
        const scale = SCALES.find(s => s.id === id);
        const st = scale ? getScaleStatus(scale) : { enabled: false };
        if (!st.enabled) { refreshScalesInline(); return; }
        if (!ensureSubjectSynced()) return;
        S.activeScaleId = id;
        S.answers = {};
        S.copsoqVersion = null;
        delete S.completedReports[id];
        S.view = 'questionnaire';
        render();
        window.scrollTo(0, 0);
      } else if (action === 'copsoq-ver') {
        // 切換問卷版本：若已有作答，先確認再清空
        const scale = SCALES.find(s => s.id === S.activeScaleId);
        const ver = btn.dataset.ver;
        if (!scale || ver === activeVersion(scale)) return;
        const hasAnswers = Object.keys(S.answers).length > 0;
        if (hasAnswers && !confirm(L3(
          '切換版本會清除目前的作答，確定要切換嗎？',
          '切换版本会清除当前的作答，确定要切换吗？',
          'Switching version will clear your current answers. Continue?'))) return;
        S.copsoqVersion = ver;
        S.answers = {};
        render();
        window.scrollTo(0, 0);
      } else if (action === 'view-report') {
        S.activeScaleId = id;
        S.copsoqVersion = (S.completedReports[id] && S.completedReports[id].copsoqVersion) || null;
        S.view = 'report';
        render();
        window.scrollTo(0, 0);
      } else if (action === 'back-home') {
        S.view = 'home';
        render();
        window.scrollTo(0, 0);
      } else if (action === 'submit') {
        const scale = SCALES.find(s => s.id === S.activeScaleId);
        const report = calculateScore(scale, S.answers);
        S.completedReports[S.activeScaleId] = report;
        // Finalize when project-launched: lazy-creates DB rows on first call,
        // updates existing session on subsequent calls. Subject info travels
        // with the request so the test_session row appears in admin only after
        // the user actually completes a scale (not on QR scan).
        if (window.ScalarMyndAPI && isProjectLaunched()) {
          const p = S.profile;
          const g = p.subjectGender === 'male' ? 'M' : p.subjectGender === 'female' ? 'F' : 'O';
          let reportHtml = null;
          try { reportHtml = buildReportHTML(); } catch {}
          try {
            window.ScalarMyndAPI.finalize({
              name:       p.subjectName,
              gender:     g,
              birth_date: p.subjectDOB,
              phone:      p.subjectPhone,
              email:      p.subjectEmail,
              report_html: reportHtml,
              results: {
                profile: { ...S.profile },
                scaleId: S.activeScaleId,
                report,
                completedReports: S.completedReports,
              },
            });
          } catch {}
        }
        S.view = 'report';
        render();
        window.scrollTo(0, 0);
      }
    });
  });

  // Answer buttons
  document.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const qid = parseInt(btn.dataset.qid);
      const val = parseInt(btn.dataset.val);
      S.answers[qid] = val;

      // Update UI without full re-render
      const scale = SCALES.find(s => s.id === S.activeScaleId);
      const allQ = getAllQuestions(scale);

      // Highlight selected button
      const item = btn.closest('.q-item');
      item.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      item.classList.add('answered');
      item.querySelector('.q-num').textContent = item.dataset.no || qid;

      // Update progress
      const total = allQ.length;
      const answered = allQ.filter(q => S.answers[q.id] !== undefined).length;
      const pct = Math.round(answered / total * 100);
      const progressFill = document.querySelector('.progress-fill');
      if (progressFill) progressFill.style.width = pct + '%';
      const progressLabel = document.querySelector('.q-progress-label');
      if (progressLabel) progressLabel.textContent = L3(`${answered} / ${total} 題已作答（${pct}%）`, `${answered} / ${total} 题已作答（${pct}%）`, `${answered} / ${total} answered (${pct}%)`);
      const countEl = document.querySelector('.q-answered-count');
      if (countEl) countEl.innerHTML = L3(`已完成 <strong>${answered}</strong> / ${total} 題`, `已完成 <strong>${answered}</strong> / ${total} 题`, `Done <strong>${answered}</strong> / ${total}`);
      const submitBtn = document.querySelector('[data-action="submit"]');
      if (submitBtn) {
        const canSubmit = answered === total;
        submitBtn.disabled = !canSubmit;
        submitBtn.textContent = canSubmit ? L3('✓ 完成並查看報告','✓ 完成并查看报告','✓ Finish & view report') : L3(`尚餘 ${total - answered} 題未作答`,`尚余 ${total - answered} 题未作答`,`${total - answered} item(s) remaining`);
      }

      // PHQ-9 Q9 flag highlight
      const scale2 = SCALES.find(s => s.id === S.activeScaleId);
      if (scale2.scoring.flags) {
        scale2.scoring.flags.forEach(f => {
          if (f.questionId === qid && f.triggerValues.includes(val)) {
            item.classList.add('flagged');
          } else if (f.questionId === qid) {
            item.classList.remove('flagged');
          }
        });
      }
    });
  });

  // Header brand click → home
  const brand = document.querySelector('.header-brand');
  if (brand) {
    brand.addEventListener('click', () => {
      S.view = 'home';
      render();
      window.scrollTo(0,0);
    });
  }
}

// ─────────────────────────────────────────
// 初始化
// ─────────────────────────────────────────
// Validate subject info before allowing scale start (project-launched only).
// No backend write happens here — DB rows are lazily created by finalize() on
// scale completion, so an unfinished test leaves zero trace in admin.
function ensureSubjectSynced() {
  if (!isProjectLaunched()) return true;
  const p = S.profile;
  if (!p.subjectName)   { alert(TR('請先填寫受測者姓名')); return false; }
  if (!p.subjectDOB)    { alert(TR('請先填寫受測者出生日期')); return false; }
  if (!p.subjectGender) { alert(TR('請先選擇受測者性別')); return false; }
  if (!p.subjectPhone)  { alert(TR('請先填寫聯絡電話')); return false; }
  if (!p.subjectEmail)  { alert(TR('請先填寫聯絡信箱')); return false; }
  return true;
}

function applyProjectFilter() {
  if (!window.ScalarMyndAPI) return;
  const allowed = window.ScalarMyndAPI.getProjectFilter();
  if (!allowed) return;
  const set = new Set(allowed);
  // Mutate in place so other code paths (find / findIndex) keep working.
  for (let i = SCALES.length - 1; i >= 0; i--) {
    if (!set.has(SCALES[i].id)) SCALES.splice(i, 1);
  }
}

function applySessionPrefill() {
  if (!window.ScalarMyndAPI) return;
  const s = window.ScalarMyndAPI.getSession();
  if (!s) return;
  if (s.name)      S.profile.subjectName   = s.name;
  if (s.subjectId) S.profile.subjectId     = s.subjectId;
  if (s.gender) {
    const g = String(s.gender).toLowerCase();
    if (g === 'm' || g === 'male')   S.profile.subjectGender = 'male';
    else if (g === 'f' || g === 'female') S.profile.subjectGender = 'female';
    else if (g)                       S.profile.subjectGender = 'other';
  }
  if (s.birthDate) {
    S.profile.subjectDOB = s.birthDate;
    const a = ageFromDOB(s.birthDate);
    if (a) S.profile.subjectAge = a;
  }
  // Pre-fill contact info when the operator pre-loaded the subject in
  // /my-projects/:id. Without this the operator has to re-type phone +
  // email at the venue even though they already entered both. Both fields
  // are required on the profile form for project-launched sessions, so
  // populating them here also unblocks the "begin assessment" gate.
  if (s.phone) S.profile.subjectPhone = s.phone;
  if (s.email) S.profile.subjectEmail = s.email;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Bach flower scale ordered first, COPSOQ III pinned right after it
  const bachIdx = SCALES.findIndex(s => s.id === 'bach');
  if (bachIdx > 0) {
    const [bach] = SCALES.splice(bachIdx, 1);
    SCALES.unshift(bach);
  }
  const copsoqIdx = SCALES.findIndex(s => s.id === 'copsoq');
  if (copsoqIdx > 1) {
    const [copsoq] = SCALES.splice(copsoqIdx, 1);
    SCALES.splice(1, 0, copsoq);
  }
  // Optional artisebio backend bridge — when launched via project QR, this
  // pulls session info (name/DOB/gender) and the scalar.scales filter.
  if (window.ScalarMyndAPI) {
    try {
      await window.ScalarMyndAPI.init();
      applyProjectFilter();
      applySessionPrefill();
    } catch {}
  }
  // i18n: detect/restore language, re-render on change, wire the header switcher.
  if (window.I18N) {
    I18N.init();
    I18N.onChange(() => render());
    const sel = document.getElementById('lang-select');
    if (sel) {
      sel.value = I18N.lang;
      sel.addEventListener('change', () => I18N.setLang(sel.value));
    }
  }
  render();
});
