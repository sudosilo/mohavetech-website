import crypto from 'crypto';

export default async function handler(req, res) {
  const secret = process.env.WEBHOOK_SECRET;
  const signature = req.headers['x-vercel-signature'];
  const rawBody = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha1', secret).update(rawBody).digest('hex');
  if (signature !== expected) {
    res.status(401).json({ ok: false });
    return;
  }
  const projectName = req.body.payload && req.body.payload.project && req.body.payload.project.name;
  if (projectName) {
    await fetch(process.env.KV_REST_API_URL + '/set/deploy:' + projectName, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.KV_REST_API_TOKEN },
      body: JSON.stringify(Date.now())
    });
  }
  res.status(200).json({ ok: true });
}
