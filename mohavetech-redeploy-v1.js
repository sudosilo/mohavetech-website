/* Links Vercel projects to their GitHub repos and deploys them from GitHub, so pushes to those repos go live.
   Works through mohavetech-redeploy-v1.json in batches to stay under Vercel's daily deploy limit. */
const fs = require('fs');
const FILE = 'mohavetech-redeploy-v1.json', BATCH = 80;
const token = process.env.VERCEL_TOKEN, slug = process.env.VERCEL_SLUG;
const api = async (method, path, body) => {
  const r = await fetch('https://api.vercel.com' + path + (path.includes('?') ? '&' : '?') + 'slug=' + slug, { method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  let j = {}; try { j = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, j };
};
(async () => {
  const st = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const batch = st.pending.splice(0, BATCH);
  for (const it of batch) {
    const res = { project: it.project };
    const proj = await api('GET', '/v9/projects/' + encodeURIComponent(it.project));
    if (!proj.ok) { res.error = 'project: ' + (proj.j.error && proj.j.error.message || proj.status); st.done.push(res); continue; }
    if (!proj.j.link) {
      const ln = await api('POST', '/v9/projects/' + encodeURIComponent(it.project) + '/link', { type: 'github', repo: it.repo });
      res.link = ln.ok ? 'linked' : 'link failed: ' + (ln.j.error && ln.j.error.message || ln.status);
    } else res.link = 'already linked to ' + (proj.j.link.org || '') + '/' + (proj.j.link.repo || '');
    const [org, repo] = it.repo.split('/');
    const dep = await api('POST', '/v13/deployments', { name: it.project, project: it.project, target: 'production', gitSource: { type: 'github', org, repo, ref: it.branch } });
    res.deploy = dep.ok ? 'started ' + (dep.j.url || '') : 'deploy failed: ' + (dep.j.error && dep.j.error.message || dep.status);
    st.done.push(res);
    console.log(JSON.stringify(res));
  }
  fs.writeFileSync(FILE, JSON.stringify(st, null, 1));
  console.log('pending ' + st.pending.length);
})();
