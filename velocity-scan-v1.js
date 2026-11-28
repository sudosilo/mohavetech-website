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
const SKIP_DIR = /^(\.git|node_modules|dist|build|out|vendor|\.next|\.vercel|\.venv|venv|__pycache__|coverage|scout|builds|snapshots|mirror|mirrors|copies|archive|public\/lib|lib\/vendor)$/;
const SKIP_FILE = /(\.min\.|-min\.|\.bundle\.|lock\.|\.map$|^three\.|^phaser|^p5\.|^tone\.|^leaflet|^chart\.|^d3\.|^jquery|jsqr|qrcode|pako|jszip|tesseract|pdf\.worker|pdf-lib)/i;
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

function countLines(file, seen) {
  let st;
  try { st = fs.statSync(file); } catch (e) { return 0; }
  if (st.size > MAX_FILE_BYTES) return 0;
  let text = "";
  try { text = fs.readFileSync(file, "utf8"); } catch (e) { return 0; }
  let n = 0;
  text.split(/\r?\n/).forEach(line => {
    const t = line.trim();
    if (!t || t.length > MAX_LINE) return;
    if (seen.has(t)) return;
    seen.add(t);
    n++;
  });
  return n;
}

// Real hours from commit times: commits less than SESSION_GAP minutes apart are one work session.
// Each session counts from its first commit to its last, plus LEAD minutes of work before the first commit.
const SESSION_GAP = 45, LEAD = 15;
const BOTS = /(bot|scribe|troll|github-actions|dependabot)/i;
function sessions(times, repo) {
  times = times.slice().sort((a, b) => a - b);
  let n = 0, mins = 0, s0 = null, last = null;
  const list = [];
  const close = () => { mins += (last - s0) / 60 + LEAD; list.push({ repo, start: s0 - LEAD * 60, end: last }); };
  times.forEach(t => {
    if (last === null || t - last > SESSION_GAP * 60) { if (s0 !== null) close(); s0 = t; n++; }
    last = t;
  });
  if (s0 !== null) close();
  return { count: n, hours: Math.round(mins / 6) / 10, list };
}
const allSessions = [];
const allTimes = [];
const commitLog = {};

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

// Each distinct line counts once across the whole account, credited to the oldest repo holding it,
// so copied apps, snapshots and shared code are not counted twice.
const seen = new Set();
const repos = [];
repoList.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
repoList.filter(r => !r.isFork).forEach(r => {
  const dir = path.join(tmp, r.name);
  run(`git clone --filter=blob:none --quiet https://github.com/${OWNER}/${r.name}.git "${dir}"`);
  const commits = run(`git -C "${dir}" log --format=%ct%x09%an%x09%s`).split("\n").filter(Boolean)
    .map(l => l.split("\t")).filter(c => !BOTS.test(c[1] || "") && +c[0] > 0).map(c => ({ t: +c[0], msg: (c[2] || "").trim() }));
  const files = [];
  walk(dir, files);
  let lines = 0;
  files.forEach(f => { lines += countLines(f, seen); });
  fs.rmSync(dir, { recursive: true, force: true });
  if (!lines) return;
  commitLog[r.name] = commits;
  repos.push({
    name: r.name,
    created: (r.createdAt || "").slice(0, 10),
    pushed: (r.pushedAt || "").slice(0, 10),
    files: files.length,
    lines,
    hours: Math.round(lines / LINES_PER_HOUR),
    cocomo: cocomoHours(lines),
  });
  console.log(r.name, lines);
});

// The same commit message pushed to many repos at once is a scripted bulk change, not hands-on work.
const msgRepos = {};
Object.keys(commitLog).forEach(n => new Set(commitLog[n].map(c => c.msg)).forEach(m => { msgRepos[m] = (msgRepos[m] || 0) + 1; }));
const BULK = 5;
repos.forEach(r => {
  const times = (commitLog[r.name] || []).filter(c => !(c.msg && msgRepos[c.msg] >= BULK)).map(c => c.t);
  times.forEach(t => allTimes.push(t));
  const ses = sessions(times, r.name);
  ses.list.forEach(x => allSessions.push(x));
  r.commits = times.length;
  r.sessions = ses.count;
  r.realHours = ses.hours;
});

