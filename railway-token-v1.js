// Run once in Termux from the mohavetech-website folder.
// Makes a long lived Railway account token from the Railway CLI login and stores it in Vercel as RAILWAY_TOKEN.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync, spawnSync } = require("child_process");

const PREFIX = process.env.PREFIX || "/data/data/com.termux/files/usr";
const CONFIGS = [
  path.join(PREFIX, "var/lib/proot-distro/installed-rootfs/ubuntu/root/.railway/config.json"),
  path.join(os.homedir(), ".railway/config.json")
];

try { execSync("proot-distro login ubuntu -- bash -lc 'railway whoami'", { stdio: "ignore" }); } catch (e) {}
try { execSync("railway whoami", { stdio: "ignore" }); } catch (e) {}

let login = null;
for (const p of CONFIGS) {
  try {
    const u = JSON.parse(fs.readFileSync(p, "utf8")).user || {};
    const t = u.accessToken || u.access_token || u.token;
    if (t) { login = t; break; }
  } catch (e) {}
}
if (!login) { console.log("No Railway login found on this phone."); process.exit(1); }

(async () => {
  const r = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + login },
    body: JSON.stringify({ query: "mutation($i: ApiTokenCreateInput!) { apiTokenCreate(input: $i) }", variables: { i: { name: "mohave-wtf-railway-tab-" + Date.now() } } })
  });
  const j = await r.json();
  const token = j.data && j.data.apiTokenCreate;
  if (!token) { console.log(JSON.stringify(j.errors || j)); process.exit(1); }
  console.log("\n***** SAVE THIS RAILWAY TOKEN *****\n" + token + "\n");
  spawnSync("vercel", ["env", "rm", "RAILWAY_TOKEN", "production", "--yes"], { stdio: "ignore" });
  const add = spawnSync("vercel", ["env", "add", "RAILWAY_TOKEN", "production"], { input: token, stdio: ["pipe", "inherit", "inherit"] });
  process.exit(add.status || 0);
})();
