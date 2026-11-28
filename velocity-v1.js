// Personal Velocity: adds a section to the Statistics tab.
// Reads velocity-v1.json (written each morning by the velocity-scan workflow) and compares
// how long this code would have taken a solo developer working the 2016 way with the calendar time it took.
(function () {
  var BLUE = "#2447f5";
  var data = null;
  var loading = null;

  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) {
      loading = fetch("velocity-v1.json?t=" + Date.now()).then(function (r) { return r.json(); }).then(function (d) { data = d; return d; });
    }
    return loading;
  }

  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  function one(n) { return (Math.round(n * 10) / 10).toLocaleString("en-US"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function bar(px, color) {
    return '<span class="vel-bar" style="display:inline-block;height:10px;width:' + Math.max(2, px) + 'px;background:' + color + ';vertical-align:middle;border-radius:2px"></span>';
  }

  function weekStart(dateStr) {
    var d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  }

  function render(box, d) {
    var repos = (d.repos || []).slice();
    var startMs = new Date(d.start + "T00:00:00").getTime();
    var days = Math.max(1, Math.floor((Date.now() - startMs) / 86400000));
    var lines = 0, hours = 0, cocomo = 0;
    repos.forEach(function (r) { lines += r.lines; hours += r.hours; cocomo += r.cocomo; });

    var perDay = hours / days;
    var score = perDay / 8;
    var cocomoPerDay = cocomo / days;
    var workdays2016 = hours / 8;
    var years2016 = hours / 2000;

    var h = '<h2>Personal Velocity</h2>';
    h += '<div style="border:2px solid ' + BLUE + ';border-radius:10px;padding:12px 14px;margin:6px 0 12px">';
    h += '<div style="font-size:13px;opacity:.75">Velocity score</div>';
    h += '<div style="font-size:42px;font-weight:700;color:' + BLUE + ';-webkit-text-fill-color:' + BLUE + ';line-height:1.1">' + one(score) + 'x</div>';
    h += '<div style="font-size:13px">2016 workdays claimed per calendar day since ' + esc(d.start) + '</div>';
    h += '</div>';

    h += '<p>Code written: ' + fmt(lines) + ' lines across ' + repos.length + ' repos</p>';
    h += '<p>Calendar days since starting: ' + fmt(days) + '</p>';
    h += '<p>2016 solo developer build time: ' + fmt(hours) + ' hours, which is ' + fmt(workdays2016) + ' eight hour workdays or ' + one(years2016) + ' full time work years</p>';
    h += '<p>2016 hours claimed per calendar day: ' + one(perDay) + '</p>';
    h += '<p>Full company estimate (COCOMO, with planning, testing and docs): ' + fmt(cocomo) + ' hours, ' + one(cocomoPerDay) + ' hours per calendar day</p>';

    h += '<h2>One Day, Claimed</h2>';
    h += '<p style="font-size:13px">Each block is one hour. Gray is the clock. Blue is 2016 work claimed in an average day.</p>';
    var blocks = Math.round(perDay);
    var row = "";
    var shown = Math.max(24, Math.min(blocks, 480));
    for (var i = 0; i < shown; i++) {
      var col = i < blocks ? BLUE : "#c9ccd4";
      row += '<span style="display:inline-block;width:9px;height:9px;margin:1px;background:' + col + ';border-radius:1px"></span>';
      if (i === 23 && shown > 24) row += '<br>';
    }
    h += '<div style="line-height:0;margin-bottom:6px">' + row + '</div>';
    if (blocks > 480) h += '<p style="font-size:13px">Showing the first 480 blocks of ' + fmt(blocks) + '</p>';

    var weeks = {};
    repos.forEach(function (r) {
      if (!r.created) return;
      var w = weekStart(r.created);
      weeks[w] = (weeks[w] || 0) + r.hours;
    });
    var wk = Object.keys(weeks).sort();
    if (wk.length) {
      var maxW = Math.max.apply(null, wk.map(function (k) { return weeks[k]; }));
      h += '<h2>2016 Hours Claimed By Week</h2>';
      h += '<p style="font-size:13px">A clock week holds 168 hours. Weeks are counted by when each repo was started.</p>';
      wk.forEach(function (k) {
        var v = weeks[k];
        h += '<div style="margin-bottom:4px;font-size:13px">' + k + ' ' + bar(Math.round(v / maxW * 200), BLUE) + ' ' + fmt(v) + ' h, ' + one(v / 168) + ' weeks</div>';
      });
    }

    h += '<h2>2016 Build Time By Project</h2>';
    var maxH = repos.length ? repos[0].hours : 1;
    repos.forEach(function (r) {
      h += '<div style="margin-bottom:4px;font-size:13px"><span style="display:inline-block;min-width:150px;word-break:break-all">' + esc(r.name) + '</span> ' + bar(Math.round(r.hours / maxH * 160), BLUE) + ' ' + fmt(r.hours) + ' h, ' + fmt(r.lines) + ' lines</div>';
    });

    if (window.mohaveCostModel && window.MOHAVE_SPEND) {
      var m = window.mohaveCostModel(d), sp = window.MOHAVE_SPEND;
      var usd = function (n) { return n >= 100 ? '$' + fmt(n) : n >= 1 ? '$' + n.toFixed(2) : (n * 100).toFixed(1) + ' cents'; };
      h += '<h2>Cost Of Code</h2>';
      h += '<p>Subscriptions: ' + sp.items.map(function (x) { return esc(x[0]) + ' $' + x[1]; }).join(', ') + ', for $' + sp.monthly + ' a month</p>';
      h += '<p>Spent since ' + esc(d.start) + ': about ' + usd(m.spent) + '</p>';
      h += '<p>Cost per line of code: ' + usd(m.perLine) + '</p>';
      h += '<p>Cost per 2016 build hour: ' + usd(m.perHour) + '</p>';
      h += '<p style="font-size:13px">These are flat monthly plans at today\'s prices, counted from ' + esc(d.start) + '. Every dollar counts against the code, including tokens that went into anything else. Plans that started later than that make the real cost lower.</p>';
    }
    h += '<h2>How This Is Figured</h2>';
    h += '<p style="font-size:13px">Every sudosilo repo is cloned each morning and its hand written code lines are counted, leaving out blank lines, copied or snapshot apps, any line already counted in an older repo, libraries, minified files, data files, and any line over 400 characters. ';
    h += 'The 2016 build time assumes a solo developer finishing ' + d.linesPerHour + ' working lines per hour, counting design, debugging and testing, without AI help. ';
    h += 'The full company estimate uses the basic COCOMO organic model, 2.4 times thousands of lines to the 1.05 power person months at ' + d.hoursPerPersonMonth + ' hours each, which is how a 2016 software shop would bid the same work. ';
    h += 'The velocity score is 2016 hours claimed per calendar day divided by an eight hour workday. Last counted ' + esc(String(d.generated).slice(0, 10)) + '.</p>';

    box.innerHTML = h;
  }

  function addSection() {
    var el = document.getElementById("stats-view");
    if (!el) return;
    var box = document.getElementById("velocity-box");
    if (!box) {
      box = document.createElement("div");
      box.id = "velocity-box";
      var intro = el.querySelector("p");
      if (intro && intro.nextSibling) el.insertBefore(box, intro.nextSibling);
      else el.appendChild(box);
    }
    box.innerHTML = '<h2>Personal Velocity</h2><p>counting...</p>';
    load().then(function (d) { render(box, d); }).catch(function () {
      box.innerHTML = '<h2>Personal Velocity</h2><p>velocity numbers are being counted</p>';
    });
  }

  var original = window.renderStats;
  if (typeof original === "function") {
    window.renderStats = function () {
      original.apply(this, arguments);
      addSection();
    };
  }
})();
