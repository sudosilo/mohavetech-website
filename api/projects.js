export default async function handler(req, res) {
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const response = await fetch(
    "https://api.vercel.com/v9/projects?teamId=" + teamId,
    { headers: { Authorization: "Bearer " + token } }
  );
  const data = await response.json();
  const result = data.projects.map(p => {
    const updated = p.latestDeployments && p.latestDeployments[0]
      ? p.latestDeployments[0].createdAt
      : p.updatedAt;
    const ageDays = Math.floor((Date.now() - updated) / 86400000);
    return { name: p.name, ageDays: ageDays };
  });
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(result);
}
