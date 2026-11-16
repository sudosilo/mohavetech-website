// Run in Termux from the mohavetech-website folder.
// Finds every sudosilo repo whose code calls Anthropic or ElevenLabs, saves ai-v1.json, and pushes it.
const fs = require("fs");
const { execSync } = require("child_process");

function run(cmd) {
  try { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 180000, maxBuffer: 64 * 1024 * 1024 }); } catch (e) { return (e && e.stdout) || ""; }
}

function names(q) {
  const out = run("gh search code " + JSON.stringify(q) + " --owner sudosilo --limit 1000 --json repository");
  let list = [];
  try { list = JSON.parse(out); } catch (e) {}
  return list.map(h => String((h.repository && (h.repository.name || h.repository.nameWithOwner)) || "").split("/").pop().toLowerCase()).filter(n => n && n !== "mohavetech-website");
}

function collect(queries) {
  const repos = {};
  queries.forEach(q => names(q).forEach(n => { repos[n] = { hits: ((repos[n] && repos[n].hits) || 0) + 1 }; }));
  return repos;
}

const out = {
  generated: new Date().toISOString(),
  anthropic: collect(["api.anthropic.com", "@anthropic-ai/sdk", "ANTHROPIC_API_KEY", "anthropic-version", "from anthropic import"]),
  elevenlabs: collect(["api.elevenlabs.io", "ELEVENLABS_API_KEY", "elevenlabs", "xi-api-key"])
};

fs.writeFileSync("ai-v1.json", JSON.stringify(out, null, 1));
console.log("ANTHROPIC APPS FOUND: " + Object.keys(out.anthropic).length);
console.log("ELEVENLABS APPS FOUND: " + Object.keys(out.elevenlabs).length);
run("git add ai-v1.json");
run('git commit -m "Anthropic and ElevenLabs app list"');
const pushed = run("git push origin master 2>&1 && echo PUSHED");
console.log(/PUSHED/.test(pushed) ? "AI LIST PUSHED" : "AI LIST PUSH FAILED");
