/* Anthropic and ElevenLabs buttons on hub app rows. Reads ai-v1.json, made by ai-scan-v1.js. */
(function () {
  var KINDS = [
    {
      id: "anthropic", cls: "an-btn", label: "Anthropic", url: "https://console.anthropic.com/usage",
      icon: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style="vertical-align:middle"><path d="M2.5 3.5h11a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-3 2.5v-2.5H2.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" fill="none" stroke="#d4a27f" stroke-width="1.5" stroke-linejoin="round"/><circle cx="5.3" cy="7.5" r=".9" fill="#d4a27f"/><circle cx="8" cy="7.5" r=".9" fill="#d4a27f"/><circle cx="10.7" cy="7.5" r=".9" fill="#d4a27f"/></svg><span style="display:none">anthropic claude</span>'
    },
    {
      id: "elevenlabs", cls: "el-btn", label: "ElevenLabs", url: "https://elevenlabs.io/app/usage",
      icon: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style="vertical-align:middle"><path d="M1.5 8h1.6M4.5 5v6M7 2.5v11M9.5 4.5v7M12 6.5v3M14.5 8h0" fill="none" stroke="#5aa9ff" stroke-width="1.6" stroke-linecap="round"/></svg><span style="display:none">elevenlabs voice</span>'
    }
  ];
  var data = null;

  function key(s) { return String(s || "").toLowerCase().split("/").pop().trim(); }

  function badges() {
    if (!data) return;
    var links = document.querySelectorAll("#category-view a, #alpha-view a");
    Array.prototype.forEach.call(links, function (a) {
      var p = a.parentNode;
      if (!p) return;
      var name = a.textContent.trim();
      var gh = p.querySelector(".gh-btn");
      var ghRepo = gh ? key((gh.title || "").replace(/^View\s+/, "").replace(/\s+on GitHub$/, "")) : "";
      KINDS.forEach(function (k) {
        var list = data[k.id] || {};
        if (p.getAttribute("data-" + k.id)) return;
        if (!((ghRepo && list[ghRepo]) || list[key(name)])) return;
        p.setAttribute("data-" + k.id, "1");
        var b = document.createElement("button");
        b.type = "button";
        b.className = k.cls;
        b.innerHTML = k.icon;
        b.title = "Open " + name + " in " + k.label;
        b.setAttribute("aria-label", "Open " + name + " in " + k.label);
        b.style.cssText = "margin-left:8px;background:black;color:#ffffff;border:1px solid #888888;padding:1px 5px;cursor:pointer;line-height:1;";
        b.onclick = function () { window.open(k.url, "_blank", "noopener"); };
        var after = p.querySelector(".el-btn") || p.querySelector(".an-btn") || p.querySelector(".cf-btn") || p.querySelector(".sb-btn") || p.querySelector(".rw-btn") || p.querySelector("button[title*='itch']") || gh || a;
        after.insertAdjacentElement("afterend", b);
      });
    });
  }

  function start() {
    var css = document.createElement("style");
    css.textContent = "@media (min-width: 900px) and (hover: hover) and (pointer: fine) { html.modern .an-btn svg, html.future .an-btn svg, html.retro .an-btn svg, html.modern .el-btn svg, html.future .el-btn svg, html.retro .el-btn svg { width: .9em; height: .9em; } }";
    document.head.appendChild(css);
    fetch("/ai-v1.json", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j) return;
      data = j;
      badges();
      var n = 0, t = setInterval(function () { badges(); if (++n > 20) clearInterval(t); }, 1500);
    }).catch(function () {});
  }

  if (document.readyState === "complete") setTimeout(start, 800);
  else window.addEventListener("load", function () { setTimeout(start, 800); });
})();
