/* nr-charts-1.js (2026-10-17) -- nr_charts: the top-requests chart. ONE script for the homepage's Top tab and the /top
   page. SF: "a top 10, a top 21, a top 42, and a top 100 folks can scroll through on all fronts", "add a year and a decade
   tab but leave those greyed out until the time is right".
   B&W first: the chosen chip is a solid light plate with a dot; a closed chip is dashed and dim and says when it opens;
   climbed = a solid triangle with the places, dropped = an outlined triangle, NEW = a boxed word, same place = "=";
   the top three have bigger numbers; the bar's LENGTH is the count. Orange is a bonus only.
   Data: GET /api/charts (the station counts requests in its play log, never who asked). Texts in the seven site
   languages; it follows the page's language switch (window.nrLangNow / nrI18nOnSwitch). */
(function () {
  if (window.nrCharts) return;
  var S = {
    en: {p_week: "7 days", p_month: "30 days", p_all: "All time", p_year: "Year", p_decade: "Decade", size: "Top {n}",
      lane_all: "All lanes", lane_lib: "Ship library", lane_wav: "Wavlake · V4V",
      reqs_days: "{n} requests in the last {d} days · {s} songs", reqs_all: "{n} requests since {date} · {s} songs",
      closed: "Opens on {date}", soon: "Year opens on {y}. Decade on {d}.",
      again_a: "Request {title} again", again_t: "Find it in the jukebox. The usual request fee applies.",
      "new": "NEW", up_t: "climbed {n}", down_t: "dropped {n}", same_t: "same place", new_t: "new in this window",
      legend: "▲ climbed · ▽ dropped · NEW = new · = same place",
      cmp_week: "Marks compare with the 7 days before.", cmp_month: "Marks compare with the 30 days before.",
      cmp_all: "Marks compare with all time a week ago.", cmp_year: "Marks compare with the 365 days before.", cmp_decade: "Marks compare with the decade before.",
      note: "Counted from the station's play log. Requests only, never who asked.", full: "Full chart →",
      empty: "No requests in this window yet.", rest: "The charts are resting for now.",
      down: "The charts are not answering. Try again in a minute.", loading: "Loading…",
      wav_h: "Wavlake · V4V", wav_s: "Sats straight to the artist.", wav_e: "No Wavlake requests in this window yet.",
      yours_h: "Your song here?", yours_s: "Request it on the jukebox: the website, Telegram, Nostr or X.",
      yours_b: "▶ Play a song", times: "{n}×", aria_period: "Period", aria_size: "List size", aria_lane: "Lane"},
    nl: {p_week: "7 dagen", p_month: "30 dagen", p_all: "Aller tijden", p_year: "Jaar", p_decade: "Decennium", size: "Top {n}",
      lane_all: "Alles", lane_lib: "Scheepsbieb", lane_wav: "Wavlake · V4V",
      reqs_days: "{n} verzoekjes in de laatste {d} dagen · {s} nummers", reqs_all: "{n} verzoekjes sinds {date} · {s} nummers",
      closed: "Gaat open op {date}", soon: "Jaar gaat open op {y}. Decennium op {d}.",
      again_a: "{title} nog eens aanvragen", again_t: "Zoek het op in de jukebox. Het gewone verzoekbedrag geldt.",
      "new": "NIEUW", up_t: "{n} gestegen", down_t: "{n} gezakt", same_t: "zelfde plek", new_t: "nieuw in deze periode",
      legend: "▲ gestegen · ▽ gezakt · NIEUW = nieuw · = zelfde plek",
      cmp_week: "Vergeleken met de 7 dagen ervoor.", cmp_month: "Vergeleken met de 30 dagen ervoor.",
      cmp_all: "Vergeleken met aller tijden van een week geleden.", cmp_year: "Vergeleken met de 365 dagen ervoor.", cmp_decade: "Vergeleken met het decennium ervoor.",
      note: "Geteld uit het afspeellogboek van het station. Alleen verzoekjes, nooit wie erom vroeg.", full: "Volledige lijst →",
      empty: "Nog geen verzoekjes in deze periode.", rest: "De hitlijst rust even.",
      down: "De hitlijst antwoordt niet. Probeer het over een minuut opnieuw.", loading: "Laden…",
      wav_h: "Wavlake · V4V", wav_s: "Sats rechtstreeks naar de artiest.", wav_e: "Nog geen Wavlake-verzoekjes in deze periode.",
      yours_h: "Jouw nummer hier?", yours_s: "Vraag het aan via de jukebox: de website, Telegram, Nostr of X.",
      yours_b: "▶ Vraag een nummer aan", times: "{n}×", aria_period: "Periode", aria_size: "Lengte van de lijst", aria_lane: "Route"},
    de: {p_week: "7 Tage", p_month: "30 Tage", p_all: "Alle Zeiten", p_year: "Jahr", p_decade: "Jahrzehnt", size: "Top {n}",
      lane_all: "Alle Quellen", lane_lib: "Bordbibliothek", lane_wav: "Wavlake · V4V",
      reqs_days: "{n} Wünsche in den letzten {d} Tagen · {s} Songs", reqs_all: "{n} Wünsche seit {date} · {s} Songs",
      closed: "Öffnet am {date}", soon: "Jahr öffnet am {y}. Jahrzehnt am {d}.",
      again_a: "{title} nochmal wünschen", again_t: "In der Jukebox suchen. Es gilt die übliche Wunschgebühr.",
      "new": "NEU", up_t: "{n} gestiegen", down_t: "{n} gefallen", same_t: "gleicher Platz", new_t: "neu in diesem Zeitraum",
      legend: "▲ gestiegen · ▽ gefallen · NEU = neu · = gleicher Platz",
      cmp_week: "Verglichen mit den 7 Tagen davor.", cmp_month: "Verglichen mit den 30 Tagen davor.",
      cmp_all: "Verglichen mit „Alle Zeiten“ vor einer Woche.", cmp_year: "Verglichen mit den 365 Tagen davor.", cmp_decade: "Verglichen mit dem Jahrzehnt davor.",
      note: "Gezählt aus dem Sendeprotokoll des Senders. Nur die Wünsche, nie die Namen dahinter.", full: "Ganze Liste →",
      empty: "In diesem Zeitraum noch keine Wünsche.", rest: "Die Charts ruhen gerade.",
      down: "Die Charts antworten nicht. Versuch es in einer Minute noch einmal.", loading: "Lädt…",
      wav_h: "Wavlake · V4V", wav_s: "Sats direkt an die Künstler.", wav_e: "In diesem Zeitraum noch keine Wavlake-Wünsche.",
      yours_h: "Dein Song hier?", yours_s: "Wünsch ihn dir in der Jukebox: auf der Website, in Telegram, Nostr oder X.",
      yours_b: "▶ Song wünschen", times: "{n}×", aria_period: "Zeitraum", aria_size: "Listenlänge", aria_lane: "Quelle"},
    fr: {p_week: "7 jours", p_month: "30 jours", p_all: "Depuis le début", p_year: "Année", p_decade: "Décennie", size: "Top {n}",
      lane_all: "Toutes sources", lane_lib: "Biblio du navire", lane_wav: "Wavlake · V4V",
      reqs_days: "{n} demandes ces {d} derniers jours · {s} titres", reqs_all: "{n} demandes depuis le {date} · {s} titres",
      closed: "Ouvre le {date}", soon: "L’année ouvre le {y}. La décennie le {d}.",
      again_a: "Redemander {title}", again_t: "Le retrouver dans le jukebox. Le tarif habituel d’une demande s’applique.",
      "new": "NOUVEAU", up_t: "monte de {n}", down_t: "descend de {n}", same_t: "même place", new_t: "nouveau sur cette période",
      legend: "▲ monte · ▽ descend · NOUVEAU = nouveau · = même place",
      cmp_week: "Comparé aux 7 jours d’avant.", cmp_month: "Comparé aux 30 jours d’avant.",
      cmp_all: "Comparé au classement d’il y a une semaine.", cmp_year: "Comparé aux 365 jours d’avant.", cmp_decade: "Comparé à la décennie d’avant.",
      note: "Compté à partir du journal de diffusion de la station. Seulement les demandes, jamais qui les a faites.",
      full: "Classement complet →",
      empty: "Pas encore de demandes sur cette période.", rest: "Le classement se repose pour l’instant.",
      down: "Le classement ne répond pas. Réessaie dans une minute.", loading: "Chargement…",
      wav_h: "Wavlake · V4V", wav_s: "Les sats vont directement à l’artiste.", wav_e: "Pas encore de demandes Wavlake sur cette période.",
      yours_h: "Ton titre ici ?", yours_s: "Demande-le au jukebox : sur le site, Telegram, Nostr ou X.",
      yours_b: "▶ Demander un titre", times: "{n}×", aria_period: "Période", aria_size: "Taille de la liste", aria_lane: "Source"},
    es: {p_week: "7 días", p_month: "30 días", p_all: "De siempre", p_year: "Año", p_decade: "Década", size: "Top {n}",
      lane_all: "Todo", lane_lib: "Biblioteca del barco", lane_wav: "Wavlake · V4V",
      reqs_days: "{n} peticiones en los últimos {d} días · {s} canciones", reqs_all: "{n} peticiones desde el {date} · {s} canciones",
      closed: "Se abre el {date}", soon: "El año se abre el {y}. La década, el {d}.",
      again_a: "Volver a pedir {title}", again_t: "Búscala en la jukebox. Se aplica la tarifa habitual de una petición.",
      "new": "NUEVO", up_t: "sube {n}", down_t: "baja {n}", same_t: "mismo puesto", new_t: "nuevo en este periodo",
      legend: "▲ sube · ▽ baja · NUEVO = nuevo · = mismo puesto",
      cmp_week: "Comparado con los 7 días anteriores.", cmp_month: "Comparado con los 30 días anteriores.",
      cmp_all: "Comparado con la lista de siempre de hace una semana.", cmp_year: "Comparado con los 365 días anteriores.", cmp_decade: "Comparado con la década anterior.",
      note: "Contado a partir del registro de emisión de la estación. Solo peticiones, nunca quién las hizo.", full: "Lista completa →",
      empty: "Todavía no hay peticiones en este periodo.", rest: "La lista descansa por ahora.",
      down: "La lista no responde. Inténtalo de nuevo en un minuto.", loading: "Cargando…",
      wav_h: "Wavlake · V4V", wav_s: "Los sats van directos al artista.", wav_e: "Todavía no hay peticiones de Wavlake en este periodo.",
      yours_h: "¿Tu canción aquí?", yours_s: "Pídela en la jukebox: en la web, Telegram, Nostr o X.",
      yours_b: "▶ Pide una canción", times: "{n}×", aria_period: "Periodo", aria_size: "Tamaño de la lista", aria_lane: "Fuente"},
    it: {p_week: "7 giorni", p_month: "30 giorni", p_all: "Di sempre", p_year: "Anno", p_decade: "Decennio", size: "Top {n}",
      lane_all: "Tutto", lane_lib: "Biblioteca di bordo", lane_wav: "Wavlake · V4V",
      reqs_days: "{n} richieste negli ultimi {d} giorni · {s} brani", reqs_all: "{n} richieste dal {date} · {s} brani",
      closed: "Si apre il {date}", soon: "L’anno si apre il {y}. Il decennio il {d}.",
      again_a: "Richiedere di nuovo {title}", again_t: "Cercalo nel jukebox. Si paga la solita tariffa di una richiesta.",
      "new": "NUOVO", up_t: "sale di {n}", down_t: "scende di {n}", same_t: "stessa posizione", new_t: "nuovo in questo periodo",
      legend: "▲ sale · ▽ scende · NUOVO = nuovo · = stessa posizione",
      cmp_week: "Confronto con i 7 giorni precedenti.", cmp_month: "Confronto con i 30 giorni precedenti.",
      cmp_all: "Confronto con la classifica di sempre di una settimana fa.", cmp_year: "Confronto con i 365 giorni precedenti.", cmp_decade: "Confronto con il decennio precedente.",
      note: "Contato dal registro delle trasmissioni della stazione. Solo le richieste, mai chi le ha fatte.",
      full: "Classifica completa →",
      empty: "Ancora nessuna richiesta in questo periodo.", rest: "La classifica per ora riposa.",
      down: "La classifica non risponde. Riprova tra un minuto.", loading: "Caricamento…",
      wav_h: "Wavlake · V4V", wav_s: "I sats vanno dritti all’artista.", wav_e: "Ancora nessuna richiesta Wavlake in questo periodo.",
      yours_h: "La tua canzone qui?", yours_s: "Richiedila al jukebox: sul sito, su Telegram, Nostr o X.",
      yours_b: "▶ Richiedi un brano", times: "{n}×", aria_period: "Periodo", aria_size: "Lunghezza della lista", aria_lane: "Fonte"},
    pt: {p_week: "7 dias", p_month: "30 dias", p_all: "De sempre", p_year: "Ano", p_decade: "Década", size: "Top {n}",
      lane_all: "Todas as fontes", lane_lib: "Biblioteca do navio", lane_wav: "Wavlake · V4V",
      reqs_days: "{n} pedidos nos últimos {d} dias · {s} músicas", reqs_all: "{n} pedidos desde {date} · {s} músicas",
      closed: "Abre a {date}", soon: "O ano abre a {y}. A década a {d}.",
      again_a: "Pedir {title} outra vez", again_t: "Procura-a na jukebox. Aplica-se a taxa habitual de um pedido.",
      "new": "NOVO", up_t: "sobe {n}", down_t: "desce {n}", same_t: "mesmo lugar", new_t: "novo neste período",
      legend: "▲ sobe · ▽ desce · NOVO = novo · = mesmo lugar",
      cmp_week: "Comparado com os 7 dias anteriores.", cmp_month: "Comparado com os 30 dias anteriores.",
      cmp_all: "Comparado com a tabela de sempre de há uma semana.", cmp_year: "Comparado com os 365 dias anteriores.", cmp_decade: "Comparado com a década anterior.",
      note: "Contado a partir do registo de emissão da rádio. Só os pedidos, nunca quem os fez.", full: "Tabela completa →",
      empty: "Ainda não há pedidos neste período.", rest: "A tabela está a descansar por agora.",
      down: "A tabela não responde. Tenta outra vez daqui a um minuto.", loading: "A carregar…",
      wav_h: "Wavlake · V4V", wav_s: "Os sats vão diretos para o artista.", wav_e: "Ainda não há pedidos Wavlake neste período.",
      yours_h: "A tua música aqui?", yours_s: "Pede-a na jukebox: no site, no Telegram, no Nostr ou no X.",
      yours_b: "▶ Pede uma música", times: "{n}×", aria_period: "Período", aria_size: "Tamanho da lista", aria_lane: "Fonte"}
  };
  var PERIODS = ["week", "month", "all", "year", "decade"], SIZES = [10, 21, 42, 100, 210, 420], LANES = ["", "library", "wavlake"];
  var TAB_MAX = 100;      // the narrow side panel stops at 100; the page adds 210 and 420 once a window holds that many songs
  var DAYS = {week: 7, month: 30, year: 365, decade: 3653};

  function lang() { try { var l = window.nrLangNow ? window.nrLangNow() : "en"; return S[l] ? l : "en"; } catch (e) { return "en"; } }
  function t(k, map) {
    var d = S[lang()], s = Object.prototype.hasOwnProperty.call(d, k) ? d[k] : (S.en[k] || k);
    return map ? String(s).replace(/\{([a-z]+)\}/g, function (m, x) { return Object.prototype.hasOwnProperty.call(map, x) ? String(map[x]) : m; }) : s;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; });
  }
  function loc() { try { return window.nrLocale ? window.nrLocale() : "en-US"; } catch (e) { return "en-US"; } }
  function num(n) { try { return Number(n).toLocaleString(loc()); } catch (e) { return String(n); } }
  function day(iso) {
    try { return new Date(iso + "T12:00:00Z").toLocaleDateString(loc(), {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"}); }
    catch (e) { return iso; }
  }
  function load(k, dflt, ok) { try { var v = JSON.parse(localStorage.getItem("nrCharts") || "{}")[k]; return ok.indexOf(v) >= 0 ? v : dflt; } catch (e) { return dflt; } }
  function save(k, v) { try { var o = JSON.parse(localStorage.getItem("nrCharts") || "{}"); o[k] = v; localStorage.setItem("nrCharts", JSON.stringify(o)); } catch (e) {} }

  var CSS = ".nrCh{font-size:0.8rem;line-height:1.35}" +
    ".nrChChips{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 6px}" +
    ".nrChChip{font-family:inherit;font-size:0.58rem;letter-spacing:0.1em;text-transform:uppercase;padding:3px 10px;border-radius:999px;cursor:pointer;border:1px solid #666;background:none;color:#9a9a9a;line-height:1.5}" +
    ".nrChChip[aria-pressed=true]{background:#e5e5e5;color:#111;font-weight:bold;border-color:#e5e5e5}" +
    ".nrChChip[aria-pressed=true]::before{content:'\\25CF\\00a0'}" +
    ".nrChChip:disabled{border-style:dashed;border-color:#444;color:#5f6b70;cursor:not-allowed}" +
    ".nrJukeHead .nrChChips{gap:4px}.nrJukeHead .nrChChip{padding:3px 7px;letter-spacing:0.05em}" +   /* the narrow side panel */
    ".nrChChip:focus-visible,.nrChAgain:focus-visible{outline:2px solid var(--signal,#f7931a);outline-offset:1px}" +
    ".nrChMeta{font-size:0.6rem;letter-spacing:0.08em;text-transform:uppercase;color:#8fa3b8;margin:2px 0 0}" +
    ".nrChSoon{font-size:0.62rem;color:#8fa3b8;margin:0 0 4px}" +
    ".nrChList{list-style:none;margin:6px 0 0;padding:0}" +
    ".nrChRow{display:grid;grid-template-columns:2.1em minmax(0,1fr) auto;grid-template-areas:'rank body mark' 'rank body again';column-gap:9px;align-items:start;padding:7px 0;border-bottom:1px solid var(--line,#1d3a42)}" +
    ".nrChRank{grid-area:rank;font-weight:bold;font-size:0.95rem;color:var(--foam,#e6eff0);text-align:right;font-variant-numeric:tabular-nums;line-height:1.25}" +
    ".nrChRow.top3 .nrChRank{font-size:1.35rem;line-height:1.05}" +
    ".nrChBody{grid-area:body;min-width:0}" +
    ".nrChTitle{display:block;font-weight:bold;color:var(--foam,#e6eff0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".nrChArtist{display:block;color:var(--foam-dim,#8aa4aa);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:0.92em}" +
    ".nrChBarLine{display:flex;align-items:center;gap:6px;margin-top:4px}" +
    ".nrChBar{display:block;height:5px;background:var(--foam,#e6eff0);border-radius:1px;min-width:3px}" +
    ".nrChN{font-size:0.68rem;font-weight:bold;color:var(--foam,#e6eff0);font-variant-numeric:tabular-nums}" +
    ".nrChMark{grid-area:mark;justify-self:end;font-size:0.66rem;font-weight:bold;white-space:nowrap;color:var(--foam,#e6eff0);line-height:1.5}" +
    ".nrChMark.dn,.nrChMark.eq{color:var(--foam-dim,#8aa4aa);font-weight:normal}" +
    ".nrChMark.nw{border:1.5px solid currentColor;border-radius:3px;padding:0 4px;letter-spacing:0.06em;font-size:0.56rem}" +
    ".nrChAgain{grid-area:again;justify-self:end;margin-top:4px;font-family:inherit;font-size:0.72rem;padding:1px 11px;border-radius:4px;border:1px solid var(--signal,#f7931a);background:none;color:var(--signal,#f7931a);font-weight:bold;cursor:pointer;white-space:nowrap;text-decoration:none;line-height:1.5}" +
    ".nrChAgain:hover{background:rgba(247,147,26,0.1)}" +
    ".nrChV4V{display:inline-block;margin-left:6px;font-size:0.54rem;font-weight:bold;letter-spacing:0.08em;border:1px solid currentColor;border-radius:3px;padding:0 3px;vertical-align:1px}" +
    ".nrChFoot{margin-top:10px;font-size:0.62rem;color:var(--foam-dim,#8aa4aa);line-height:1.5}" +
    ".nrChFull{display:inline-block;margin-top:6px;font-weight:bold;color:var(--signal,#f7931a);text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;font-size:0.66rem}" +
    ".nrChMsg{color:var(--foam-dim,#8aa4aa);font-size:0.8rem;margin:10px 0}" +
    ".nrChSide{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:18px}" +
    ".nrChBox{border:1px solid var(--line,#1d3a42);border-radius:8px;padding:14px 16px;background:rgba(15,38,45,0.82)}" +
    ".nrChBox.wav{border-left:5px solid var(--foam,#e6eff0)}" +
    ".nrChBox h3{margin:0 0 2px;font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--foam,#e6eff0)}" +
    ".nrChBox p{margin:0 0 8px;color:var(--foam-dim,#8aa4aa);font-size:0.78rem}" +
    ".nrChBox.yours{border-style:dashed}" +
    ".nrChPlay{display:inline-block;margin-top:4px;padding:7px 14px;border-radius:4px;background:var(--signal,#f7931a);color:#111;font-weight:bold;text-decoration:none;font-size:0.78rem}";
  function css() {
    if (document.getElementById("nrChCss")) return;
    var st = document.createElement("style"); st.id = "nrChCss"; st.textContent = CSS; document.head.appendChild(st);
  }

  function mark(it, moves) {
    if (!moves) return "";
    if (it["new"]) return '<span class="nrChMark nw" title="' + esc(t("new_t")) + '">' + esc(t("new")) + "</span>";
    var d = (it.prev || 0) - it.rank;
    if (d > 0) return '<span class="nrChMark up" title="' + esc(t("up_t", {n: d})) + '" aria-label="' + esc(t("up_t", {n: d})) + '">▲ ' + d + "</span>";
    if (d < 0) return '<span class="nrChMark dn" title="' + esc(t("down_t", {n: -d})) + '" aria-label="' + esc(t("down_t", {n: -d})) + '">▽ ' + (-d) + "</span>";
    return '<span class="nrChMark eq" title="' + esc(t("same_t")) + '" aria-label="' + esc(t("same_t")) + '">=</span>';
  }
  function againBtn(it, opts, on) {
    if (!on || !it.q) return "";
    // SF: "again is redundant, no? I think the icon will speak for itself" -- the word lives on in the label and the tip
    var al = esc(t("again_a", {title: it.title || it.q})) + '" title="' + esc(t("again_t"));
    if (opts.again) return '<button type="button" class="nrChAgain" data-q="' + esc(it.q) + '" aria-label="' + al + '">▶</button>';
    return '<a class="nrChAgain" href="/#again=' + esc(encodeURIComponent(it.q)) + '" aria-label="' + al + '">▶</a>';
  }
  function rows(list, d, opts, withMarks) {
    var max = list.length ? list[0].n : 1, h = '<ol class="nrChList">';
    for (var i = 0; i < list.length; i++) {
      var it = list[i], w = Math.max(3, Math.round(70 * it.n / max));
      h += '<li class="nrChRow' + (it.rank <= 3 ? " top3" : "") + '"><span class="nrChRank">' + it.rank + "</span>" +
        '<span class="nrChBody"><span class="nrChTitle" title="' + esc(it.title) + '">' + esc(it.title || "—") + "</span>" +
        '<span class="nrChArtist" title="' + esc(it.artist) + '">' + esc(it.artist || "—") +
        (it.lane === "wavlake" && d.lane === "all" ? '<span class="nrChV4V">V4V</span>' : "") + "</span>" +
        '<span class="nrChBarLine"><span class="nrChBar" style="width:' + w + '%"></span><span class="nrChN">' + esc(t("times", {n: num(it.n)})) + "</span></span></span>" +
        (withMarks ? mark(it, d.moves) : "") + againBtn(it, opts, d.again) + "</li>";
    }
    return h + "</ol>";
  }
  function chip(group, val, label, on, closedTitle) {
    return '<button type="button" class="nrChChip" data-g="' + group + '" data-v="' + esc(val) + '" aria-pressed="' + (on ? "true" : "false") + '"' +
      (closedTitle ? ' disabled title="' + esc(closedTitle) + '"' : "") + ">" + esc(label) + "</button>";
  }

  function mount(box, opts) {
    opts = opts || {};
    css();
    var st = {period: load("period", "month", PERIODS), n: load("n", 10, SIZES), lane: opts.page ? load("lane", "", LANES) : ""};
    var last = null, seq = 0, known = null;      // known = the periods from the last good answer
    function size() { return (!opts.page && st.n > TAB_MAX) ? TAB_MAX : st.n; }   // a 210 chosen on /top shows 100 in the tab
    function head(d) {
      if (d && d.periods) known = d.periods;
      var P = known || {year: {open: false}, decade: {open: false}};   // before any answer: year and decade stay closed
      var h = '<div class="nrChChips" role="group" aria-label="' + esc(t("aria_period")) + '">';
      for (var i = 0; i < PERIODS.length; i++) {
        var p = PERIODS[i], closed = P[p] && P[p].open === false;
        h += chip("period", p, t("p_" + p), st.period === p && !closed, closed ? (P[p].opens ? t("closed", {date: day(P[p].opens)}) : " ") : "");
      }
      h += "</div>";
      if (P.year && P.year.open === false && P.year.opens && P.decade && P.decade.opens)
        h += '<div class="nrChSoon">' + esc(t("soon", {y: day(P.year.opens), d: day(P.decade.opens)})) + "</div>";
      h += '<div class="nrChChips" role="group" aria-label="' + esc(t("aria_size")) + '">';
      var songs = d && d.songs ? d.songs : (last && last.songs ? last.songs : 0);
      for (var j = 0; j < SIZES.length; j++) {
        var S = SIZES[j];
        // SF: "add 210 and 420, but only if there is space and if when it becomes relevant": the page only, and only
        // once the window holds more songs than the size before it (a chosen size always stays in view)
        if (S > TAB_MAX && (!opts.page || (songs <= SIZES[j - 1] && st.n !== S))) continue;
        h += chip("n", S, t("size", {n: S}), size() === S);
      }
      h += "</div>";
      if (opts.page) {
        var LL = {"": "lane_all", library: "lane_lib", wavlake: "lane_wav"};
        h += '<div class="nrChChips" role="group" aria-label="' + esc(t("aria_lane")) + '">';
        for (var k = 0; k < LANES.length; k++) h += chip("lane", LANES[k], t(LL[LANES[k]]), st.lane === LANES[k]);
        h += "</div>";
      }
      if (d && d.open && !d.off) h += '<div class="nrChMeta">' + esc(d.period === "all"
        ? t("reqs_all", {n: num(d.requests), date: day(d.since), s: num(d.songs)})
        : t("reqs_days", {n: num(d.requests), d: DAYS[d.period], s: num(d.songs)})) + "</div>";
      return '<div class="' + (opts.head || "nrChHead") + '">' + h + "</div>";
    }
    function draw(d, msg) {
      if (d && d.off) { box.innerHTML = '<div class="nrCh"><p class="nrChMsg">' + esc(t("rest")) + "</p></div>"; return; }
      var h = head(d);
      if (msg) h += '<p class="nrChMsg">' + esc(msg) + "</p>";
      else if (d.off) h += '<p class="nrChMsg">' + esc(t("rest")) + "</p>";
      else if (!d.top || !d.top.length) h += '<p class="nrChMsg">' + esc(t("empty")) + "</p>";
      else h += rows(d.top, d, opts, true);
      if (d && !d.off && !msg) {
        h += '<div class="nrChFoot">';
        if (d.moves && d.top && d.top.length) h += esc(t("legend")) + "<br>" + esc(t("cmp_" + d.period) || "") + "<br>";
        if (!opts.page) h += esc(t("note"));
        if (opts.full) h += '<br><a class="nrChFull" href="' + esc(opts.full) + '">' + esc(t("full")) + "</a>";
        h += "</div>";
        if (opts.page) {
          h += '<div class="nrChSide">';
          if (d.lane === "all") {
            h += '<div class="nrChBox wav"><h3>' + esc(t("wav_h")) + "</h3><p>" + esc(t("wav_s")) + "</p>";
            var wl = d.wavlake_top || [];
            if (wl.length) { for (var i = 0; i < wl.length; i++) wl[i].lane = "wavlake"; h += rows(wl, {lane: "wavlake", again: d.again, moves: false}, opts, false); }
            else h += "<p>" + esc(t("wav_e")) + "</p>";
            h += "</div>";
          }
          h += '<div class="nrChBox yours"><h3>' + esc(t("yours_h")) + "</h3><p>" + esc(t("yours_s")) + '</p><a class="nrChPlay" href="/">' + esc(t("yours_b")) + "</a></div>";
          h += "</div>";
        }
      }
      box.innerHTML = '<div class="nrCh">' + h + "</div>";
    }
    function get() {
      var my = ++seq;
      if (last) draw(last, t("loading")); else draw(null, t("loading"));
      fetch("/api/charts?period=" + st.period + "&n=" + size() + "&lane=" + st.lane, {cache: "no-store"})
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          if (my !== seq) return;
          if (!d.off && d.open === false) {               // a closed period remembered from an older visit: back to 30 days
            st.period = "month"; save("period", "month"); return get();
          }
          last = d; draw(d);
        })
        .catch(function () { if (my === seq) draw(last, t("down")); });
    }
    box.addEventListener("click", function (e) {
      var el = e.target && e.target.closest ? e.target.closest(".nrChChip,button.nrChAgain") : null;
      if (!el || el.disabled || !box.contains(el)) return;
      if (el.classList.contains("nrChAgain")) { if (opts.again) opts.again(el.getAttribute("data-q") || ""); return; }
      var g = el.getAttribute("data-g"), v = el.getAttribute("data-v");
      if (g === "n") v = parseInt(v, 10);
      if (st[g] === v) return;
      st[g] = v; save(g, v); get();
    });
    if (window.nrI18nOnSwitch) window.nrI18nOnSwitch(function () { if (last) draw(last); });
    get();
    return {refresh: get};
  }
  window.nrCharts = {mount: mount};
})();
