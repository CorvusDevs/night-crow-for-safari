/* Night Crow docs language picker + i18n.
   The T object is loaded from translations.js (must be included BEFORE this).
   Choice persists in localStorage; default detected from ?lang=, stored value,
   or navigator.language (in priority order). Ported from the CorvusDevs docs
   i18n pattern. */
(function () {
  function init() {
    if (typeof T !== 'object') return; // translations.js not loaded
    var LS_KEY = 'nightcrow_docs_lang';

    // [code, endonym (native name), iso2 country for flag asset]. 'auto' first.
    var LANGS = [
      { code: 'auto', native: 'Default', flag: null },
      { code: 'en', native: 'English', flag: 'us' },
      { code: 'ar', native: 'العربية', flag: 'sa' },
      { code: 'cs', native: 'Čeština', flag: 'cz' },
      { code: 'da', native: 'Dansk', flag: 'dk' },
      { code: 'de', native: 'Deutsch', flag: 'de' },
      { code: 'el', native: 'Ελληνικά', flag: 'gr' },
      { code: 'es', native: 'Español', flag: 'es' },
      { code: 'es-MX', native: 'Español (México)', flag: 'mx' },
      { code: 'fi', native: 'Suomi', flag: 'fi' },
      { code: 'fr', native: 'Français', flag: 'fr' },
      { code: 'he', native: 'עברית', flag: 'il' },
      { code: 'hi', native: 'हिन्दी', flag: 'in' },
      { code: 'hu', native: 'Magyar', flag: 'hu' },
      { code: 'id', native: 'Bahasa Indonesia', flag: 'id' },
      { code: 'it', native: 'Italiano', flag: 'it' },
      { code: 'ja', native: '日本語', flag: 'jp' },
      { code: 'ko', native: '한국어', flag: 'kr' },
      { code: 'ms', native: 'Bahasa Melayu', flag: 'my' },
      { code: 'nb', native: 'Norsk bokmål', flag: 'no' },
      { code: 'nl', native: 'Nederlands', flag: 'nl' },
      { code: 'pl', native: 'Polski', flag: 'pl' },
      { code: 'pt-BR', native: 'Português (Brasil)', flag: 'br' },
      { code: 'pt-PT', native: 'Português (Portugal)', flag: 'pt' },
      { code: 'ro', native: 'Română', flag: 'ro' },
      { code: 'ru', native: 'Русский', flag: 'ru' },
      { code: 'sk', native: 'Slovenčina', flag: 'sk' },
      { code: 'sv', native: 'Svenska', flag: 'se' },
      { code: 'th', native: 'ไทย', flag: 'th' },
      { code: 'tr', native: 'Türkçe', flag: 'tr' },
      { code: 'uk', native: 'Українська', flag: 'ua' },
      { code: 'vi', native: 'Tiếng Việt', flag: 'vn' },
      { code: 'zh-Hans', native: '简体中文', flag: 'cn' },
      { code: 'zh-Hant', native: '繁體中文', flag: 'tw' }
    ];

    function detectNavLang() {
      var navLang = navigator.language || 'en';
      var PICKER = LANGS.map(function (l) { return l.code; }).filter(function (c) { return c !== 'auto'; });
      if (PICKER.indexOf(navLang) !== -1) return navLang;
      var base = navLang.split('-')[0];
      if (PICKER.indexOf(base) !== -1) return base;
      return 'en';
    }
    function effectiveLang(sel) {
      if (!sel || sel === 'auto') return detectNavLang();
      return T[toStorageLang(sel)] ? sel : 'en';
    }
    function pickInitial() {
      var fromQuery = new URL(location.href).searchParams.get('lang');
      if (fromQuery && (fromQuery === 'auto' || T[toStorageLang(fromQuery)])) return fromQuery;
      var stored = localStorage.getItem(LS_KEY);
      if (stored && (stored === 'auto' || T[toStorageLang(stored)])) return stored;
      return 'auto';
    }
    // BCP-47 picker codes -> web-ext translations.js keys.
    function toStorageLang(lang) {
      var map = { 'es-MX': 'es_MX', 'pt-BR': 'pt_BR', 'pt-PT': 'pt_PT', 'zh-Hans': 'zh_CN', 'zh-Hant': 'zh_TW' };
      return map[lang] || lang;
    }
    function renderChip(container, lang) {
      container.innerHTML = '';
      if (lang.code === 'auto') {
        var g = document.createElement('span');
        g.className = 'lang-auto-glyph';
        g.setAttribute('aria-hidden', 'true');
        g.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
        container.appendChild(g);
      } else {
        var img = document.createElement('img');
        img.className = 'lang-flag';
        img.src = 'flags/' + lang.flag + '.svg';
        img.width = 18; img.height = 13; img.alt = '';
        container.appendChild(img);
      }
      var span = document.createElement('span');
      span.className = 'lang-name';
      span.textContent = lang.native;
      container.appendChild(span);
    }
    function applyLang(sel) {
      var lang = effectiveLang(sel);
      var dict = T[toStorageLang(lang)] || {};
      var nodes = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < nodes.length; i++) {
        var key = nodes[i].getAttribute('data-i18n');
        if (dict[key]) nodes[i].innerHTML = dict[key];
      }
      var base = lang.split('_')[0].split('-')[0];
      document.documentElement.lang = base;
      var RTL = { ar: 1, he: 1, fa: 1, ur: 1, yi: 1 };
      document.documentElement.dir = RTL[base] ? 'rtl' : 'ltr';
      var btn = document.getElementById('langBtn');
      var menu = document.getElementById('langMenu');
      var selEntry = LANGS.find(function (l) { return l.code === sel; }) || LANGS[0];
      if (btn) renderChip(btn, selEntry);
      if (menu) {
        var bs = menu.querySelectorAll('button[data-lang]');
        for (var j = 0; j < bs.length; j++) bs[j].classList.toggle('active', bs[j].getAttribute('data-lang') === sel);
      }
    }
    function buildMenu() {
      var menu = document.getElementById('langMenu');
      if (!menu) return;
      menu.innerHTML = '';
      LANGS.forEach(function (lang) {
        var b = document.createElement('button');
        b.setAttribute('data-lang', lang.code);
        renderChip(b, lang);
        menu.appendChild(b);
      });
    }

    buildMenu();
    applyLang(pickInitial());

    var wrap = document.getElementById('langWrap');
    var btn = document.getElementById('langBtn');
    var menu = document.getElementById('langMenu');
    if (btn && menu && wrap) {
      btn.addEventListener('click', function (e) { e.stopPropagation(); menu.classList.toggle('open'); });
      document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) menu.classList.remove('open'); });
      menu.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-lang]');
        if (!b) return;
        var sel = b.getAttribute('data-lang');
        if (sel === 'auto') localStorage.removeItem(LS_KEY); else localStorage.setItem(LS_KEY, sel);
        applyLang(sel);
        menu.classList.remove('open');
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
