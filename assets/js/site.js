/* Hyperstition — script commun. Amélioration progressive : tout le contenu reste lisible sans JavaScript. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (e) { return null; }
    return null;
  }

  /* ---- Thème : auto → clair → sombre ---- */
  var btn = document.querySelector("[data-theme-toggle]");
  var labels = { auto: "Thème : automatique", light: "Thème : clair", dark: "Thème : sombre" };
  function applyTheme(mode) {
    if (mode === "light" || mode === "dark") doc.setAttribute("data-theme", mode);
    else doc.removeAttribute("data-theme");
    if (btn) {
      btn.setAttribute("aria-label", labels[mode] + " (changer)");
      btn.setAttribute("title", labels[mode]);
      btn.setAttribute("data-mode", mode);
    }
  }
  var current = store("hyp-theme") || "auto";
  applyTheme(current);
  if (btn) {
    btn.addEventListener("click", function () {
      current = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
      store("hyp-theme", current === "auto" ? null : current);
      applyTheme(current);
    });
  }

  /* ---- Navigation locale (file://) : ajoute index.html aux liens de dossier ---- */
  if (location.protocol === "file:") {
    var links = document.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute("href");
      if (!h || /^[a-z]+:/i.test(h) || h.charAt(0) === "#") continue;
      var parts = h.split("#");
      if (parts[0] === "" || /\/$/.test(parts[0])) {
        parts[0] = (parts[0] || "./") + "index.html";
        links[i].setAttribute("href", parts.join("#"));
      }
    }
  }

  /* ---- Sommaire : section active ---- */
  var toc = document.querySelector(".toc");
  if (toc && "IntersectionObserver" in window) {
    var map = {};
    toc.querySelectorAll("a[href^='#']").forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var heads = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var active = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (active) active.classList.remove("is-active");
          active = map[en.target.id];
          if (active) active.classList.add("is-active");
        }
      });
    }, { rootMargin: "-15% 0px -70% 0px" });
    heads.forEach(function (h) { io.observe(h); });
  }

  /* ---- Filtre de la chronologie ---- */
  var filter = document.querySelector("[data-timeline-filter]");
  if (filter) {
    filter.hidden = false;
    var items = document.querySelectorAll(".timeline li[data-cat]");
    var decades = document.querySelectorAll(".decade");
    filter.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      filter.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var cat = b.getAttribute("data-cat");
      items.forEach(function (li) { li.hidden = !(cat === "all" || li.getAttribute("data-cat") === cat); });
      decades.forEach(function (d) {
        var list = d.nextElementSibling;
        var visible = list && list.querySelector("li:not([hidden])");
        d.hidden = !visible;
      });
    });
  }

  /* ---- Recherche plein texte (page /recherche/) ---- */
  var form = document.querySelector("[data-search]");
  if (form) {
    var input = form.querySelector("input[type=search]");
    var out = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var base = form.getAttribute("data-base") || "";
    var index = null;
    function norm(s) {
      return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " ").replace(/œ/g, "oe");
    }
    function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function highlight(text, terms) {
      var t = esc(text);
      terms.forEach(function (term) {
        if (term.length < 3) return;
        var re = new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
        t = t.replace(re, "<mark>$1</mark>");
      });
      return t;
    }
    function run(q) {
      if (!index) return;
      var terms = norm(q).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 1; });
      out.innerHTML = "";
      if (!terms.length) { status.textContent = index.length + " pages indexées. Tapez un mot : numogramme, Fisher, cyberespace…"; return; }
      var res = [];
      index.forEach(function (p) {
        var title = norm(p.t), desc = norm(p.d), body = norm(p.x), keys = norm(p.k);
        var score = 0, all = true;
        terms.forEach(function (w) {
          var s = 0;
          if (title.indexOf(w) > -1) s += 12;
          if (keys.indexOf(w) > -1) s += 6;
          if (desc.indexOf(w) > -1) s += 4;
          var c = body.split(w).length - 1;
          s += Math.min(c, 8);
          if (!s) all = false;
          score += s;
        });
        if (all && score) res.push({ p: p, s: score });
      });
      res.sort(function (a, b) { return b.s - a.s; });
      status.textContent = res.length ? res.length + " résultat" + (res.length > 1 ? "s" : "") + " pour « " + q + " »" : "Aucun résultat pour « " + q + " ». Essayez un terme plus court ou consultez le plan du site.";
      var rawTerms = q.split(/\s+/).filter(Boolean);
      res.slice(0, 40).forEach(function (r) {
        var li = document.createElement("li");
        li.innerHTML = '<a href="' + base + r.p.u + '">' + esc(r.p.t) + '</a><span class="sr-url">' + esc(r.p.s) + "</span><p>" + highlight(r.p.d, rawTerms) + "</p>";
        out.appendChild(li);
      });
    }
    var params = new URLSearchParams(location.search);
    var q0 = params.get("q") || "";
    input.value = q0;
    status.textContent = "Chargement de l’index…";
    fetch(base + "data/search-index.json").then(function (r) { return r.json(); }).then(function (data) {
      index = data;
      run(input.value);
    }).catch(function () {
      status.textContent = "L’index n’a pas pu être chargé (navigation hors ligne ?). Utilisez le plan du site.";
    });
    var timer;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        run(input.value);
        var u = new URL(location.href);
        if (input.value) u.searchParams.set("q", input.value); else u.searchParams.delete("q");
        history.replaceState(null, "", u);
      }, 120);
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); run(input.value); });
  }
})();
