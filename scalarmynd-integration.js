/* ═══════════════════════════════════════════════════════
   scalarmynd-integration.js — artisebio-web backend bridge
   Mirrors myndscape-integration.js / visiomynd integration:
     - Read session_token from URL or steeg_session cookie
     - Fetch session info → name / gender / birth_date / app_options
     - Fetch /auth/me → user account + effective_plan
     - Apply project filter (app_options.scalar.scales)
     - PUT /api/sessions/{id}/result on each scale completion
   Exposes window.ScalarMyndAPI.
   ═══════════════════════════════════════════════════════ */
(function(){
  const ARTISEBIO_API = 'https://www.sigmacog.xyz/api';

  let sessionInfo = null;       // {sessionId, sessionToken, name, gender, birthDate, subjectId, app_options, deferred}
  let userInfo    = null;
  let plan        = 'free';
  let initialized = false;
  const listeners = new Set();

  function getSessionToken(){
    const found = readSessionTokenWithSource();
    return found ? found.token : null;
  }

  // Source-aware: cameViaUrl=true means user explicitly arrived via project link;
  // false means we read it from the steeg_session cookie (could be stale pollution
  // from a previously completed/expired session).
  function readSessionTokenWithSource(){
    const fromUrl = new URLSearchParams(location.search).get('session_token');
    if (fromUrl) {
      try { document.cookie = `steeg_session=${encodeURIComponent(fromUrl)}; path=/; max-age=86400`; } catch{}
      return { token: fromUrl, cameViaUrl: true };
    }
    const m = document.cookie.match(/(?:^|;\s*)steeg_session=([^;]+)/);
    if (m) return { token: decodeURIComponent(m[1]), cameViaUrl: false };
    return null;
  }

  // Clear stale steeg_session cookie at every Path the proxy / this file may
  // have set it on. Belt-and-suspenders: line 23 writes path=/, but the proxy
  // writes Path=/scalarmynd/, so we must wipe both.
  function clearStaleSessionCookie(){
    try {
      document.cookie = 'steeg_session=; path=/; Max-Age=0; Secure; SameSite=Lax';
      document.cookie = 'steeg_session=; Path=/scalarmynd/; Max-Age=0; Secure; SameSite=Lax';
      document.cookie = 'steeg_session=; Path=/scalarmynd; Max-Age=0; Secure; SameSite=Lax';
    } catch (e) { /* ignore */ }
  }

  // AUD-018 (2026-05-30): H7 regression fix — read steeg_token from the
  // cookie set by main.js after login instead of localStorage. localStorage
  // is XSS-readable; the cookie is also JS-readable but cookies + Secure +
  // SameSite Lax + same-origin policy keep the risk surface smaller and
  // align this app with the rest of the sub-apps.
  function getAuthToken(){
    try {
      const m = document.cookie.match(/(?:^|;\s*)steeg_token=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    } catch { return null; }
  }
  function authHeaders(){
    const t = getAuthToken();
    return t ? { 'Authorization': 'Bearer ' + t } : {};
  }

  async function fetchSession(token){
    try {
      const r = await fetch(`${ARTISEBIO_API}/sessions/token/${encodeURIComponent(token)}`, {
        headers: authHeaders(),
      });
      if (!r.ok) return null;
      const d = await r.json();
      // Deferred-join sessions store '(待填寫)' as a placeholder name; treat as empty
      // so the profile form doesn't pre-fill it.
      const rawName = d.client_name || d.name || '';
      const cleanName = rawName === '(待填寫)' ? '' : rawName;
      return {
        sessionId:     d.session_id,
        sessionToken:  token,
        deferred:      d.deferred === true,
        name:          cleanName,
        gender:        d.gender || '',
        birthDate:     d.birth_date || null,
        subjectId:     d.subject_id || null,
        // Phone + email pulled from clients row by the worker so ScalarMynd's
        // profile form can pre-fill them when the operator pre-loaded the
        // subject from /my-projects (issue 2026-05-09: contact info was being
        // dropped on the floor between launch and the participant's screen).
        phone:         d.phone || '',
        email:         d.email || '',
        notes:         d.notes || null,
        // Server returns parsed app_options snapshot when set on join.
        app_options:   (d.app_options && typeof d.app_options === 'object') ? d.app_options : null,
      };
    } catch { return null; }
  }

  async function fetchMe(){
    const token = getAuthToken();
    if (!token) return null;
    try {
      const r = await fetch(`${ARTISEBIO_API}/auth/me`, {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }

  function getStoredUser(){
    try { return JSON.parse(localStorage.getItem('steeg_user') || 'null'); }
    catch { return null; }
  }

  function notify(){
    listeners.forEach(fn => { try { fn({sessionInfo, userInfo, plan}); } catch{} });
  }

  async function init(){
    if (initialized) return {sessionInfo, userInfo, plan};
    initialized = true;

    const stored = getStoredUser();
    if (stored){
      if (stored.role === 'admin') plan = 'pro';
      else if (stored.plan && stored.plan !== 'none') plan = stored.plan;
    }

    const src = readSessionTokenWithSource();
    const tasks = [];
    if (src) tasks.push(fetchSession(src.token).then(s => {
      if (s) {
        sessionInfo = s;
      } else if (!src.cameViaUrl) {
        // Stale steeg_session cookie pollution from a previous project session.
        // Silently clear it so subsequent loads don't re-validate the same
        // dead token. User proceeds in standalone mode.
        clearStaleSessionCookie();
        sessionInfo = null;
      } else {
        // URL-token failure: leave sessionInfo null; UI gates on
        // isProjectLaunched() which already returns false. No error banner
        // is shown today, so callers see standalone-mode behavior.
        sessionInfo = null;
      }
    }));
    tasks.push(fetchMe().then(u => {
      userInfo = u;
      if (u){
        if (u.role === 'admin') plan = 'pro';
        else if (u.effective_plan) plan = u.effective_plan;
        else if (u.plan) plan = u.plan;
      }
    }));
    await Promise.all(tasks);
    notify();
    return {sessionInfo, userInfo, plan};
  }

  function subscribe(fn){
    listeners.add(fn);
    fn({sessionInfo, userInfo, plan});
    return () => listeners.delete(fn);
  }

  // Returns array of allowed scale ids, or null when no project filter applies.
  function getProjectFilter(){
    if (!sessionInfo || !sessionInfo.app_options) return null;
    const scalar = sessionInfo.app_options.scalar;
    if (!scalar || !Array.isArray(scalar.scales) || scalar.scales.length === 0) return null;
    return scalar.scales.slice();
  }

  // Update subject info on backend. Only valid AFTER finalize has materialized
  // the session (sessionInfo.sessionId is set). For deferred sessions before
  // finalize, this is a no-op — subject info travels with finalize() instead.
  function updateSubject(payload){
    if (!sessionInfo || !sessionInfo.sessionId) return Promise.resolve(false);
    const token = sessionInfo.sessionToken;
    return fetch(`${ARTISEBIO_API}/sessions/${sessionInfo.sessionId}/subject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ session_token: token, ...payload }),
    }).then(async r => {
      if (!r.ok) return false;
      try {
        const d = await r.json().catch(() => null);
        if (d && d.success) {
          if (payload.name)       sessionInfo.name       = payload.name;
          if (payload.gender)     sessionInfo.gender     = payload.gender;
          if (payload.birth_date) sessionInfo.birthDate  = payload.birth_date;
        }
      } catch {}
      return true;
    }).catch(() => false);
  }

  // Finalize: commit subject info + results to backend in a single atomic call.
  //
  //   - Deferred session: backend lazy-creates client + project_subject + test_session
  //     rows, marks session completed, and returns a real test_session JWT that
  //     replaces our deferred token for any subsequent re-saves.
  //   - Materialized session (already finalized once, e.g. user re-submits more
  //     scales): backend updates the existing session — equivalent to PUT result.
  //
  // payload shape:
  //   { name, gender, birth_date, phone, email, results: {...}, report_html?: '...' }
  async function finalize(payload){
    if (!sessionInfo || !sessionInfo.sessionToken) return false;
    const body = {
      session_token: sessionInfo.sessionToken,
      ...payload,
      results: {
        app: 'scalar',
        ...(payload.results || {}),
        completedAt: new Date().toISOString(),
      },
    };
    try {
      const r = await fetch(`${ARTISEBIO_API}/sessions/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!r.ok) return false;
      const d = await r.json().catch(() => null);
      if (!d || !d.success) return false;
      // After first finalize, swap to the real test_session token so subsequent
      // saves use the materialized session.
      if (d.session_id) {
        sessionInfo.sessionId    = d.session_id;
        sessionInfo.deferred     = false;
        if (d.session_token) sessionInfo.sessionToken = d.session_token;
        if (payload.name)       sessionInfo.name      = payload.name;
        if (payload.gender)     sessionInfo.gender    = payload.gender;
        if (payload.birth_date) sessionInfo.birthDate = payload.birth_date;
        notify();
      }
      return true;
    } catch { return false; }
  }

  // Backwards-compat: saveResult() used to PUT results. For materialized sessions
  // it still works; for deferred sessions, the caller must use finalize() instead
  // (which carries subject info). We accept both call sites by routing here.
  function saveResult(payload){
    if (!sessionInfo) return Promise.resolve(false);
    if (sessionInfo.deferred || !sessionInfo.sessionId) {
      // Deferred but no subject info → cannot finalize alone. Caller should
      // gather subject info and call finalize() directly.
      return Promise.resolve(false);
    }
    const token = sessionInfo.sessionToken;
    return fetch(`${ARTISEBIO_API}/sessions/${sessionInfo.sessionId}/result`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        session_token: token,
        results: {
          app: 'scalar',
          ...payload,
          completedAt: new Date().toISOString(),
        },
      }),
    }).then(r => r.ok).catch(() => false);
  }

  window.ScalarMyndAPI = {
    init, subscribe,
    getSession: () => sessionInfo,
    getUser:    () => userInfo,
    getPlan:    () => plan,
    getProjectFilter,
    updateSubject,
    saveResult,
    finalize,
    isProjectLaunched: () => !!(sessionInfo && (sessionInfo.sessionId || sessionInfo.deferred)),
    isDeferred:        () => !!(sessionInfo && sessionInfo.deferred),
  };
})();
