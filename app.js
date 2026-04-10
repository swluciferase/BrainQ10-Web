// BrainQ10 — 主應用程式
'use strict';

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
    respondentName: '',
    respondentRelationship: '', // self | parent | teacher | other
    assessmentDate: todayStr()
  },
  activeScaleId: null,
  answers: {},           // { questionId: value }
  completedReports: {}   // { scaleId: reportData }
};

function todayStr() {
  return new Date().toLocaleDateString('zh-TW', { year:'numeric', month:'2-digit', day:'2-digit' });
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
function getScaleStatus(scale) {
  const age = parseInt(S.profile.subjectAge);
  const rel = S.profile.respondentRelationship;

  if (!S.profile.subjectAge && !S.profile.respondentRelationship) {
    return { enabled: false, reason: '請先填寫受測者年齡與填答者關係' };
  }
  if (!S.profile.subjectAge) {
    return { enabled: false, reason: '請先填寫受測者年齡' };
  }
  if (!S.profile.respondentRelationship) {
    return { enabled: false, reason: '請先填寫填答者與本人關係' };
  }

  const c = scale.criteria;
  if (c.minAge && age < c.minAge) {
    return { enabled: false, reason: `此量表適用 ${c.minAge} 歲以上` };
  }
  if (c.maxAge && age > c.maxAge) {
    return { enabled: false, reason: `此量表適用 ${c.minAge}–${c.maxAge} 歲` };
  }
  if (c.roles && !c.roles.includes(rel)) {
    const roleMap = { self:'本人', parent:'父母/監護人', teacher:'教師', other:'其他' };
    const required = c.roles.map(r => roleMap[r] || r).join(' 或 ');
    return { enabled: false, reason: `此量表需由${required}填寫` };
  }

  return { enabled: true };
}

function profileComplete() {
  const p = S.profile;
  return p.subjectName && p.subjectAge && p.respondentRelationship;
}

// ─────────────────────────────────────────
// 首頁渲染
// ─────────────────────────────────────────
function renderHome() {
  const cards = SCALES.map(scale => {
    const st = getScaleStatus(scale);
    const done = S.completedReports[scale.id];
    const badgeCls = scale.category.includes('ADHD') ? 'badge-adhd' : 'badge-emotion';

    const rolesLabel = (scale.criteria.roles || []).map(r =>
      ({self:'本人',parent:'家長',teacher:'教師',other:'其他'}[r])
    ).join('／');

    const ageLabel = scale.criteria.maxAge
      ? `${scale.criteria.minAge}–${scale.criteria.maxAge} 歲`
      : `${scale.criteria.minAge} 歲以上`;

    let actionHtml = '';
    if (!st.enabled) {
      actionHtml = `<div class="scale-card-lock"><span>🔒</span><span>${st.reason}</span></div>`;
    } else if (done) {
      actionHtml = `
        <div class="scale-card-done">✓</div>
        <div class="scale-card-action">
          <button class="btn-start" data-action="view-report" data-id="${scale.id}">查看報告</button>
          <button class="btn-redo" data-action="redo" data-id="${scale.id}">重新作答</button>
        </div>`;
    } else {
      actionHtml = `
        <div class="scale-card-action">
          <button class="btn-start" data-action="start" data-id="${scale.id}">開始作答 →</button>
        </div>`;
    }

    return `
      <div class="scale-card ${st.enabled ? (done ? 'completed' : 'enabled') : 'disabled'}" data-id="${scale.id}">
        <div class="scale-card-badge ${badgeCls}">${scale.category}</div>
        <div class="scale-card-name">${scale.name}</div>
        <div class="scale-card-full">${scale.fullName}</div>
        <div class="scale-card-desc">${scale.description}</div>
        <div class="scale-card-meta">
          <span class="meta-tag">⏱ 約${scale.estimatedMinutes}分鐘</span>
          <span class="meta-tag">👤 ${ageLabel}</span>
          <span class="meta-tag">✍️ ${rolesLabel}填答</span>
        </div>
        ${actionHtml}
      </div>`;
  }).join('');

  const noticeHtml = profileComplete() ? '' : `
    <div class="profile-notice">
      <span class="profile-notice-icon">💡</span>
      <span>請先填寫左側個人資料（受測者年齡與填答者關係為必填），系統將自動開放適用的量表。</span>
    </div>`;

  return `
    <div class="view home-layout">
      <!-- 個人資料面板 -->
      <aside class="profile-panel">
        <div class="profile-header">
          <h2>個人資料</h2>
          <p>請填寫以下資訊，系統將篩選適用量表</p>
        </div>
        <div class="profile-body">
          <div class="profile-divider">受測者資料</div>
          <div class="form-group">
            <label>姓名</label>
            <input type="text" id="f-subjectName" value="${esc(S.profile.subjectName)}" placeholder="受測者姓名">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>年齡 <span style="color:#e74c3c">*</span></label>
              <input type="number" id="f-subjectAge" value="${esc(S.profile.subjectAge)}" placeholder="歲" min="1" max="120">
            </div>
            <div class="form-group">
              <label>性別</label>
              <select id="f-subjectGender">
                <option value="" ${!S.profile.subjectGender ? 'selected' : ''}>請選擇</option>
                <option value="male"   ${S.profile.subjectGender==='male'   ? 'selected' : ''}>男</option>
                <option value="female" ${S.profile.subjectGender==='female' ? 'selected' : ''}>女</option>
                <option value="other"  ${S.profile.subjectGender==='other'  ? 'selected' : ''}>其他</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>出生日期</label>
            <input type="date" id="f-subjectDOB" value="${esc(S.profile.subjectDOB)}">
          </div>

          <div class="profile-divider">填答者資料</div>
          <div class="form-group">
            <label>填答者姓名</label>
            <input type="text" id="f-respondentName" value="${esc(S.profile.respondentName)}" placeholder="填答者姓名">
          </div>
          <div class="form-group">
            <label>與受測者關係 <span style="color:#e74c3c">*</span></label>
            <select id="f-respondentRelationship">
              <option value="" ${!S.profile.respondentRelationship ? 'selected' : ''}>請選擇</option>
              <option value="self"    ${S.profile.respondentRelationship==='self'    ? 'selected' : ''}>本人</option>
              <option value="parent"  ${S.profile.respondentRelationship==='parent'  ? 'selected' : ''}>父母／監護人</option>
              <option value="teacher" ${S.profile.respondentRelationship==='teacher' ? 'selected' : ''}>教師</option>
              <option value="other"   ${S.profile.respondentRelationship==='other'   ? 'selected' : ''}>其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>評估日期</label>
            <input type="text" id="f-assessmentDate" value="${esc(S.profile.assessmentDate)}" placeholder="${todayStr()}">
          </div>
        </div>
      </aside>

      <!-- 量表選擇區 -->
      <main class="scales-panel">
        <div class="section-title">評量量表</div>
        ${noticeHtml}
        <div class="scales-grid">${cards}</div>
        <p class="disclaimer">
          本系統提供之評量結果僅供參考，不構成任何診斷依據。<br>
          如有相關疑慮，請洽專業醫師或心理師進行完整評估。
        </p>
      </main>
    </div>`;
}

// ─────────────────────────────────────────
// 問卷渲染
// ─────────────────────────────────────────
function renderQuestionnaire() {
  const scale = SCALES.find(s => s.id === S.activeScaleId);
  if (!scale) return '<p>錯誤：找不到量表</p>';

  // 計算題目總數與已答數
  const allQ = getAllQuestions(scale);
  const total = allQ.length;
  const answered = allQ.filter(q => S.answers[q.id] !== undefined).length;
  const pct = total > 0 ? Math.round(answered / total * 100) : 0;

  const sectionsHtml = scale.sections.map(section => {
    const sectionHeader = section.label
      ? `<div class="q-section-header">📋 ${section.label}</div>` : '';
    const sectionNote = section.note
      ? `<div class="q-section-note">ℹ️ ${section.note}</div>` : '';

    const questionsHtml = section.questions.map(q => {
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
        return `<button class="opt-btn ${sel}" data-qid="${q.id}" data-val="${opt.value}">${opt.label}</button>`;
      }).join('');

      return `
        <div class="q-item ${isAnswered ? 'answered' : ''} ${isFlag ? 'flagged' : ''}" id="q-${q.id}">
          <div class="q-num">${q.id}</div>
          <div>
            <div class="q-text">${q.text}</div>
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
          <h1>${scale.fullName}</h1>
          <p>受測者：${esc(S.profile.subjectName) || '（未填寫）'} ／ 填答者：${esc(S.profile.respondentName) || '（未填寫）'}</p>
        </div>
        <div class="q-progress-area">
          <div class="q-progress-label">${answered} / ${total} 題已作答（${pct}%）</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
      </div>

      <!-- 作答說明 -->
      <div class="q-instructions">${scale.instructions}</div>

      <!-- 題目區 -->
      ${sectionsHtml}

      <!-- 底部操作列 -->
      <div class="q-footer">
        <button class="btn-back" data-action="back-home">← 返回首頁</button>
        <div class="q-answered-count">已完成 <strong>${answered}</strong> / ${total} 題</div>
        <button class="btn-submit" data-action="submit" ${canSubmit ? '' : 'disabled'}>
          ${canSubmit ? '✓ 完成並查看報告' : `尚餘 ${total - answered} 題未作答`}
        </button>
      </div>
    </div>`;
}

// ─────────────────────────────────────────
// 報告渲染
// ─────────────────────────────────────────
function renderReport() {
  const report = S.completedReports[S.activeScaleId];
  if (!report) return '<p>錯誤：找不到報告</p>';

  const scale = SCALES.find(s => s.id === S.activeScaleId);
  const p = S.profile;

  const genderMap = { male:'男', female:'女', other:'其他' };
  const relMap = { self:'本人', parent:'父母／監護人', teacher:'教師', other:'其他' };

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
  }

  // Flags
  const flagsHtml = (report.flags || []).map(f =>
    `<div class="report-flag">⚠️ ${f.message}</div>`
  ).join('');

  return `
    <div class="view">
      <div class="report-container">
        <div class="report-header">
          <div class="report-brand">BrainQ10 神經發展評量系統</div>
          <div class="report-scale-name">${scale.fullName}</div>
          <div class="report-meta-row">
            <div class="report-meta-item">受測者：<strong>${esc(p.subjectName) || '─'}</strong></div>
            <div class="report-meta-item">年齡：<strong>${p.subjectAge ? p.subjectAge + ' 歲' : '─'}</strong></div>
            <div class="report-meta-item">性別：<strong>${genderMap[p.subjectGender] || '─'}</strong></div>
            <div class="report-meta-item">填答者：<strong>${esc(p.respondentName) || '─'}</strong></div>
            <div class="report-meta-item">關係：<strong>${relMap[p.respondentRelationship] || '─'}</strong></div>
            <div class="report-meta-item">評估日期：<strong>${esc(p.assessmentDate)}</strong></div>
          </div>
        </div>

        <div class="report-body">
          ${flagsHtml}
          ${bodyHtml}
          <p class="disclaimer">
            本報告結果僅供參考，不構成任何診斷依據。如有相關疑慮，請洽專業醫師或臨床心理師進行完整評估。
          </p>
        </div>

        <div class="report-actions">
          <button class="btn-print" onclick="window.print()">🖨 列印報告</button>
          <button class="btn-new-scale" data-action="back-home">← 返回主頁選擇其他量表</button>
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
      <div class="report-summary-label">評估結果</div>
      <div class="report-summary-result">${interp.label}</div>
      <div class="report-summary-score">總分：${total} 分（滿分 ${getMaxSum(scale)} 分）</div>
      <div class="report-summary-note">${interp.note}</div>
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
        <td><strong>${sub.name}</strong></td>
        <td>${score} / ${maxS}</td>
        <td class="score-bar-cell">
          <div class="mini-bar">
            <div class="mini-bar-fill" style="width:${pct}%; background:${interp.color}"></div>
          </div>
        </td>
        <td><span class="dsm-badge" style="background:${interp.color}20; color:${interp.color}">${interp.label}</span></td>
      </tr>`;
  }).join('');

  // Part A 篩查結果
  const partAPositive = report.partAPositive;
  const screenHtml = partAPositive !== undefined ? `
    <div class="report-section">
      <div class="report-section-title">Part A 快速篩查結果</div>
      <div class="report-summary" style="background:${partAPositive ? '#fde8e820' : '#e8f8ee20'}; border-color:${partAPositive ? '#e74c3c' : '#27ae60'}; color:${partAPositive ? '#e74c3c' : '#27ae60'}">
        <div class="report-summary-result">${partAPositive ? '篩查陽性（建議進一步評估）' : '篩查陰性'}</div>
        <div class="report-summary-note">${partAPositive
          ? 'Part A 篩查顯示有明顯ADHD症狀風險，建議由專業醫師進行完整診斷評估。'
          : 'Part A 篩查結果未達陽性門檻，但全量表仍可提供參考。'}</div>
      </div>
    </div>` : '';

  return `
    ${screenHtml}
    <div class="report-section">
      <div class="report-section-title">各分向度得分</div>
      <table class="score-table">
        <thead><tr><th>向度</th><th>得分</th><th>分布</th><th>程度</th></tr></thead>
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
        <td><strong>${sub.name}</strong></td>
        <td>平均 ${avg} / 3.00</td>
        <td class="score-bar-cell">
          <div class="mini-bar">
            <div class="mini-bar-fill" style="width:${pct}%; background:${meetsThreshold ? '#e74c3c' : '#27ae60'}"></div>
          </div>
        </td>
        <td>陽性題數：${positives}/${sub.questionIds.length}
          <br><span class="dsm-badge ${meetsThreshold ? 'dsm-positive' : 'dsm-negative'}">
            ${meetsThreshold ? `✗ 達門檻（≥${sub.dsmRequired}題）` : `✓ 未達門檻`}
          </span>
        </td>
      </tr>`;
  }).join('');

  const overallRule = sc.interpretation.rules.find(r => r.condition === report.overallCondition);
  const summaryStyle = `background:${overallRule.color}18; border-color:${overallRule.color}; color:${overallRule.color};`;

  return `
    <div class="report-summary" style="${summaryStyle}">
      <div class="report-summary-label">綜合評估</div>
      <div class="report-summary-result">${overallRule.label}</div>
      <div class="report-summary-note">以下各向度得分 ≥ 2.0 且 ≥6題達陽性標準為符合DSM-IV診斷門檻。本結果僅供參考，診斷需由專業醫師判定。</div>
    </div>
    <div class="report-section">
      <div class="report-section-title">各向度分析</div>
      <table class="score-table">
        <thead><tr><th>向度</th><th>平均分</th><th>分布</th><th>DSM-IV門檻</th></tr></thead>
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
        <td><strong>${sub.name}</strong></td>
        <td>${total} / ${maxT}</td>
        <td class="score-bar-cell">
          <div class="mini-bar">
            <div class="mini-bar-fill" style="width:${pct}%; background:${meets ? '#e74c3c' : '#3a8fd4'}"></div>
          </div>
        </td>
        <td>陽性題數：${positives}/${sub.questionIds.length}
          <br><span class="dsm-badge ${meets ? 'dsm-positive' : 'dsm-negative'}">
            ${meets ? `✗ 達門檻（≥${sub.dsmRequired}題）` : `✓ 未達門檻`}
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
      <td>${q ? q.text : qid}</td>
      <td>${['','優秀','平均以上','平均','有點問題','有嚴重問題'][val] || val}</td>
      <td><span class="dsm-badge ${isImpaired ? 'dsm-positive' : 'dsm-negative'}">${isImpaired ? '有功能障礙' : '尚可'}</span></td>
    </tr>`;
  }).join('');

  // Overall diagnosis
  const diagList = report.diagnoses || [];
  const diagHtml = diagList.length > 0
    ? diagList.map(d => `<span class="dsm-badge dsm-positive" style="margin:3px 4px; display:inline-block">${d}</span>`).join('')
    : '<span class="dsm-badge dsm-negative">未達任何主要診斷門檻</span>';

  return `
    <div class="report-section">
      <div class="report-section-title">主要診斷門檻評估</div>
      <div style="padding: 12px 0">${diagHtml}</div>
      <p style="font-size:12px; color:var(--text-muted); margin-top:8px">* 達門檻表示該向度症狀數量符合DSM-IV診斷標準，最終診斷須由專業醫師判定。</p>
    </div>
    <div class="report-section">
      <div class="report-section-title">症狀向度得分</div>
      <table class="score-table">
        <thead><tr><th>向度</th><th>總分</th><th>分布</th><th>DSM-IV門檻</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="report-section">
      <div class="report-section-title">功能表現評估</div>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom:10px">功能障礙定義：評分 ≥ 4（有點問題／有嚴重問題）</p>
      <table class="score-table">
        <thead><tr><th>項目</th><th>評分</th><th>功能狀態</th></tr></thead>
        <tbody>${perfRows}</tbody>
      </table>
      ${impaired > 0 ? `<p style="margin-top:10px; font-size:13px; color:var(--orange)">共 <strong>${impaired}</strong> 個功能領域出現障礙（評分 ≥ 4）。</p>` : ''}
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
    const catLabel = sc.categoryLabels[section.id] || section.label;

    const itemsHtml = items.map(item => {
      const significant = item.score >= 5;
      const notable = item.score >= threshold;
      const dotColor = significant ? '#e74c3c' : notable ? '#f39c12' : '#bdc3c7';
      return `
        <div class="bach-item ${significant ? 'very-significant' : notable ? 'significant' : ''}">
          <div class="bach-score-dot" style="background:${dotColor}20; color:${dotColor}">${item.score}</div>
          <div style="flex:1; font-size:13px">${item.text}</div>
          ${notable ? `<div style="font-size:11px; color:${dotColor}; font-weight:700; white-space:nowrap">${significant ? '非常顯著' : '值得關注'}</div>` : ''}
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
      <div class="report-summary-label">情緒評估摘要</div>
      <div class="report-summary-result">
        ${totalHighlighted === 0 ? '情緒狀態良好' : `共 ${totalHighlighted} 個情緒面向值得關注`}
      </div>
      <div class="report-summary-note">
        評分 ≥ ${threshold} 分為值得關注的情緒面向，≥ 5 分為非常顯著。以下結果僅供自我覺察參考。
      </div>
    </div>
    <div class="report-section">
      <div class="report-section-title">各情緒面向評估結果（1=完全不符合，5=非常符合）</div>
      ${categoriesHtml}
    </div>`;
}

// ── 原始作答詳情
function renderScoreBreakdown(scale, report) {
  const allQ = getAllQuestions(scale);
  const rows = allQ.map(q => {
    const val = S.answers[q.id];
    const opt = q.options.find(o => o.value === val);
    return `<tr>
      <td style="width:40px; text-align:center; color:var(--text-muted)">${q.id}</td>
      <td>${q.text}</td>
      <td style="white-space:nowrap; font-weight:600">${opt ? opt.label : '─'}</td>
      <td style="text-align:center">${opt ? opt.value : '─'}</td>
    </tr>`;
  }).join('');

  return `
    <div class="report-section">
      <div class="report-section-title">作答詳細記錄</div>
      <table class="score-table">
        <thead><tr><th style="width:40px">題號</th><th>題目</th><th>作答</th><th style="text-align:center">分值</th></tr></thead>
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
  }

  return result;
}

