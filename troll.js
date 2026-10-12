(function () {
  var BASE = "https://raw.githubusercontent.com/sudosilo/control-troll/main/";
  var GREEN = "#00ff00", YELLOW = "#ffff00", RED = "#ff4444", GRAY = "#888888", PINK = "#ff00ff";
  var STALE_HOURS = 48;

  function getJson(file) {
    return fetch(BASE + file, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(file + " " + r.status);
      return r.json();
    });
  }

  function keyOf(a) {
    try {
      var h = new URL(a.href).hostname.toLowerCase();
      return h.replace(/\.vercel\.app$/, "");
    } catch (e) {
      return a.textContent.trim();
    }
  }

  function klass(app) {
    if (!app.up) return "d";
    var tests = app.tests || [];
    if (tests.some(function (t) { return !t.pass; })) return "f";
    if ((app.errors || []).length) return "e";
    return "o";
  }

  var WORD = { o: "good", e: "working with console errors", f: "working but a feature test failed", d: "down", s: "status is stale", u: "not checked yet" };
  function colorOf(s) {
    if (s === "o") return GREEN;
    if (s === "e" || s === "f") return YELLOW;
    if (s === "d") return RED;
    return GRAY;
  }

  function line(box, text, color) {
    var p = document.createElement("div");
    p.textContent = text;
    p.style.margin = "3px 0";
    if (color) p.style.color = color;
    box.appendChild(p);
  }

  function panel(color) {
    var box = document.createElement("div");
    box.style.display = "none";
    box.style.width = "90%";
    box.style.boxSizing = "border-box";
    box.style.background = "black";
    box.style.color = color;
    box.style.border = "1px solid " + color;
    box.style.fontFamily = "monospace";
    box.style.fontSize = "12px";
    box.style.padding = "6px 8px";
    box.style.margin = "4px 0";
    box.className = "troll-panel";
    return box;
  }

  function arrow(text, color, box) {
    var t = document.createElement("span");
    t.textContent = " " + text;
    t.style.cursor = "pointer";
    t.style.color = color;
    t.style.marginLeft = "10px";
    t.className = "troll-toggle";
    t.addEventListener("click", function () {
      box.style.display = box.style.display === "none" ? "block" : "none";
    });
    return t;
  }

  function ageText(iso) {
    var mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 90) return mins + " minutes ago";
    var hrs = Math.round(mins / 60);
    if (hrs < 48) return hrs + " hours ago";
    return Math.round(hrs / 24) + " days ago";
  }

  function dayKey(offset) {
    var d = new Date(Date.now() - 7 * 3600 * 1000 - offset * 86400000);
    return d.toISOString().slice(0, 10);
  }

  function strip(box, name, hist) {
    if (!hist || !hist.days) return;
    var row = document.createElement("div");
    row.style.margin = "6px 0 2px";
    var any = false;
    for (var i = 29; i >= 0; i--) {
      var rec = hist.days[dayKey(i)] && hist.days[dayKey(i)].apps[name];
      var c = "#333333";
      if (rec) {
        any = true;
        c = rec.s === "d" ? RED : (rec.s === "f" || rec.s === "e") ? YELLOW : GREEN;
      }
      var sq = document.createElement("span");
      sq.style.display = "inline-block";
      sq.style.width = "6px";
      sq.style.height = "10px";
      sq.style.marginRight = "1px";
      sq.style.background = c;
      row.appendChild(sq);
    }
    if (any) {
      box.appendChild(row);
      line(box, "last 30 days, oldest on the left", GRAY);
    }
  }

  function buildAbout(box, spec) {
    if (!spec) {
      line(box, "No spec on file in control troll yet.", GRAY);
      return;
    }
    if (spec.active === false) line(box, "Marked inactive in control troll.", YELLOW);
    (spec.features || []).forEach(function (f) { line(box, f); });
    if (spec.keepSeparate) line(box, "Kept separate: " + spec.keepSeparate, PINK);
    if (spec.overlap) line(box, "Overlap: " + (typeof spec.overlap === "string" ? spec.overlap : JSON.stringify(spec.overlap)), PINK);
    if (spec.futureIdea) line(box, "Future idea: " + spec.futureIdea, PINK);
    if (spec.problem) line(box, "Problem: " + spec.problem, YELLOW);
    if (spec.note) line(box, "Note: " + spec.note, PINK);
    if (!(spec.features || []).length && !spec.keepSeparate && !spec.overlap && !spec.futureIdea && !spec.problem && !spec.note) {
      line(box, "Spec exists but has no description yet.", GRAY);
    }
  }

  function buildStatus(box, app, state, checkedAt, hist) {
    line(box, "Status: " + WORD[state], colorOf(state));
    if (!app) {
      line(box, "Control troll has not checked this one yet. It checks every project linked on this page once a day.", GRAY);
      return;
    }
    var tests = app.tests || [];
    var failing = tests.filter(function (t) { return !t.pass; });
    line(box, "HTTP " + (app.status || "none") + ", " + (app.ms != null ? app.ms + " ms" : "no load") + (tests.length ? ", tests " + (tests.length - failing.length) + " of " + tests.length + " passing" : ""));
    failing.forEach(function (t) { line(box, "FAIL " + t.name + (t.error ? ": " + t.error : ""), YELLOW); });
    (app.errors || []).slice(0, 4).forEach(function (e) { line(box, e, state === "d" ? RED : YELLOW); });
    line(box, "Checked " + ageText(checkedAt), GRAY);
    strip(box, app.name, hist);
  }

  function run(status, specs, hist) {
    var byName = {};
    (status.apps || []).forEach(function (a) { byName[a.name] = a; });
    var stale = (Date.now() - new Date(status.checkedAt).getTime()) > STALE_HOURS * 3600000;

    var links = document.querySelectorAll("#category-view a, #alpha-view a");
    Array.prototype.forEach.call(links, function (a) {
      var p = a.parentNode;
      if (!p || p.getAttribute("data-troll")) return;
      p.setAttribute("data-troll", "1");
      var key = keyOf(a);
      var app = byName[key] || byName[a.textContent.trim()];
      var spec = specs[key] || specs[a.textContent.trim()];

      var state = app ? klass(app) : "u";
      if (stale && app) state = "s";

      var aboutBox = panel(PINK);
      buildAbout(aboutBox, spec);
      var statBox = panel(colorOf(state));
      buildStatus(statBox, app, state, status.checkedAt, hist);

      p.appendChild(arrow("\u25be", PINK, aboutBox));
      p.appendChild(arrow("\u25be", colorOf(state), statBox));
      p.parentNode.insertBefore(statBox, p.nextSibling);
      p.parentNode.insertBefore(aboutBox, p.nextSibling);
    });
  }

  function start() {
    Promise.all([getJson("status.json"), getJson("specs/all.json"), getJson("history.json").catch(function () { return null; })])
      .then(function (r) { run(r[0], r[1], r[2]); })
      .catch(function () {});
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
/* starmark */
(function () {
  var COLORS = { blue: "#0088ff", orange: "#ff8800", green: "#00ff00", red: "#ff4444" };
  function stars() {
    Array.prototype.forEach.call(document.querySelectorAll(".tag"), function (t) {
      if (t.getAttribute("data-stars")) return;
      var words = t.textContent.split("-").map(function (w) { return w.trim().toLowerCase(); }).filter(function (w) { return COLORS[w]; });
      if (!words.length) return;
      t.setAttribute("data-stars", "1");
      t.textContent = "";
      words.forEach(function (w) {
        var s = document.createElement("span");
        s.textContent = String.fromCharCode(9733);
        s.style.color = COLORS[w];
        s.style.marginRight = "2px";
        s.style.pointerEvents = "none";
        t.appendChild(s);
      });
      var h = document.createElement("span");
      h.textContent = " " + words.join(" ");
      h.style.display = "none";
      t.appendChild(h);
    });
  }
  if (document.readyState === "complete") stars();
  else window.addEventListener("load", stars);
})();
/* fitmark */
(function () {
  var mq = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
  var st = document.createElement("style");
  st.textContent = "@media (min-width: 900px) and (hover: hover) and (pointer: fine) { #alpha-view p, #category-view p { margin: 2px 0; } #alpha-view h2, #category-view h2 { margin: 8px 0 4px; } }";
  document.head.appendChild(st);
  var busy = false;
  function fit() {
    if (busy) return;
    busy = true;
    ["category-view", "alpha-view"].forEach(function (id) {
      var v = document.getElementById(id);
      if (!v) return;
      if (!mq.matches) {
        v.style.height = ""; v.style.overflow = ""; v.style.columnFill = ""; v.style.columnCount = ""; v.style.fontSize = ""; v.style.columnGap = "";
        return;
      }
      if (v.offsetParent === null) return;
      var top = v.getBoundingClientRect().top + window.scrollY;
      v.style.height = Math.max(300, window.innerHeight - top - 14) + "px";
      v.style.overflow = "hidden";
      v.style.columnFill = "auto";
      v.style.columnGap = "28px";
      var sizes = [16, 15, 14, 13, 12, 11, 10, 9, 8];
      var done = false;
      for (var i = 0; i < sizes.length && !done; i++) {
        v.style.fontSize = sizes[i] + "px";
        var maxn = Math.max(1, Math.floor(v.clientWidth / (sizes[i] * 17)));
        for (var n = 1; n <= maxn; n++) {
          v.style.columnCount = n;
          if (v.scrollWidth <= v.clientWidth + 1) { done = true; break; }
        }
      }
    });
    busy = false;
  }
  function later() { setTimeout(fit, 60); }
  window.addEventListener("load", function () { fit(); setTimeout(fit, 1500); setTimeout(fit, 4000); });
  window.addEventListener("resize", later);
  document.addEventListener("click", later);
  document.addEventListener("input", later);
})();
