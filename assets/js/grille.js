/* Grille d'analyse : calcule l'indice H (0-15) et garde la saisie dans l'adresse (#A2B3C1D0E2) pour la partager. */
(function () {
  "use strict";
  var form = document.querySelector("[data-grille]");
  if (!form) return;
  var out = document.querySelector("[data-grille-out]");
  var crit = ["A", "B", "C", "D", "E"];
  var profiles = [
    { max: 4, name: "Fiction inerte", text: "Le récit circule peu ou ne mobilise rien : il reste une histoire, une croyance privée ou une superstition." },
    { max: 8, name: "Mythe latent", text: "Le récit se propage, mais il ne capte pas encore assez de ressources pour se réaliser. Il peut dormir longtemps, puis basculer." },
    { max: 11, name: "Hyperstition en amorçage", text: "La boucle est enclenchée : adhésion, investissements et premiers effets matériels se renforcent. Le résultat reste réversible." },
    { max: 15, name: "Hyperstition installée", text: "La fiction est devenue infrastructure. On ne la perçoit plus comme un récit : elle fait partie du décor." }
  ];
  function read() {
    var total = 0, filled = 0, code = "";
    crit.forEach(function (c) {
      var v = form.querySelector("input[name='" + c + "']:checked");
      if (v) { total += Number(v.value); filled++; code += c + v.value; }
    });
    return { total: total, filled: filled, code: code };
  }
  function render() {
    var r = read();
    if (!r.filled) { out.innerHTML = "<p>Cochez les cinq critères pour obtenir l’indice H.</p>"; return; }
    var p = profiles.filter(function (x) { return r.total <= x.max; })[0];
    var bar = "";
    for (var i = 1; i <= 15; i++) bar += i <= r.total ? "■" : "□";
    out.innerHTML = "<p class=\"mono\" aria-hidden=\"true\">" + bar + "</p><p>Indice H : <strong>" + r.total + " / 15</strong>" + (r.filled < 5 ? " (" + r.filled + " critère" + (r.filled > 1 ? "s" : "") + " sur 5)" : "") + " · <strong>" + p.name + "</strong></p><p>" + p.text + "</p>";
    if (history.replaceState) history.replaceState(null, "", "#" + r.code);
  }
  function restore() {
    var h = location.hash.replace("#", "");
    var m = h.match(/[A-E][0-3]/g);
    if (!m) return;
    m.forEach(function (pair) {
      var input = form.querySelector("input[name='" + pair[0] + "'][value='" + pair[1] + "']");
      if (input) input.checked = true;
    });
  }
  form.addEventListener("change", render);
  form.addEventListener("submit", function (e) { e.preventDefault(); render(); });
  form.addEventListener("reset", function () { setTimeout(function () { if (history.replaceState) history.replaceState(null, "", location.pathname); render(); }, 0); });
  restore();
  render();
})();