// ─────────────────────────────────────────
// 工具函數
// ─────────────────────────────────────────
function getAllQuestions(scale) {
  return scale.sections.flatMap(s => s.questions);
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
  // Profile inputs
  ['subjectName','subjectAge','subjectDOB','subjectGender','respondentName','respondentRelationship','assessmentDate'].forEach(field => {
    const el = document.getElementById('f-' + field);
    if (!el) return;
    el.addEventListener('change', e => {
      S.profile[field] = e.target.value;
      if (field === 'subjectAge' || field === 'respondentRelationship') {
        render(); // 重新渲染更新量表狀態
      }
    });
    el.addEventListener('input', e => {
      S.profile[field] = e.target.value;
      if (field === 'subjectAge' || field === 'respondentRelationship') {
        // debounce
        clearTimeout(el._timer);
        el._timer = setTimeout(() => render(), 500);
      }
    });
  });

  // DOB → auto fill age
  const dobEl = document.getElementById('f-subjectDOB');
  if (dobEl) {
    dobEl.addEventListener('change', e => {
      if (!e.target.value) return;
      const dob = new Date(e.target.value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age > 0) {
        S.profile.subjectAge = String(age);
        const ageEl = document.getElementById('f-subjectAge');
        if (ageEl) ageEl.value = age;
        render();
      }
    });
  }

  // Scale action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'start') {
        S.activeScaleId = id;
        S.answers = {};
        S.view = 'questionnaire';
        render();
        window.scrollTo(0, 0);
      } else if (action === 'redo') {
        S.activeScaleId = id;
        S.answers = {};
        delete S.completedReports[id];
        S.view = 'questionnaire';
        render();
        window.scrollTo(0, 0);
      } else if (action === 'view-report') {
        S.activeScaleId = id;
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
      item.querySelector('.q-num').textContent = qid;

      // Update progress
      const total = allQ.length;
      const answered = allQ.filter(q => S.answers[q.id] !== undefined).length;
      const pct = Math.round(answered / total * 100);
      const progressFill = document.querySelector('.progress-fill');
      if (progressFill) progressFill.style.width = pct + '%';
      const progressLabel = document.querySelector('.q-progress-label');
      if (progressLabel) progressLabel.textContent = `${answered} / ${total} 題已作答（${pct}%）`;
      const countEl = document.querySelector('.q-answered-count');
      if (countEl) countEl.innerHTML = `已完成 <strong>${answered}</strong> / ${total} 題`;
      const submitBtn = document.querySelector('[data-action="submit"]');
      if (submitBtn) {
        const canSubmit = answered === total;
        submitBtn.disabled = !canSubmit;
        submitBtn.textContent = canSubmit ? '✓ 完成並查看報告' : `尚餘 ${total - answered} 題未作答`;
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
document.addEventListener('DOMContentLoaded', () => {
  render();
});
