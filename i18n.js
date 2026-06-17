// ScalarMynd (BrainQ10) tri-lingual i18n — vanilla, no build step.
// Internal codes: 'zh' = Traditional (existing), 'zh-Hans' = Simplified (new),
// 'en' = English (new). Shared cross-app preference key `sigmacog_lang`.
//
// detectLang is REGEX-FREE on purpose — the sgimacog /eeg port (2026-06-18)
// hit a regex literal that broke under codegen/obfuscation and silently
// mis-detected zh-CN as Traditional. Plain string ops are escaping-proof.
(function () {
  'use strict';

  var LANGS = ['zh', 'zh-Hans', 'en'];
  var LABELS = { 'zh': '繁體中文', 'zh-Hans': '简体中文', 'en': 'English' };
  var SHARED_KEY = 'sigmacog_lang';
  var LEGACY_KEY = 'scalarmynd_lang';

  function detectLang() {
    var bl = (navigator.language || '').toLowerCase();
    if (bl.indexOf('zh') !== 0) return 'en';
    if (bl.indexOf('hans') !== -1) return 'zh-Hans';
    var region = bl.slice(3); // strip "zh" + separator
    if (region === 'cn' || region === 'sg') return 'zh-Hans';
    return 'zh'; // zh-TW / zh-HK / zh-MO / bare zh → Traditional
  }

  function readLang() {
    try {
      var shared = localStorage.getItem(SHARED_KEY);
      if (LANGS.indexOf(shared) !== -1) return shared;
      var legacy = localStorage.getItem(LEGACY_KEY);
      if (LANGS.indexOf(legacy) !== -1) return legacy;
    } catch (e) { /* storage blocked */ }
    return detectLang();
  }

  function writeLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = 'zh';
    try {
      localStorage.setItem(SHARED_KEY, lang);
      localStorage.setItem(LEGACY_KEY, lang);
    } catch (e) { /* storage blocked */ }
  }

  // Resolve a language-keyed object {zh, 'zh-Hans', en} (or a plain string)
  // to the current language, with zh-Hans→zh and *→en fallbacks.
  function pick(v, lang) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    lang = lang || I18N.lang;
    if (v[lang] != null) return v[lang];
    if (lang === 'zh-Hans' && v.zh != null) return v.zh; // simplified missing → traditional
    if (v.en != null) return v.en;
    if (v.zh != null) return v.zh;
    return '';
  }

  // UI string dictionary lookup (populated below by I18N.UI).
  function t(key) {
    var row = I18N.UI[key];
    if (!row) return key;
    return pick(row, I18N.lang);
  }

  function htmlLang(lang) {
    return lang === 'zh-Hans' ? 'zh-CN' : lang === 'en' ? 'en' : 'zh-TW';
  }

  function localeTag(lang) {
    return lang === 'zh-Hans' ? 'zh-CN' : lang === 'en' ? 'en-US' : 'zh-TW';
  }

  var I18N = {
    LANGS: LANGS,
    LABELS: LABELS,
    lang: 'zh',
    detectLang: detectLang,
    readLang: readLang,
    writeLang: writeLang,
    pick: pick,
    t: t,
    htmlLang: htmlLang,
    localeTag: localeTag,
    // UI dictionary — filled in by i18n-ui.js (loaded after this file).
    UI: {},
    // listeners notified on language change (app re-renders)
    _subs: [],
    onChange: function (fn) { this._subs.push(fn); },
    setLang: function (lang) {
      if (LANGS.indexOf(lang) === -1) return;
      this.lang = lang;
      writeLang(lang);
      try { document.documentElement.lang = htmlLang(lang); } catch (e) {}
      for (var i = 0; i < this._subs.length; i++) {
        try { this._subs[i](lang); } catch (e) {}
      }
    },
    init: function () {
      this.lang = readLang();
      try { document.documentElement.lang = htmlLang(this.lang); } catch (e) {}
      return this.lang;
    },
  };

  window.I18N = I18N;
})();
