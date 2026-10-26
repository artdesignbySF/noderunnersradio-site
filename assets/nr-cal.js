/* nr-cal.js v2 (2026-10-22; v2: dates in a page's own text, data-dates) -- SF: "I can imagine folks having the option of setting the site to whatever calendar they
   please kinda like they now can select languages" -> Human Era "add it!", block heights "yes, I like it", the default
   stays Gregorian; 2026-10-22 "calendar upgrade plz". A second pill beside the language pill:
     Gregorian     the normal calendar (default)
     Human Era     year + 10,000 (12026): the Holocene calendar
     Block height  the Bitcoin block mined at that moment, from the station's own node (exact for the past; a future
                   date shows an estimate, "≈", 144 blocks a day)
   The page's own code asks window.nrCalDay(date) / window.nrCalTime(date) for its dates and redraws on nrCalOnSwitch.
   Black and white first: the chosen row is boxed, bold and ticked (the same look as the language pill). */
(function () {
  var CALS = ["greg", "he", "block"];
  var L = {
    en: {lbl: "Calendar", greg: "Gregorian", he: "Human Era", block: "Block height", blk: "block {n}", est: "≈ block {n}"},
    nl: {lbl: "Kalender", greg: "Gregoriaans", he: "Holoceen (HE)", block: "Blokhoogte", blk: "blok {n}", est: "≈ blok {n}"},
    de: {lbl: "Kalender", greg: "Gregorianisch", he: "Holozän (HE)", block: "Blockhöhe", blk: "Block {n}", est: "≈ Block {n}"},
    fr: {lbl: "Calendrier", greg: "Grégorien", he: "Ère humaine", block: "Hauteur de bloc", blk: "bloc {n}", est: "≈ bloc {n}"},
    es: {lbl: "Calendario", greg: "Gregoriano", he: "Era Humana", block: "Altura de bloque", blk: "bloque {n}", est: "≈ bloque {n}"},
    it: {lbl: "Calendario", greg: "Gregoriano", he: "Era Umana", block: "Altezza del blocco", blk: "blocco {n}", est: "≈ blocco {n}"},
    pt: {lbl: "Calendário", greg: "Gregoriano", he: "Era Humana", block: "Altura do bloco", blk: "bloco {n}", est: "≈ bloco {n}"},
    ru: {lbl: "Календарь", greg: "Григорианский", he: "Эра человечества", block: "Высота блока", blk: "блок {n}", est: "≈ блок {n}"},
    zh: {lbl: "日历", greg: "公历", he: "人类纪元", block: "区块高度", blk: "区块 {n}", est: "≈ 区块 {n}"},
    ja: {lbl: "カレンダー", greg: "西暦", he: "人類紀元", block: "ブロック高", blk: "ブロック{n}", est: "≈ ブロック{n}"}
  };
  var cal = "greg";
  try {
    var q = new URLSearchParams(location.search).get("cal"), s = localStorage.getItem("nrCal");
    cal = CALS.indexOf(q) >= 0 ? q : (CALS.indexOf(s) >= 0 ? s : "greg");
  } catch (e) {}
  var hooks = [], tip = null, known = {}, wanted = {}, tried = {}, flushT = null, busy = false;

  function lang() { try { var l = window.nrLangNow ? window.nrLangNow() : "en"; return L[l] ? l : "en"; } catch (e) { return "en"; } }
  function S(k) { var d = L[lang()]; return d[k] || L.en[k]; }
  function loc() { try { return window.nrLocale ? window.nrLocale() : "en-US"; } catch (e) { return "en-US"; } }
  function num(n) { try { return Number(n).toLocaleString(loc()); } catch (e) { return String(n); } }
  function toDate(x) {
    if (x instanceof Date) return x;
    if (typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x)) return new Date(x + "T12:00:00Z");
    return new Date(x);
  }
  function minute(d) { return Math.floor(d.getTime() / 60000) * 60; }
  function heFmt(d, opts) {
    try {
      return new Intl.DateTimeFormat(loc(), opts).formatToParts(d).map(function (p) {
        return p.type === "year" ? String(Number(p.value) + 10000) : p.value;
      }).join("");
    } catch (e) { return d.toDateString(); }
  }
  // the block mined at that moment: from the station's node (asked in batches), else an estimate from the tip
  function block(d) {
    var ts = minute(d), now = Date.now() / 1000;
    if (known[ts] != null) return S("blk").replace("{n}", num(known[ts]));
    if (ts <= now && !tried[ts]) { tried[ts] = 1; wanted[ts] = 1; schedule(); }   // asked once per minute
    if (!tip) return null;
    var est = Math.round(tip.height + (ts - tip.time) / 600);
    return S("est").replace("{n}", num(est));
  }
  function schedule() { if (!flushT) flushT = setTimeout(flush, 60); }
  function flush() {
    flushT = null;
    if (busy) { schedule(); return; }
    var list = Object.keys(wanted).slice(0, 60);
    if (!list.length) return;
    busy = true;
    for (var i = 0; i < list.length; i++) delete wanted[list[i]];
    fetch("/api/blocks?ts=" + list.join(","), {cache: "no-store"}).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.tip) tip = j.tip;
      var b = (j && j.blocks) || {};
      for (var k in b) known[k] = b[k];
      busy = false; run();
      if (Object.keys(wanted).length) schedule();
    }).catch(function () { busy = false; });
  }
  function run() { for (var i = 0; i < hooks.length; i++) { try { hooks[i](cal); } catch (e) {} } }

  window.nrCalNow = function () { return cal; };
  window.nrCalOnSwitch = function (fn) { if (typeof fn === "function") hooks.push(fn); };
  // a calendar date ("21 July 2027" / "21 July 12027" / "≈ block 1,011,800")
  window.nrCalDay = function (x) {
    var d = toDate(x), opts = {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"};
    if (isNaN(d)) return String(x);
    if (cal === "he") return heFmt(d, opts);
    if (cal === "block") { var b = block(d); if (b) return b; }
    try { return d.toLocaleDateString(loc(), opts); } catch (e) { return String(x); }
  };
  // a time of day for lists (History): the clock, or the block in block mode
  window.nrCalTime = function (x) {
    var d = toDate(x);
    if (isNaN(d)) return "";
    if (cal === "block") { var b = block(d); if (b) return b; }
    try { return d.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}); } catch (e) { return ""; }
  };

  // ---- v2 (2026-10-22, SF: "I don't see it on the progress page"): dates written in a page's own text. A page opts in
  // with <script src="/assets/nr-cal.js" data-dates=".date">; every matching element's English date ("Oct 3, 2026",
  // "Sep 23–27, 2026", "Aug 26–Sep 1, 2026", "2026-07-23", plus a tail like " — later that day") is redrawn in the
  // visitor's calendar AND language. Anything it cannot read stays exactly as written.
  var DSEL = (document.currentScript && document.currentScript.getAttribute("data-dates")) || "";
  var MON = {Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11};
  function iso(y, m, d) { return new Date(Date.UTC(y, m, d, 12)); }
  function parseDate(t) {
    var m = t.match(/^\s*(\d{4})-(\d{2})-(\d{2})(.*)$/);
    if (m) return {a: iso(+m[1], +m[2] - 1, +m[3]), b: null, tail: m[4]};
    m = t.match(/^\s*([A-Z][a-z]{2}) (\d{1,2})(?:\s*[–-]\s*(?:([A-Z][a-z]{2}) )?(\d{1,2}))?, (\d{4})(.*)$/);
    if (!m || !(m[1] in MON) || (m[3] && !(m[3] in MON))) return null;
    var y = +m[5], a = iso(y, MON[m[1]], +m[2]);
    var b = m[4] ? iso(y, m[3] ? MON[m[3]] : MON[m[1]], +m[4]) : null;
    return {a: a, b: b, tail: m[6]};
  }
  function one(d) {
    var opts = {day: "numeric", month: "short", year: "numeric", timeZone: "UTC"};
    if (cal === "he") return heFmt(d, opts);
    if (cal === "block") { var b = block(d); if (b) return b; }
    try { return d.toLocaleDateString(loc(), opts); } catch (e) { return d.toDateString(); }
  }
  function dates() {
    if (!DSEL) return;
    var els = document.querySelectorAll(DSEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.hasAttribute("data-cal-orig")) el.setAttribute("data-cal-orig", el.textContent);
      var orig = el.getAttribute("data-cal-orig"), p = parseDate(orig);
      if (!p) continue;
      var txt = one(p.a) + (p.b ? " – " + one(p.b) : "") + p.tail;
      if (cal === "greg" && lang() === "en") txt = orig;                      // English + Gregorian: exactly as written
      el.textContent = txt;
      el.title = cal === "greg" ? "" : orig;                                   // tap/hover: the normal date
    }
  }
  if (DSEL) { window.nrCalOnSwitch(dates); if (window.nrI18nOnSwitch) window.nrI18nOnSwitch(dates); }

  // v2: a duration ("live for 33h 54m") in block mode = the blocks mined since then (SF 2026-10-22)
  var BL = {en: "{n} blocks", nl: "{n} blokken", de: "{n} Blöcke", fr: "{n} blocs", es: "{n} bloques", it: "{n} blocchi",
            pt: "{n} blocos", ru: "{n} бл.", zh: "{n} 个区块", ja: "{n}ブロック"};
  window.nrCalDur = function (since) {
    if (cal !== "block" || !tip) return null;
    var d = toDate(since);
    if (isNaN(d)) return null;
    var ts = minute(d), h0 = known[ts];
    if (h0 == null && !tried[ts]) { tried[ts] = 1; wanted[ts] = 1; schedule(); }
    var n = Math.max(0, h0 != null ? tip.height - h0 : Math.round((tip.time - ts) / 600));
    return (h0 != null ? "" : "≈ ") + (BL[lang()] || BL.en).replace("{n}", num(n));
  };
  setInterval(function () {                                        // the tip moves on: refresh it every 5 minutes
    if (cal !== "block") return;
    fetch("/api/blocks", {cache: "no-store"}).then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.tip && (!tip || j.tip.height !== tip.height)) { tip = j.tip; run(); } }).catch(function () {});
  }, 300000);

  // ---- the pill, beside every language pill
  var CSS = ".nrCal { position: relative; display: inline-flex; align-items: center; font-size: 0.66rem; letter-spacing: 0.06em; color: var(--foam, #fff); } .nrCal .nrDd { position: relative; } .nrCal .nrDd > summary { list-style: none; display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border: 1px solid var(--nrLangEdge, var(--signal, #f7931a)); border-radius: 3px; cursor: pointer; font-weight: 700; line-height: 1.4; user-select: none; } .nrCal .nrDd > summary::-webkit-details-marker { display: none; } .nrCal .nrDd > summary { color: var(--foam-dim, var(--ink-dim, var(--mist, #9aa))); } .nrCal .nrDd > summary:hover, .nrCal .nrDd[open] > summary { color: var(--foam, var(--ink, var(--paper, #fff))); } .nrCal .nrDd > summary:focus-visible { outline: 3px solid var(--signal, #f5a623); outline-offset: 2px; } .nrCal .nrCaret { display: inline-block; font-size: 0.8em; transition: transform .15s; } .nrCal .nrDd[open] > summary .nrCaret { transform: rotate(180deg); } .nrCal .nrDdMenu { position: absolute; right: 0; top: calc(100% + 4px); min-width: 12em; max-width: calc(100vw - 16px); display: grid; gap: 2px; padding: 4px; background: #0f141b; color: var(--foam, #fff); border: 1px solid currentColor; border-radius: 8px; z-index: 50; box-shadow: 0 6px 18px rgba(0,0,0,.45); text-align: left; } .nrCal .nrDdMenu a, .nrCal .nrDdMenu .cur { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 4px; white-space: nowrap; text-decoration: none; color: inherit; border: 2px solid transparent; min-height: 32px; box-sizing: border-box; text-transform: none; font-weight: 400; } .nrCal .nrDdMenu a:hover, .nrCal .nrDdMenu a:focus-visible { border-color: currentColor; outline: none; } .nrCal .nrDdMenu b { font-weight: 700; } .nrCal .nrDdMenu .cur { font-weight: 700; } .nrCal .nrDdMenu .nm { font-weight: 400; letter-spacing: 0; } .nrCal .nrDdMenu .ck { margin-left: auto; font-weight: 700; } .nrCal { margin-left: 6px; } .nrCal .nrDdMenu .nm { margin-left: 10px; opacity: .8; }";
  function css() {
    if (document.getElementById("nrCalCss")) return;
    var st = document.createElement("style"); st.id = "nrCalCss"; st.textContent = CSS; document.head.appendChild(st);
  }
  function now(c) {
    var d = new Date(), y = d.getUTCFullYear();
    if (c === "he") return String(y + 10000);
    if (c === "block") return tip ? "#" + num(tip.height) : "#";
    return String(y);
  }
  function render() {
    css();
    var langs = document.querySelectorAll(".nrLang");
    for (var i = 0; i < langs.length; i++) {
      var el = langs[i].nextElementSibling;
      if (!el || !el.classList || !el.classList.contains("nrCal")) {
        el = document.createElement("span"); el.className = "nrCal"; el.setAttribute("role", "group");
        langs[i].parentNode.insertBefore(el, langs[i].nextSibling);
      }
      el.setAttribute("aria-label", S("lbl"));
      var h = '<details class="nrDd"><summary title="' + S("lbl") + ": " + S(cal) + '"><b>' + now(cal) +
              '</b><span class="nrCaret" aria-hidden="true">&#9662;</span></summary><div class="nrDdMenu">';
      for (var k = 0; k < CALS.length; k++) {
        var c = CALS[k], inner = '<b>' + S(c) + '</b><span class="nm">' + now(c) + '</span>';
        h += c === cal ? '<span class="cur" aria-current="true">' + inner + '<span class="ck" aria-hidden="true">&#10003;</span></span>'
                       : '<a href="#" data-cal="' + c + '">' + inner + '</a>';
      }
      el.innerHTML = h + "</div></details>";
    }
  }
  function pick(c) {
    if (CALS.indexOf(c) < 0 || c === cal) return;
    cal = c;
    try { localStorage.setItem("nrCal", c); } catch (e) {}
    render(); run();
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest(".nrCal a[data-cal]") : null;
    if (a) { e.preventDefault(); pick(a.getAttribute("data-cal")); return; }
    var open = document.querySelectorAll(".nrCal .nrDd[open]");
    for (var i = 0; i < open.length; i++) if (!open[i].contains(e.target)) open[i].removeAttribute("open");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var open = document.querySelectorAll(".nrCal .nrDd[open]");
    for (var i = 0; i < open.length; i++) open[i].removeAttribute("open");
  });
  if (window.nrI18nOnSwitch) window.nrI18nOnSwitch(function () { render(); run(); });
  window.nrCalOnSwitch(render);                                  // the tip height lands -> the pill shows it
  function start() { render(); dates(); fetch("/api/blocks", {cache: "no-store"}).then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.tip) { tip = j.tip; render(); if (cal === "block") run(); } }).catch(function () {}); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
