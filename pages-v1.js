/* GitHub Pages tracking for the hub. Reads pages-v1.json (written every three hours by the pages-scan workflow).
   Adds a GitHub Pages section to the app lists, a Pages button on matching app rows, and a GitHub Pages tab. */
(function () {
  var BLUE = "#2447f5";
  var ICON = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style="vertical-align:middle"><path d="M3.5 1.5h6l3 3v10h-9z" fill="none" stroke="#7aa2ff" stroke-width="1.5" stroke-linejoin="round"/><path d="M9.5 1.5v3h3" fill="none" stroke="#7aa2ff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="8" cy="10" r="2.6" fill="none" stroke="#7aa2ff" stroke-width="1.2"/><path d="M5.4 10h5.2M8 7.4c1.2 1.4 1.2 3.8 0 5.2M8 7.4c-1.2 1.4-1.2 3.8 0 5.2" fill="none" stroke="#7aa2ff" stroke-width="0.9"/></svg>';
  var sites = [];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function key(s) { return String(s || "").toLowerCase().split("/").pop().replace(/[^a-z0-9]/g, ""); }
  function href(u) { return "https://" + String(u).replace(/^https?:\/\//, ""); }
  function when(s) { return s.built || s.pushed || ""; }
  function ageColor(d) {
    if (!d) return "#888888";
    var days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days < 7) return "#00ff00";
    if (days < 30) return "#ffff00";
    if (days < 60) return "#ffa500";
    if (days < 90) return "#ff4444";
    return "#888888";
  }

  function addLists() {
    ["category-view", "alpha-view"].forEach(function (id) {
      var box = document.getElementById(id);
      if (!box || box.querySelector(".gp-head")) return;
      var h = document.createElement("h2");
      h.className = "gp-head";
      h.textContent = "GitHub Pages";
      box.appendChild(h);
      sites.forEach(function (s) {
        var p = document.createElement("p");
        p.className = "gp-row";
        p.setAttribute("data-gp", "1");
        p.innerHTML = '<a href="' + esc(href(s.url)) + '" style="color:' + ageColor(when(s)) + '">' + esc(s.name) + '</a><span class="tag" style="color:' + BLUE + '">-pages</span>';
        box.appendChild(p);
      });
    });
  }

  function addButtons() {
    if (!sites.length) return;
    var map = {};
    sites.forEach(function (s) { map[key(s.name)] = s; });
    var links = document.querySelectorAll("#category-view a, #alpha-view a");
    Array.prototype.forEach.call(links, function (a) {
      var p = a.parentNode;
      if (!p || p.getAttribute("data-gp")) return;
      var gh = p.querySelector(".gh-btn");
      var ghRepo = gh ? (gh.title || "").replace(/^View\s+/, "").replace(/\s+on GitHub$/, "") : "";
      var s = (ghRepo && map[key(ghRepo)]) || map[key(a.textContent.trim())];
      if (!s) return;
      p.setAttribute("data-gp", "1");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gp-btn";
      b.innerHTML = ICON;
      b.title = "Open " + s.name + " on GitHub Pages";
      b.setAttribute("aria-label", b.title);
      b.style.cssText = "margin-left:8px;background:black;color:#ffffff;border:1px solid #888888;padding:1px 5px;cursor:pointer;line-height:1;";
      b.onclick = function () { window.open(href(s.url), "_blank", "noopener"); };
      var after = p.querySelector(".rw-btn") || p.querySelector("button[title*='itch']") || gh || a;
      after.insertAdjacentElement("afterend", b);
    });
  }

  function renderView(view) {
    var h = '<h2>GitHub Pages</h2><p class="tag">Every sudosilo repo that publishes a GitHub Pages site. Rechecked every three hours.</p>';
    if (!sites.length) h += '<p>No GitHub Pages sites found yet.</p>';
    sites.forEach(function (s) {
      var d = when(s);
      h += '<div style="border-left:3px solid ' + BLUE + ';padding:4px 0 4px 10px;margin:8px 0">';
      h += '<div><a href="' + esc(href(s.url)) + '" target="_blank" rel="noopener" style="color:' + ageColor(d) + '">' + esc(s.name) + '</a></div>';
      h += '<div style="font-size:13px">' + esc(s.url) + '</div>';
      h += '<div style="font-size:13px">last built ' + esc(d || "unknown") + (s.status ? ', ' + esc(s.status) : '') + (s.source ? ', from ' + esc(s.source) : '') + ' <a href="https://github.com/' + esc(s.repo) + '" target="_blank" rel="noopener">repo</a></div>';
      if (s.description) h += '<div style="font-size:13px;opacity:.8">' + esc(s.description) + '</div>';
      h += '</div>';
    });
    view.innerHTML = h;
  }

  function addView() {
    if (document.getElementById("pages-view")) return;
    var view = document.createElement("div");
    view.id = "pages-view";
    view.className = "hidden";
    var cat = document.getElementById("category-view");
    if (cat) cat.parentNode.insertBefore(view, cat);

    var others = ["stats-view", "alpha-view", "category-view", "links-view", "railway-view"];
    window.showPages = function () {
      renderView(view);
      others.forEach(function (id) { var e = document.getElementById(id); if (e) e.classList.add("hidden"); });
      view.classList.remove("hidden");
      document.getElementById("menu").classList.remove("open");
    };

    var hide = function () { view.classList.add("hidden"); };
    ["showView", "showStats", "showLinks", "showRailway"].forEach(function (fn) {
      var old = window[fn];
      if (typeof old === "function") window[fn] = function () { hide(); return old.apply(this, arguments); };
    });

    var menu = document.getElementById("menu");
    if (menu && !menu.querySelector(".gp-menu")) {
      var b = document.createElement("button");
      b.className = "gp-menu";
      b.textContent = "GitHub Pages";
      b.onclick = function () { window.showPages(); };
      var rw = menu.querySelector(".rw-menu");
      var first = menu.querySelector("details");
      if (rw) rw.insertAdjacentElement("afterend", b);
      else if (first) menu.insertBefore(b, first);
      else menu.appendChild(b);
      Array.prototype.forEach.call(menu.querySelectorAll("button"), function (btn) {
        var t = btn.textContent.trim();
        if (t === "Search" || t === "Links") btn.addEventListener("click", hide, true);
      });
    }
  }

  function start() {
    fetch("pages-v1.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : { sites: [] }; })
      .then(function (j) {
        sites = (j && j.sites) || [];
        addView();
        addLists();
        addButtons();
        var n = 0, t = setInterval(function () { addButtons(); if (++n > 20) clearInterval(t); }, 1500);
      })
      .catch(function () { addView(); });
  }

  if (document.readyState === "complete") setTimeout(start, 700);
  else window.addEventListener("load", function () { setTimeout(start, 700); });
})();
