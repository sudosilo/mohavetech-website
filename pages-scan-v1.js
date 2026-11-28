// Runs in GitHub Actions (pages-scan workflow).
// Finds every sudosilo repo that publishes a GitHub Pages site and saves pages-v1.json for the hub.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OWNER = "sudosilo";

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 120000, maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    return (e && e.stdout) || "";
  }
}

let repos = [];
try {
  const raw = run(`gh api --paginate "users/${OWNER}/repos?per_page=100&type=owner" --jq '.[] | {name, has_pages, pushed_at, homepage, description, default_branch}'`);
  repos = raw.split("\n").filter(Boolean).map(l => JSON.parse(l));
} catch (e) {}
if (!repos.length) { console.log("repo list came back empty"); process.exit(1); }

const sites = [];
repos.filter(r => r.has_pages).forEach(r => {
  let url = r.name.toLowerCase() === (OWNER + ".github.io") ? `${OWNER}.github.io/` : `${OWNER}.github.io/${r.name}/`;
  let source = "";
  let status = "";
  let built = "";
  try {
    const p = JSON.parse(run(`gh api repos/${OWNER}/${r.name}/pages`) || "{}");
    if (p.html_url) url = p.html_url.replace(/^https?:\/\//, "");
    if (p.source) source = (p.source.branch || "") + (p.source.path && p.source.path !== "/" ? p.source.path : "");
    if (p.build_type === "workflow") source = "actions";
    status = p.status || "";
  } catch (e) {}
  try {
    const b = JSON.parse(run(`gh api repos/${OWNER}/${r.name}/pages/builds/latest`) || "{}");
    if (b.updated_at) built = b.updated_at.slice(0, 10);
    if (b.status && !status) status = b.status;
  } catch (e) {}
  sites.push({
    name: r.name,
    url,
    repo: `${OWNER}/${r.name}`,
    pushed: (r.pushed_at || "").slice(0, 10),
    built,
    source,
    status,
    description: r.description || ""
  });
  console.log(r.name, url);
});

sites.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(path.join(__dirname, "pages-v1.json"), JSON.stringify({ generated: new Date().toISOString(), sites }, null, 1) + "\n");
console.log("saved", sites.length, "pages sites");
