export default async function handler(req, res) {
  const token = process.env.MOHAVETECH_API_TOKEN;
  const teamId = process.env.MOHAVETECH_TEAM_ID;
  let url = "https://api.vercel.com/v9/projects?limit=100";
  if (teamId) {
    url += "&teamId=" + teamId;
  }
  try {
    const response = await fetch(url, { headers: { Authorization: "Bearer " + token } });
    const text = await response.text();
    if (!response.ok) {
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ error: true, status: response.status, body: text.slice(0, 300), teamIdUsed: teamId || "none" });
      return;
    }
    const data = JSON.parse(text);
    const count = data.projects ? data.projects.length : 0;
    if (!data.projects || count === 0) {
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ error: true, status: 200, body: "zero projects returned", teamIdUsed: teamId || "none" });
      return;
    }
    const result = data.projects.map(p => {
      const updated = p.latestDeployments && p.latestDeployments[0]
        ? p.latestDeployments[0].createdAt
        : p.updatedAt;
      const ageDays = Math.floor((Date.now() - updated) / 86400000);
      return { name: p.name, ageDays: ageDays };
    });
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(result);
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ error: true, status: 0, body: String(e), teamIdUsed: teamId || "none" });
  }
}
