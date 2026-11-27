// Runs in GitHub Actions (velocity-scan workflow).
// Shallow clones every sudosilo repo, counts hand written code lines, estimates what each would have cost
// a solo developer working the 2016 way, and saves velocity-v1.json for the Statistics tab.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const OWNER = "sudosilo";
const START = "2026-04-05";
const LINES_PER_HOUR = 15;
const HOURS_PER_PERSON_MONTH = 152;

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 300000, maxBuffer: 256 * 1024 * 1024 });
  } catch (e) {
    return (e && e.stdout) || "";
  }
}

const CODE = /\.(js|mjs|cjs|jsx|ts|tsx|html|htm|css|scss|py|sh|vue|svelte|kt|kts|java|go|rs|sql|c|h|cpp|hpp|cs|swift|dart|lua|rb|php|gd|glsl|frag|vert|wgsl)$/i;
const SKIP_DIR = /^(\.git|node_modules|dist|build|out|vendor|\.next|\.vercel|\.venv|venv|__pycache__|coverage|public\/lib|lib\/vendor)$/;
const SKIP_FILE = /(\.min\.|-min\.|\.bundle\.|lock\.|\.map$|^three\.|^phaser|^p5\.|^tone\.|^leaflet|^chart\.|^d3\.|^jquery)/i;
const MAX_FILE_BYTES = 400 * 1024;
const MAX_LINE = 400;

function walk(dir, out) {
  let list = [];
  try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  list.forEach(d => {
    const f = path.join(dir, d.name);
    if (d.isDirectory()) { if (!SKIP_DIR.test(d.name)) walk(f, out); return; }
    if (!CODE.test(d.name) || SKIP_FILE.test(d.name)) return;
    out.push(f);
  });
}

function countLines(file) {
  let st;
  try { st = fs.statSync(file); } catch (e) { return 0; }
  if (st.size > MAX_FILE_BYTES) return 0;
  let text = "";
  try { text = fs.readFileSync(file, "utf8"); } catch (e) { return 0; }
  let n = 0;
  text.split(/\r?\n/).forEach(line => {
    const t = line.trim();
    if (!t || t.length > MAX_LINE) return;
    n++;
  });
  return n;
}

function cocomoHours(lines) {
  const kloc = lines / 1000;
  if (kloc <= 0) return 0;
  return Math.round(2.4 * Math.pow(kloc, 1.05) * HOURS_PER_PERSON_MONTH);
}

let repoList = [];
try {
  repoList = JSON.parse(run(`gh repo list ${OWNER} --limit 1000 --json name,createdAt,pushedAt,isFork,isArchived`));
} catch (e) {}
if (!repoList.length) { console.log("repo list came back empty"); process.exit(1); }

const tmp = path.join(os.tmpdir(), "mohave-velocity-scan");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

const repos = [];
repoList.filter(r => !r.isFork).forEach(r => {
  const dir = path.join(tmp, r.name);
  run(`git clone --depth 1 --quiet https://github.com/${OWNER}/${r.name}.git "${dir}"`);
  const files = [];
  walk(dir, files);
  let lines = 0;
  files.forEach(f => { lines += countLines(f); });
  fs.rmSync(dir, { recursive: true, force: true });
  if (!lines) return;
  repos.push({
    name: r.name,
    created: (r.createdAt || "").slice(0, 10),
    pushed: (r.pushedAt || "").slice(0, 10),
    files: files.length,
    lines,
    hours: Math.round(lines / LINES_PER_HOUR),
    cocomo: cocomoHours(lines)
  });
  console.log(r.name, lines);
});

repos.sort((a, b) => b.lines - a.lines);

const out = {
  generated: new Date().toISOString(),
  start: START,
  linesPerHour: LINES_PER_HOUR,
  hoursPerPersonMonth: HOURS_PER_PERSON_MONTH,
  repos
};
fs.writeFileSync(path.join(__dirname, "velocity-v1.json"), JSON.stringify(out, null, 1) + "\n");
console.log("saved", repos.length, "repos");