repos.sort((a, b) => b.lines - a.lines);

const out = {
  generated: new Date().toISOString(),
  start: START,
  linesPerHour: LINES_PER_HOUR,
  hoursPerPersonMonth: HOURS_PER_PERSON_MONTH,
  sessionGapMinutes: SESSION_GAP,
  realHours: sessions(allTimes).hours,
  sessions: sessions(allTimes).count,
  repos
};
// Field Twin correlation: which coding sessions happened while a work ticket was open.
// Only totals are saved, since this file is public. No places, addresses or ticket details leave the database.
function fieldTwin() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return { error: "no Field Twin key" };
  const q = "select extract(epoch from opened_at)::bigint as o, extract(epoch from coalesce(closed_at, opened_at + interval '4 hours'))::bigint as c from public.field_twin_tickets where opened_at is not null";
  fs.writeFileSync(path.join(tmp, "q.json"), JSON.stringify({ query: q }));
  const raw = run(`curl -s -X POST https://api.supabase.com/v1/projects/zasyjjoypkpvyqdueums/database/query -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" --data-binary @${path.join(tmp, "q.json")}`);
  let rows;
  try { rows = JSON.parse(raw); } catch (e) { return { error: "Field Twin did not answer" }; }
  if (!Array.isArray(rows)) return { error: "Field Twin said: " + String(rows.message || raw).slice(0, 120) };
  const tickets = rows.map(t => [+t.o, +t.c]).filter(t => t[0] && t[1] >= t[0]);
  if (!tickets.length) return { tickets: 0 };
  const from = Math.min.apply(null, tickets.map(t => t[0]));
  const overlap = (a, b) => tickets.reduce((m, t) => m + Math.max(0, Math.min(b, t[1]) - Math.max(a, t[0])), 0);
  const perRepo = {};
  allSessions.filter(x => x.end >= from).forEach(x => { perRepo[x.repo] = (perRepo[x.repo] || 0) + Math.min(x.end - x.start, overlap(x.start, x.end)); });
  // merged timeline: sessions on different repos at the same time count once
  const merged = [];
  allSessions.filter(x => x.end >= from).map(x => [x.start, x.end]).sort((a, b) => a[0] - b[0]).forEach(x => {
    const m = merged[merged.length - 1];
    if (m && x[0] <= m[1]) m[1] = Math.max(m[1], x[1]); else merged.push(x.slice());
  });
  let on = 0, off = 0;
  const n = merged.length, byHour = new Array(24).fill(0);
  merged.forEach(x => {
    const len = x[1] - x[0], o = Math.min(len, overlap(x[0], x[1]));
    on += o; off += len - o;
    for (let t = x[0]; t < x[1]; t += 300) byHour[new Date((t - 7 * 3600) * 1000).getUTCHours()] += 300 / 3600;
  });
  return {
    tickets: tickets.length,
    from: new Date(from * 1000).toISOString().slice(0, 10),
    sessions: n,
    onTicketHours: Math.round(on / 360) / 10,
    offTicketHours: Math.round(off / 360) / 10,
    byHour: byHour.map(v => Math.round(v * 10) / 10),
    perRepo: Object.fromEntries(Object.entries(perRepo).filter(e => e[1] > 0).map(e => [e[0], Math.round(e[1] / 360) / 10]))
  };
}
out.fieldTwin = fieldTwin();
console.log("field twin", JSON.stringify(out.fieldTwin).slice(0, 300));
fs.writeFileSync(path.join(__dirname, "velocity-v1.json"), JSON.stringify(out, null, 1) + "\n");
console.log("saved", repos.length, "repos");
