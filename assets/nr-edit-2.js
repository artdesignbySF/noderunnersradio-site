/* nr-edit-2.js (2026-10-04: Ctrl+B / Ctrl+I handled here -- Firefox opened its bookmarks) -- was nr-edit.js (2026-09-14) -- the captain's Edit button. Drawn ONLY when /api/session says authed (the console's
   HttpOnly cookie); everyone else gets nothing. English only: the other five languages follow (DeepL or by hand).
   Edit mode makes every translatable block editable; Save posts the changed blocks to /api/admin/page/save, which checks
   the cookie again. Text only. */
(function () {
  'use strict';
  var PAGES = ['dj-handbook', 'funding', 'manifesto', 'obs-guide', 'progress', 'roadmap', 'why-sats'];
  var SHARED = ['top', 'playBadge', 'englishCounts', 'langLabel'];
  var page = location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
  if (PAGES.indexOf(page) < 0) return;
  var els = [], bar = null, btn = null, msgEl = null, countEl = null;

  fetch('/api/session', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (d) { if (d && d.authed === true) mount(); })
    .catch(function () {});

  function lang() {
    var l = document.documentElement.lang || '';
    if (!l) { try { l = localStorage.getItem('nrLang') || ''; } catch (e) {} }
    return ['en', 'nl', 'de', 'fr', 'es', 'pt'].indexOf(l) >= 0 ? l : 'en';
  }
  function shared(k) { for (var i = 0; i < SHARED.length; i++) { if (k.indexOf(SHARED[i]) === 0) return true; } return false; }
  function targets() {
    var out = [], n = document.querySelectorAll('[data-i18n], [data-i18n-html]');
    for (var i = 0; i < n.length; i++) {
      var el = n[i], k = el.getAttribute('data-i18n-html') || el.getAttribute('data-i18n');
      if (!k || shared(k)) continue;
      if (el.tagName === 'TITLE' || el.closest('header, nav, .nrLang, .nrEnCounts')) continue;
      out.push(el);
    }
    return out;
  }
  function css() {
    var s = document.createElement('style');
    s.textContent =
      '#nrEditBtn{position:fixed;right:14px;bottom:14px;z-index:9999;font:700 14px/1 ui-monospace,Menlo,Consolas,monospace;' +
      'padding:10px 14px;background:#000;color:#fff;border:2px solid #fff;border-radius:6px;cursor:pointer;letter-spacing:.04em}' +
      '#nrEditBtn:focus-visible{outline:3px solid #fff;outline-offset:2px}' +
      'body.nrEditOn .nrEditable{outline:2px dashed #fff;outline-offset:3px;cursor:text;min-height:1em}' +
      'body.nrEditOn .nrEditable.nrChanged{outline:3px solid #fff}' +
      '#nrEditBar{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;gap:10px;align-items:center;flex-wrap:wrap;' +
      'padding:10px 14px;background:#000;color:#fff;border-top:2px solid #fff;font:14px/1.3 ui-monospace,Menlo,Consolas,monospace}' +
      '#nrEditBar button{font:700 13px/1 ui-monospace,Menlo,Consolas,monospace;padding:8px 12px;border:2px solid #fff;border-radius:6px;background:#000;color:#fff;cursor:pointer}' +
      '#nrEditBar button.nrPrimary{background:#fff;color:#000}' +
      '#nrEditBar .nrMsg{margin-left:auto}#nrEditBar .nrErr{text-decoration:underline;font-weight:700}';
    document.head.appendChild(s);
  }
  function mount() {
    // the i18n runtime sets <html lang> on DOMContentLoaded; read the language only after that
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function () { setTimeout(mount2, 0); }); }
    else { setTimeout(mount2, 0); }
  }
  function toEnglish() { location.href = location.pathname + '?lang=en'; }
  function mount2() {
    css();
    btn = document.createElement('button');
    btn.id = 'nrEditBtn'; btn.type = 'button';
    if (lang() === 'en') {
      btn.textContent = '\u270E Edit';
      btn.setAttribute('aria-label', 'Edit the text on this page (captain only)');
      btn.addEventListener('click', start);
    } else {
      btn.textContent = '\u270E Edit in English';
      btn.setAttribute('aria-label', 'Editing happens in English; the other languages follow. Switch to English.');
      btn.addEventListener('click', toEnglish);
    }
    document.body.appendChild(btn);
  }
  function start() {
    if (lang() !== 'en') { toEnglish(); return; }
    els = targets();
    if (!els.length) { alert('Nothing on this page is editable yet (its text is not keyed for translation).'); return; }
    btn.hidden = true;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      el.setAttribute('data-nr-orig', el.innerHTML);
      el.contentEditable = 'true';
      el.classList.add('nrEditable');
      el.addEventListener('input', onInput);
      el.addEventListener('keydown', onKey);
      el.addEventListener('paste', onPaste);
    }
    bar = document.createElement('div'); bar.id = 'nrEditBar';
    bar.innerHTML = 'Editing <b>EN</b> \u00B7 <span id="nrEditCount">0</span> changed' +
      ' <button type="button" id="nrEditSave" class="nrPrimary">Save</button>' +
      ' <button type="button" id="nrEditCancel">Cancel</button><span class="nrMsg" id="nrEditMsg">Tap a block, change the words. Ctrl+B bold, Ctrl+I italic. Esc = cancel. The other languages follow.</span>';
    document.body.appendChild(bar);
    countEl = document.getElementById('nrEditCount'); msgEl = document.getElementById('nrEditMsg');
    document.getElementById('nrEditSave').addEventListener('click', save);
    document.getElementById('nrEditCancel').addEventListener('click', cancel);
    document.addEventListener('keydown', onEsc);
    document.body.classList.add('nrEditOn');
    document.body.style.paddingBottom = '70px';
  }
  function onEsc(e) { if (e.key === 'Escape') { e.preventDefault(); cancel(); } }
  function onKey(e) {
    if (e.key === 'Enter' && this.hasAttribute('data-i18n')) e.preventDefault();
    // nr-edit-2 (2026-10-04, SF: "ctrl+b opens bookmarks in firefox"): bold and italic are done HERE, and the
    // browser's own shortcut (Firefox: the bookmarks sidebar) is stopped inside an editable block. Plain-text
    // blocks (data-i18n) take neither, as before.
    var k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (k === 'b' || k === 'i')) {
      e.preventDefault(); e.stopPropagation();
      if (!this.hasAttribute('data-i18n')) document.execCommand(k === 'b' ? 'bold' : 'italic', false, null);
    }
  }
  function onPaste(e) {
    e.preventDefault();
    var t = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, t);
  }
  function changed() {
    var out = [];
    for (var i = 0; i < els.length; i++) { if (els[i].innerHTML !== els[i].getAttribute('data-nr-orig')) out.push(els[i]); }
    return out;
  }
  function onInput() {
    this.classList.toggle('nrChanged', this.innerHTML !== this.getAttribute('data-nr-orig'));
    if (countEl) countEl.textContent = String(changed().length);
  }
  function msg(t, err) { if (msgEl) { msgEl.textContent = t; msgEl.className = 'nrMsg' + (err ? ' nrErr' : ''); } }
  function save() {
    var ch = changed();
    if (!ch.length) { msg('Nothing changed.'); return; }
    var edits = ch.map(function (el) {
      var k = el.getAttribute('data-i18n-html');
      return k ? { key: k, html: el.innerHTML } : { key: el.getAttribute('data-i18n'), text: el.textContent };
    });
    msg('Saving\u2026 (with DeepL this can take a few seconds)');
    fetch('/api/admin/page/save', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: page, lang: 'en', edits: edits })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, status: r.status, d: d }; }); })
      .then(function (res) {
        if (res.ok && res.d && res.d.ok) {
          var d = res.d, sk = (d.skipped || []).length, t = '';
          if (d.translated) { var n = 0; for (var l in d.translated) n += d.translated[l] ? 1 : 0; t = ' \u00B7 translated into ' + n + ' languages'; }
          else if (d.translate_error) { t = ' \u00B7 DeepL failed (' + d.translate_error + '), the translations wait'; }
          else { t = ' \u00B7 ' + (d.waiting || []).length + ' block(s) wait for translation'; }
          msg('Saved ' + d.saved.length + ' block(s)' + t + (sk ? ' \u00B7 ' + sk + ' skipped (' + d.skipped.map(function (x) { return x.key + ': ' + x.why; }).join('; ') + ')' : '') + '. Backup ' + d.backup + '. Reloading\u2026');
          setTimeout(function () { location.reload(); }, (sk || d.translate_error) ? 5000 : 1500);
        } else {
          msg('Not saved: ' + ((res.d && res.d.error) || ('HTTP ' + res.status)), true);
        }
      })
      .catch(function (e) { msg('Not saved: ' + e, true); });
  }
  function cancel() { location.reload(); }
})();
