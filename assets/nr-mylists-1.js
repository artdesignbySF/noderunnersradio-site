/* nr-mylists-1.js (2026-10-24) -- the captain's own playlists on the homepage, laid out like the catalog.
   SF: "add my playlists to the homepage in the same way as you did the entire catalog... its own spot somewhere, but only
   for me and only when I'm logged in."
   Drawn ONLY when /api/session says authed: a visitor's browser never builds it, and every call below is checked again by
   the server against the captain cookie (403 otherwise). Uses the console's own endpoints, nothing new on the server:
     GET  /api/admin/mood/playlists      the playlists, with song counts
     GET  /api/admin/mood/list?name=X    one playlist's songs, in order (+ the songs that never reached the server)
     POST /api/admin/play  path=...      the captain's free play: top of the captain's line, after the current song
   Black and white first: the "Play now" button is an outlined pill with a triangle and a word, the playing list is the
   pressed (light) row, songs not aboard are dimmed AND marked with a word.                                            */
(function () {
  'use strict';
  var PAGE = 400;                       // rows drawn at a time; the rest arrive as the list scrolls
  var box, left, right, lh, rh, q, st = {lists: [], name: '', songs: [], shown: 0, seq: 0};

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function dur(d) { d = parseInt(d || 0, 10) || 0; return d > 0 ? Math.floor(d / 60) + ':' + ('0' + d % 60).slice(-2) : ''; }
  function get(u) {
    return fetch(u, {cache: 'no-store', credentials: 'same-origin'}).then(function (r) {
      if (r.status === 403) { gone(); throw new Error('not logged in'); }
      if (!r.ok) throw new Error(r.status); return r.json();
    });
  }
  function gone() { var s = document.getElementById('nrMyLists'); if (s) s.remove(); }

  function css() {
    var s = document.createElement('style');
    s.textContent =
      '#nrMyLists .nrMyNote{font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--foam-dim,#9bb);}' +
      '#nrMyLists .nrMyPlay{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;font:inherit;font-size:.7rem;' +
      'background:none;color:var(--foam,#e6f2f2);border:1px solid var(--foam-dim,#9bb);border-radius:999px;cursor:pointer;white-space:nowrap;}' +
      '#nrMyLists .nrMyPlay:hover,#nrMyLists .nrMyPlay:focus-visible{border-width:2px;font-weight:bold;}' +
      '#nrMyLists .nrMyPlay[disabled]{cursor:progress;border-style:dashed;}' +
      '#nrMyLists .nrMyPlay.done{border-width:2px;font-weight:bold;}' +
      '#nrMyLists .nrMyOff{font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;color:var(--foam-dim,#9bb);white-space:nowrap;}' +
      '#nrMyLists .nrCatRow.off .ti{opacity:.55;}' +
      '#nrMyLists .nrMyQ{flex:1 1 160px;min-width:120px;}';
    document.head.appendChild(s);
  }

  function mount() {
    var cat = document.getElementById('nrCatalog');
    if (!cat || document.getElementById('nrMyLists')) return;
    css();
    box = document.createElement('section');
    box.className = 'panel nrCat'; box.id = 'nrMyLists';
    box.innerHTML =
      '<div class="nrCatHead"><span class="nrCatEye">Captain · my playlists</span>' +
      '<span class="nrMyNote">only you see this</span>' +
      '<input type="search" class="nrCatQ nrMyQ" autocomplete="off" placeholder="filter this playlist…"></div>' +
      '<div class="nrCatCols">' +
      '<div class="nrCatBox"><h3 id="nrMyLeftHead">playlists</h3><div class="nrCatList" id="nrMyLeft"></div></div>' +
      '<div class="nrCatBox"><h3 id="nrMyRightHead"></h3><div class="nrCatList" id="nrMyRight"></div></div></div>' +
      '<div class="nrCatFoot"><span>Play now: free, top of your line, after the current song.</span><span></span></div>';
    cat.parentNode.insertBefore(box, cat.nextSibling);
    left = document.getElementById('nrMyLeft'); right = document.getElementById('nrMyRight');
    lh = document.getElementById('nrMyLeftHead'); rh = document.getElementById('nrMyRightHead');
    q = box.querySelector('.nrMyQ');
    right.innerHTML = '<p class="nrCatMuted">Pick a playlist on the left.</p>';
    left.innerHTML = '<p class="nrCatMuted">Loading…</p>';
    get('/api/admin/mood/playlists').then(function (d) {
      st.lists = d.playlists || [];
      lh.textContent = 'playlists · ' + st.lists.length;
      left.innerHTML = st.lists.map(function (p, i) {
        return '<button type="button" class="nrCatA" data-i="' + i + '" aria-pressed="false"><span class="nm">' + esc(p.name) +
               (p.missing ? ' <small>· ' + p.missing + ' not aboard</small>' : '') + '</span><span class="n">' + p.tracks + '</span></button>';
      }).join('') || '<p class="nrCatMuted">No playlists on the server.</p>';
    }).catch(function () { left.innerHTML = '<p class="nrCatMuted">The playlists did not load.</p>'; });
    box.addEventListener('click', onClick);
    right.addEventListener('scroll', function () {
      if (right.scrollTop + right.clientHeight >= right.scrollHeight - 160) more();
    });
    var qt = null;
    q.addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(draw, 250); });
  }

  function open(i) {
    var p = st.lists[i], my = ++st.seq;
    if (!p) return;
    st.name = p.name; st.songs = []; st.shown = 0;
    rh.textContent = p.name; right.innerHTML = '<p class="nrCatMuted">Loading…</p>';
    get('/api/admin/mood/list?name=' + encodeURIComponent(p.name)).then(function (d) {
      if (my !== st.seq) return;
      var songs = (d.songs || []).map(function (s) { return {n: s.n, path: s.path, artist: s.artist, title: s.title, dur: s.dur, ok: !!s.indexed}; });
      (d.missing || []).forEach(function (m) { songs.push({n: '', artist: m.artist, title: m.title, dur: 0, ok: false, miss: true}); });
      st.songs = songs;
      draw();
    }).catch(function () { if (my === st.seq) right.innerHTML = '<p class="nrCatMuted">This playlist did not load.</p>'; });
  }

  function list() {
    var w = (q.value || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!w.length) return st.songs;
    return st.songs.filter(function (s) { var h = (s.artist + ' ' + s.title).toLowerCase(); return w.every(function (x) { return h.indexOf(x) >= 0; }); });
  }
  function row(s, i) {
    var act = s.ok ? '<button type="button" class="nrMyPlay" data-k="' + i + '" title="Free, top of your line">' +
                     '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>Play now</button>'
                   : '<span class="nrMyOff">' + (s.miss ? 'not aboard' : 'not indexed') + '</span>';
    return '<div class="nrCatRow' + (s.ok ? '' : ' off') + '"><div class="nrCatT"><span class="no">' + esc(s.n) + '</span>' +
           '<span class="ti" title="' + esc(s.title) + '">' + esc(s.title) + (s.artist ? ' <small>· ' + esc(s.artist) + '</small>' : '') + '</span>' +
           '<span class="len">' + dur(s.dur) + '</span>' + act + '</div><div class="nrCatMsg"></div></div>';
  }
  function draw() {
    if (!st.name) return;
    var l = list();
    st.view = l; st.shown = 0;
    var miss = st.songs.filter(function (s) { return s.miss; }).length;
    rh.textContent = st.name + ' · ' + (l.length === st.songs.length ? st.songs.length : l.length + ' of ' + st.songs.length) +
                     ' songs' + (miss ? ' · ' + miss + ' not aboard' : '');
    right.innerHTML = l.length ? '' : '<p class="nrCatMuted">Nothing matches.</p>';
    right.scrollTop = 0;
    more();
  }
  function more() {
    var l = st.view || [];
    if (st.shown >= l.length) return;
    var end = Math.min(l.length, st.shown + PAGE), h = '';
    for (var i = st.shown; i < end; i++) h += row(l[i], i);
    st.shown = end;
    right.insertAdjacentHTML('beforeend', h);
  }

  function play(b) {
    var s = (st.view || [])[+b.getAttribute('data-k')], msg = b.closest('.nrCatRow').querySelector('.nrCatMsg');
    if (!s || !s.path) return;
    b.disabled = true; msg.textContent = 'Queuing…';
    fetch('/api/admin/play', {method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: 'path=' + encodeURIComponent(s.path)})
      .then(function (r) { return r.json().then(function (j) { return {ok: r.ok, j: j}; }); })
      .then(function (res) {
        msg.textContent = res.ok ? '✓ ' + (res.j.message || 'queued') : '✗ ' + ((res.j && (res.j.error || res.j.message)) || 'refused');
        if (res.ok) b.classList.add('done');
      })
      .catch(function () { msg.textContent = '✗ The station did not answer.'; })
      .then(function () { b.disabled = false; });
  }

  function onClick(e) {
    var b = e.target.closest ? e.target.closest('button') : null;
    if (!b || !box.contains(b)) return;
    if (b.classList.contains('nrCatA')) {
      Array.prototype.forEach.call(left.querySelectorAll('.nrCatA'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      q.value = ''; open(+b.getAttribute('data-i')); return;
    }
    if (b.classList.contains('nrMyPlay')) play(b);
  }

  function start() {
    fetch('/api/session', {cache: 'no-store', credentials: 'same-origin'})
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.authed) mount(); })
      .catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
