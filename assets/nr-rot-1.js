/* nr-rot-1.js (2026-10-06) -- the captain's rotation button on the homepage.
   SF: "something on the main page that only I as captain can click/tap when logged in, to add a song to the
   steady rotation ... and a signal, just for me, that the song is in background rotation or not."
   Drawn ONLY when /api/session says authed. The server checks the captain cookie again on every call.
   Black and white first: the SHAPE and the WORD carry the state, never colour.
     empty circle + "+"    Add to rotation        (press = add)
     solid circle + check  In rotation            (press = asks "Take out?", a second press within 6 s removes)
     circle + slash        Can't add: <reason>    (no press)                                                  */
(function () {
  'use strict';
  var NOW = '/api/admin/rotation/now', POLL_MS = 10000, CONFIRM_MS = 6000;
  var btn, word, icon, cur = null, confirmUntil = 0, busy = false, timer = null, lastTitle = '';

  var SVG = {
    out:  '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>' +
          '<path d="M12 7.5v9M7.5 12h9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    'in': '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
          '<path d="M7.2 12.4l3.2 3.2 6.4-7" fill="none" stroke="var(--nrrot-cut,#0b1a1f)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    ask:  '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2.4"/>' +
          '<path d="M8 12h8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    cant: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
          '<path d="M5.8 18.2L18.2 5.8" stroke="currentColor" stroke-width="1.6"/>',
    busy: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="2 3"/>'
  };

  function css() {
    var s = document.createElement('style');
    s.textContent =
      '#nrRotRow{display:flex;align-items:center;gap:10px;padding:0 20px 10px;}' +
      '#nrRotRow .cap{font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--foam-dim,#9bb);}' +
      '#nrRotBtn{display:inline-flex;align-items:center;gap:6px;flex:0 0 auto;margin:0;padding:3px 9px 3px 5px;' +
      'background:none;border:1px solid var(--line,#1d3a42);border-radius:999px;color:var(--foam,#e6f2f2);cursor:pointer;' +
      'font:inherit;font-size:.7rem;line-height:1.1;letter-spacing:.02em;white-space:nowrap;}' +
      '#nrRotBtn svg{width:20px;height:20px;flex:0 0 auto;}' +
      '#nrRotBtn[data-state="in"]{font-weight:700;border-width:2px;}' +
      '#nrRotBtn[data-state="ask"]{font-weight:700;border-style:dashed;border-width:2px;}' +
      '#nrRotBtn[data-state="cant"]{cursor:default;opacity:.62;border-style:dotted;}' +
      '#nrRotBtn[data-state="busy"]{cursor:progress;}' +
      '#nrRotBtn:focus-visible{outline:2px solid currentColor;outline-offset:2px;}' +
      '@media (max-width:640px){#nrRotBtn .w{max-width:7.5em;overflow:hidden;text-overflow:ellipsis;}}';
    document.head.appendChild(s);
  }

  function draw(state, text, tip) {
    btn.setAttribute('data-state', state);
    icon.innerHTML = SVG[state] || SVG.cant;
    word.textContent = text;
    btn.title = tip || text;
    btn.setAttribute('aria-label', (tip || text) + ' (captain only)');
    btn.disabled = (state === 'cant' || state === 'busy');
  }

  function show() {
    if (!cur) { draw('busy', 'Rotation…', 'Checking the rotation'); return; }
    if (Date.now() < confirmUntil && cur.state === 'in') {
      draw('ask', 'Take out? Tap again', 'Tap again within 6 seconds to take "' + cur.title + '" out of the rotation');
      return;
    }
    if (cur.state === 'in') draw('in', 'In rotation', '"' + cur.title + '" is in the background rotation. Tap to take it out.');
    else if (cur.state === 'out') draw('out', 'Add to rotation', 'Add "' + cur.title + '" to the background rotation');
    else draw('cant', "Can't add", "Can't add to the rotation: " + (cur.reason || 'unknown'));
  }

  function load() {
    return fetch(NOW, {cache: 'no-store', credentials: 'same-origin'})
      .then(function (r) { if (r.status === 403) { stop(); return null; } return r.json(); })
      .then(function (d) { if (d && d.state) { cur = d; if (Date.now() >= confirmUntil) confirmUntil = 0; show(); } })
      .catch(function () {});
  }

  function stop() {
    if (timer) clearInterval(timer); timer = null;
    var row = document.getElementById('nrRotRow'); if (row) row.remove();
  }

  function post(what) {
    busy = true;
    draw('busy', what === 'add' ? 'Adding…' : 'Taking out…');
    var body = 'path=' + encodeURIComponent(cur.path);
    return fetch('/api/admin/rotation/' + what, {method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: body})
      .then(function (r) { return r.json().then(function (j) { return {ok: r.ok, j: j}; }); })
      .then(function (res) {
        if (!res.ok) { draw('cant', 'Not done', (res.j && (res.j.message || res.j.error)) || 'refused'); }
      })
      .catch(function () { draw('cant', 'Not done', 'The station did not answer'); })
      .then(function () { busy = false; confirmUntil = 0; setTimeout(load, 1500); });
  }

  function onClick() {
    if (busy || !cur) return;
    if (cur.state === 'out') { post('add'); return; }
    if (cur.state !== 'in') return;
    if (Date.now() < confirmUntil) { post('remove'); return; }
    confirmUntil = Date.now() + CONFIRM_MS;
    show();
    setTimeout(function () { if (!busy && Date.now() >= confirmUntil) { confirmUntil = 0; show(); } }, CONFIRM_MS + 50);
  }

  function mount() {
    // Its own slim row UNDER the now-playing bar: the bar is already full, and the song text must keep its room.
    var bar = document.querySelector('.nowbar');
    if (!bar || document.getElementById('nrRotBtn')) return;
    css();
    var row = document.createElement('div');
    row.id = 'nrRotRow';
    bar.parentNode.insertBefore(row, bar.nextSibling);
    btn = document.createElement('button');
    btn.type = 'button'; btn.id = 'nrRotBtn';
    icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('aria-hidden', 'true');
    word = document.createElement('span'); word.className = 'w';
    btn.appendChild(icon); btn.appendChild(word);
    btn.addEventListener('click', onClick);
    var lab = document.createElement('span');
    lab.className = 'cap'; lab.textContent = 'Captain';
    row.appendChild(lab); row.appendChild(btn);
    show();
    load();
    timer = setInterval(function () { if (!busy && !document.hidden) load(); }, POLL_MS);
    var t = document.getElementById('npTitle');
    if (t && window.MutationObserver) {
      new MutationObserver(function () {
        if (t.textContent !== lastTitle) { lastTitle = t.textContent; confirmUntil = 0; setTimeout(load, 1200); }
      }).observe(t, {childList: true, characterData: true, subtree: true});
    }
  }

  function start() {
    fetch('/api/session', {cache: 'no-store', credentials: 'same-origin'})
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.authed) mount(); })
      .catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
