/* Numogramme interactif. Le schéma SVG est déjà dans la page ; ce script ajoute la sélection, les calques et le calculateur de portes. */
(function () {
  "use strict";
  var svg = document.querySelector("[data-numo]");
  if (!svg) return;
  var panel = document.querySelector("[data-numo-panel]");

  var REGION = { 0: "Plex", 9: "Plex", 3: "Warp", 6: "Warp", 1: "Circuit du temps", 2: "Circuit du temps", 4: "Circuit du temps", 5: "Circuit du temps", 7: "Circuit du temps", 8: "Circuit du temps" };
  var DEMON = { "9-0": "Uttunul", "8-1": "Murrumur", "7-2": "Oddubb", "6-3": "Djynxx", "5-4": "Katak" };
  var CURNAME = { "5-4": "Sink", "7-2": "Hold", "8-1": "Surge", "6-3": "Warp", "9-0": "Plex" };

  function twin(n) { return 9 - n; }
  function key(n) { var a = Math.max(n, twin(n)), b = Math.min(n, twin(n)); return a + "-" + b; }
  function tri(n) { return n * (n + 1) / 2; }
  function reduce(n) { var s = n, steps = [n]; while (s > 9) { s = String(s).split("").reduce(function (a, c) { return a + Number(c); }, 0); steps.push(s); } return { value: s, steps: steps }; }
  function currentOf(n) { var a = Math.max(n, twin(n)), b = Math.min(n, twin(n)); return a - b; }
  function receives(n) {
    var out = [];
    for (var z = 0; z < 10; z++) { if (z <= twin(z) && currentOf(z) === n) out.push(key(z)); }
    return out;
  }

  function describe(n) {
    var k = key(n), c = currentOf(n), g = tri(n), r = reduce(g), rec = receives(n);
    var html = "<h3>Zone " + n + "</h3>";
    html += '<dl class="pairs">';
    html += "<dt>Région</dt><dd>" + REGION[n] + "</dd>";
    html += "<dt>Syzygie</dt><dd>" + n + " + " + twin(n) + " = 9 · démon porteur : <strong>" + DEMON[k] + "</strong></dd>";
    html += "<dt>Courant émis</dt><dd>" + k.replace("-", " − ") + " = " + c + " → zone " + c + " <span class=\"muted\">(« " + CURNAME[k] + " »)</span></dd>";
    html += "<dt>Courant reçu</dt><dd>" + (rec.length ? rec.map(function (x) { return "de la syzygie " + x.replace("-", "::") + " (« " + CURNAME[x] + " »)"; }).join(", ") : "aucun") + "</dd>";
    html += "<dt>Porte</dt><dd>Gt-" + g + " : 0 + 1 + … + " + n + " = " + g + (r.steps.length > 1 ? " → " + r.steps.slice(1).join(" → ") : "") + " ⇒ zone " + r.value + (r.value === n ? " (boucle sur elle-même)" : "") + "</dd>";
    html += "</dl>";
    var notes = {
      0: "Zone du zéro, jumelle du 9 : la syzygie extérieure, que le Ccru associe au Plex, une boucle hors du temps ordinaire.",
      3: "Le Warp est une boucle autonome : le courant 6 − 3 = 3 retombe dans sa propre syzygie.",
      6: "Le Warp est une boucle autonome : le courant 6 − 3 = 3 retombe dans sa propre syzygie.",
      9: "Le courant 9 − 0 = 9 revient sur la zone 9 : le Plex tourne sur lui-même, comme le Warp à l’autre extrémité.",
      1: "La zone 1 reçoit le courant de la syzygie 5::4 (5 − 4 = 1) et appartient à la syzygie 8::1 : c’est ce passage qui ferme le circuit du temps."
    };
    if (notes[n]) html += '<p class="small muted">' + notes[n] + "</p>";
    return html;
  }

  var zones = svg.querySelectorAll(".zone");
  function select(n) {
    zones.forEach(function (z) {
      var zn = Number(z.getAttribute("data-zone"));
      z.classList.toggle("is-active", zn === n);
      z.classList.toggle("is-related", zn === twin(n) && zn !== n);
      z.setAttribute("aria-pressed", zn === n ? "true" : "false");
    });
    if (panel) panel.innerHTML = describe(n);
  }
  zones.forEach(function (z) {
    z.setAttribute("tabindex", "0");
    z.setAttribute("role", "button");
    z.setAttribute("aria-pressed", "false");
    var n = Number(z.getAttribute("data-zone"));
    z.addEventListener("click", function () { select(n); });
    z.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n); }
    });
  });

  document.querySelectorAll("[data-numo-layer]").forEach(function (cb) {
    cb.addEventListener("change", function () {
      svg.classList.toggle("hide-" + cb.getAttribute("data-numo-layer"), !cb.checked);
    });
  });

  /* Calculateur de portes : cumul numérique puis réduction */
  var form = document.querySelector("[data-gate-calc]");
  if (form) {
    var inp = form.querySelector("input");
    var out = form.querySelector("[data-gate-out]");
    function calc() {
      var n = parseInt(inp.value, 10);
      if (isNaN(n) || n < 0) { out.textContent = "Entrez un entier positif."; return; }
      if (n > 99999) { out.textContent = "Restons sous 100 000."; return; }
      var t = tri(n), r = reduce(t);
      out.textContent = "0 + 1 + … + " + n + " = " + t + (r.steps.length > 1 ? " → " + r.steps.slice(1).join(" → ") : "") + " ⇒ zone " + r.value + ".";
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); calc(); });
    inp.addEventListener("input", calc);
    calc();
  }

  select(5);
})();
