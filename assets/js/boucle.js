/* Simulateur de boucle hyperstitionnelle : modèle jouet, à visée pédagogique (pas une mesure du réel). */
(function () {
  "use strict";
  var root = document.querySelector("[data-boucle]");
  if (!root) return;
  var svg = root.querySelector("svg");
  var status = root.querySelector("[data-boucle-status]");
  var inputs = {};
  root.querySelectorAll("input[type=range]").forEach(function (el) {
    inputs[el.name] = el;
    var o = root.querySelector("output[for='" + el.id + "']");
    el.addEventListener("input", function () { if (o) o.textContent = Number(el.value).toFixed(2); draw(); });
    if (o) o.textContent = Number(el.value).toFixed(2);
  });
  var shockAt = null;
  var STEPS = 90, W = 640, H = 300, PL = 38, PR = 12, PT = 14, PB = 30;
  var NS = "http://www.w3.org/2000/svg";

  function sig(x) { return 1 / (1 + Math.exp(-x)); }
  function simulate(p) {
    var B = p.recit, R = 0.02, out = [];
    for (var t = 0; t <= STEPS; t++) {
      if (shockAt !== null && t === shockAt) B = Math.max(0, B - 0.35);
      var I = sig((B - p.seuil) * 12) * B;
      out.push({ B: B, R: R, I: I });
      var nR = R + 0.22 * p.gain * I * (1 - R) - 0.12 * p.friction * R;
      var nB = B + 0.18 * p.gain * (0.6 * R + 0.4 * I) * (1 - B) - 0.16 * p.friction * B * (1 - R);
      R = Math.min(1, Math.max(0, nR));
      B = Math.min(1, Math.max(0, nB));
    }
    return out;
  }
  function x(t) { return PL + (W - PL - PR) * t / STEPS; }
  function y(v) { return PT + (H - PT - PB) * (1 - v); }
  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }
  function path(data, keyName) {
    return data.map(function (d, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(d[keyName]).toFixed(1); }).join(" ");
  }
  function draw() {
    var p = {};
    for (var k in inputs) p[k] = Number(inputs[k].value);
    var data = simulate(p);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      svg.appendChild(el("line", { x1: PL, x2: W - PR, y1: y(v), y2: y(v), "class": v === 0 ? "axis" : "grid-l" }));
      svg.appendChild(el("text", { x: PL - 6, y: y(v) + 4, "text-anchor": "end" }, Math.round(v * 100) + "%"));
    });
    [0, 30, 60, 90].forEach(function (t) {
      svg.appendChild(el("text", { x: x(t), y: H - 10, "text-anchor": "middle" }, "t" + t));
    });
    svg.appendChild(el("line", { x1: PL, x2: W - PR, y1: y(p.seuil), y2: y(p.seuil), "class": "thresh" }));
    svg.appendChild(el("text", { x: W - PR - 4, y: y(p.seuil) - 5, "text-anchor": "end" }, "seuil"));
    svg.appendChild(el("path", { d: path(data, "I"), "class": "l-inv" }));
    svg.appendChild(el("path", { d: path(data, "R"), "class": "l-real" }));
    svg.appendChild(el("path", { d: path(data, "B"), "class": "l-belief" }));
    if (shockAt !== null) {
      svg.appendChild(el("line", { x1: x(shockAt), x2: x(shockAt), y1: PT, y2: H - PB, "class": "thresh" }));
      svg.appendChild(el("text", { x: x(shockAt) + 4, y: PT + 10 }, "choc"));
    }
    var end = data[data.length - 1];
    var msg;
    if (end.R > 0.6) msg = "Emballement : la fiction a recruté assez d’adhésion et d’investissement pour s’actualiser. C’est le régime hyperstitionnel.";
    else if (end.R < 0.08 && end.B < 0.08) msg = "Extinction : sous le seuil, la friction du réel l’emporte. La fiction reste une superstition sans prise.";
    else msg = "Entre-deux : la fiction survit sans basculer, comme un mythe latent qui attend son occasion.";
    status.textContent = msg + " (adhésion finale " + Math.round(end.B * 100) + " %, actualisation " + Math.round(end.R * 100) + " %)";
    svg.setAttribute("aria-label", "Courbes simulées sur 90 pas : adhésion " + Math.round(end.B * 100) + " %, actualisation " + Math.round(end.R * 100) + " % à la fin.");
  }
  var shockBtn = root.querySelector("[data-boucle-shock]");
  if (shockBtn) shockBtn.addEventListener("click", function () { shockAt = shockAt === null ? 18 : null; shockBtn.setAttribute("aria-pressed", shockAt !== null ? "true" : "false"); draw(); });
  var presets = { hyper: { recit: 0.3, gain: 1.4, friction: 0.3, seuil: 0.2 }, fragile: { recit: 0.3, gain: 0.8, friction: 0.5, seuil: 0.25 }, latent: { recit: 0.22, gain: 0.3, friction: 0.2, seuil: 0.2 }, flop: { recit: 0.12, gain: 0.8, friction: 0.7, seuil: 0.3 } };
  root.querySelectorAll("[data-preset]").forEach(function (b) {
    b.addEventListener("click", function () {
      var pr = presets[b.getAttribute("data-preset")];
      for (var k in pr) { inputs[k].value = pr[k]; var o = root.querySelector("output[for='" + inputs[k].id + "']"); if (o) o.textContent = pr[k].toFixed(2); }
      draw();
    });
  });
  draw();
})();
