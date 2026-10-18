/* Site chrome: interface language (vi default) and theme (system default). */
(function () {
  'use strict';

  var I18N = {
    vi: {
      'nav.posts': 'Bài viết',
      'nav.about': 'Giới thiệu',
      'header.tagline': 'Kỹ sư phần mềm. Ghi chép về web, công cụ và AI.',
      'home.title': 'Bài viết',
      'home.intro': 'Những thứ mình học được và làm, mới nhất lên đầu.',
      'theme.system': 'Hệ thống',
      'theme.light': 'Sáng',
      'theme.dark': 'Tối',
      'footer.license': 'Theme theo giấy phép',
      'footer.updated': 'Cập nhật',
      'about.role': 'Kỹ sư phần mềm.',
      'notfound.title': 'Không tìm thấy trang',
      'notfound.body': 'Trang này không tồn tại. Quay về',
      'notfound.home': 'trang chủ'
    },
    en: {
      'nav.posts': 'Posts',
      'nav.about': 'About',
      'header.tagline': 'Software engineer. Notes on the web, tooling, and AI.',
      'home.title': 'Posts',
      'home.intro': "Things I've learned and built, newest first.",
      'theme.system': 'System',
      'theme.light': 'Light',
      'theme.dark': 'Dark',
      'footer.license': 'Theme licensed under',
      'footer.updated': 'Site updated',
      'about.role': 'Software engineer.',
      'notfound.title': 'Page not found',
      'notfound.body': 'That page does not exist. Return to the',
      'notfound.home': 'home page'
    }
  };

  var LANG_KEY = 'site-lang';
  var THEME_KEY = 'theme';
  var DEFAULT_LANG = 'vi';

  function stored(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
  }

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (err) {}
  }

  function currentLang() {
    var lang = stored(LANG_KEY) || document.documentElement.getAttribute('lang') || DEFAULT_LANG;
    return Object.prototype.hasOwnProperty.call(I18N, lang) ? lang : DEFAULT_LANG;
  }

  function setActive(attr, value) {
    var buttons = document.querySelectorAll('[' + attr + ']');
    for (var i = 0; i < buttons.length; i++) {
      var active = buttons[i].getAttribute(attr) === value;
      buttons[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  /* Homepage list: show posts in the active language. A post in another
     language stays visible only when its counterpart for the active
     language is missing from the list. */
  function applyPostFilter(lang) {
    var items = document.querySelectorAll('.post-item[data-lang]');
    if (!items.length) return;
    var localUrls = {};
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute('data-lang') !== lang) continue;
      var link = items[i].querySelector('a[href]');
      if (link) localUrls[link.getAttribute('href')] = true;
    }
    for (var j = 0; j < items.length; j++) {
      var itemLang = items[j].getAttribute('data-lang');
      var hide = false;
      if (itemLang !== lang) {
        var translations = null;
        try { translations = JSON.parse(items[j].getAttribute('data-translations') || 'null'); } catch (err) {}
        var counterpart = translations ? translations[lang] : null;
        hide = !!counterpart && !!localUrls[counterpart];
      }
      if (hide) items[j].setAttribute('hidden', '');
      else items[j].removeAttribute('hidden');
    }
  }

  function applyLang() {
    var lang = currentLang();
    var dict = I18N[lang];
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        nodes[i].textContent = dict[key];
      }
    }
    applyPostFilter(lang);
    setActive('data-lang-choice', lang);
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === 'light' || theme === 'dark') {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
    setActive('data-theme-choice', theme);
  }

  function chooseLang(lang) {
    if (!I18N.hasOwnProperty(lang)) return;
    var translations = window.__PAGE_TRANSLATIONS__;
    if (lang !== currentLang() && translations && translations[lang]) {
      store(LANG_KEY, lang);
      window.location.href = translations[lang];
      return;
    }
    store(LANG_KEY, lang);
    applyLang();
  }

  function chooseTheme(theme) {
    store(THEME_KEY, theme);
    applyTheme(theme);
  }

  function bind(attr, handler) {
    var buttons = document.querySelectorAll('[' + attr + ']');
    for (var i = 0; i < buttons.length; i++) {
      (function (button) {
        button.addEventListener('click', function () {
          handler(button.getAttribute(attr));
        });
      })(buttons[i]);
    }
  }

  applyTheme(stored(THEME_KEY) || 'system');
  applyLang();
  bind('data-lang-choice', chooseLang);
  bind('data-theme-choice', chooseTheme);
})();
