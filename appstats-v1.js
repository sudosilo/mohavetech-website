/* Per-app numbers under each project on the main page: lines of code, 2016 build hours, and an AI cost estimate.
   Lines and hours come from velocity-v1.json (counted each morning). Cost assumes every subscription below is
   used up each month and all of it went into code, so idle or wasted tokens raise the cost per line. */
(function () {
  var BLUE = "#4d8dff", GRAY = "#888888";
  var SPEND = [["Claude, three $20 plans", 60], ["Claude Team", 50], ["Grok", 30], ["ElevenLabs", 11]];
  var MONTHLY = SPEND.reduce(function (s, x) { return s + x[1]; }, 0);
  window.MOHAVE_SPEND = { items: SPEND, monthly: MONTHLY };

  function money(n) { return n >= 100 ? "$" + Math.round(n).toLocaleString("en-US") : n >= 1 ? "$" + n.toFixed(2) : (n * 100).toFixed(1) + " cents"; }
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

  function costModel(d) {
    var repos = d.repos || [], lines = 0, hours = 0;
    repos.forEach(function (r) { lines += r.lines; hours += r.hours; });
    var days = Math.max(1, (Date.now() - new Date(d.start + "T00:00:00").getTime()) / 86400000);
    var spent = MONTHLY * days / 30.44;
    return { lines: lines, hours: hours, spent: spent, perLine: lines ? spent / lines : 0, perHour: hours ? spent / hours : 0, days: days };
  }
  window.mohaveCostModel = costModel;

  function line(box, text, color) {
    var p = document.createElement("p");
    p.textContent = text;
    p.style.margin = "3px 0";
    if (color) p.style.color = color;
    box.appendChild(p);
  }

  function run(d) {
    var m = costModel(d), byName = {};
    (d.repos || []).forEach(function (r) { byName[r.name.toLowerCase()] = r; });
    var alias = { "kvs": "kvs-roulette", "offset-listener": "song-offset-listener", "tanksandzombies": "tanks-and-zombies", "equivalence-engine": "cross-venue-equivalence-engine", "ebutuoy": "ebutuoy-frontend", "shitty-ass-trading": "shitty-ass-trading-app", "threat-atlas": "threat-atlas-v3", "tile-spinner": "tilespinneratlas", "dronesim-blue": "dronesim", "coffeekit1": "coffeekit", "rat-site": "rat", "skwiggle": "skwiggle-v105", "ming-globe": "mind-globe" };
    var links = document.querySelectorAll("#category-view p > a, #alpha-view p > a");
    Array.prototype.forEach.call(links, function (a) {
      var p = a.parentNode;
      if (!p) return;
      if (p.getAttribute("data-appstats")) { var old = p.querySelector(".appstats-toggle"); if (old) p.appendChild(old); return; }
      p.setAttribute("data-appstats", "1");
      var name = a.textContent.trim().toLowerCase();
      var r = byName[name] || byName[alias[name]];
      var box = document.createElement("div");
      box.className = "troll-panel appstats-panel";
      box.style.cssText = "display:none;width:90%;box-sizing:border-box;background:black;color:" + BLUE + ";border:1px solid " + BLUE + ";font-family:monospace;font-size:12px;padding:6px 8px;margin:4px 0";
      if (r) {
        line(box, fmt(r.lines) + " lines of code in " + r.files + " files");
        line(box, fmt(r.hours) + " hours to build the 2016 way, by hand");
        line(box, "About " + money(r.lines * m.perLine) + " of AI subscriptions at " + money(m.perLine).replace(/^\$0/, "$0") + " per line");
        line(box, "Started " + r.created + ", last push " + r.pushed, GRAY);
      } else {
        line(box, "No repo with this name in the code count.", GRAY);
      }
      var t = document.createElement("span");
      t.textContent = " " + String.fromCharCode(0x25be);
      t.style.cssText = "cursor:pointer;color:" + BLUE + ";margin-left:10px";
      t.className = "troll-toggle appstats-toggle";
      t.title = "Project statistics";
      t.addEventListener("click", function () { box.style.display = box.style.display === "none" ? "block" : "none"; });
      p.appendChild(t);
      p.parentNode.insertBefore(box, p.nextSibling);
    });
  }

  function start() {
    fetch("velocity-v1.json?t=" + Math.floor(Date.now() / 600000)).then(function (r) { return r.json(); }).then(function (d) {
      run(d);
      setTimeout(function () { run(d); }, 2500);
      setTimeout(function () { run(d); }, 6000);
    }).catch(function () {});
  }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);
})();
