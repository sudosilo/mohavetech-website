const names = ["access-terminal","access-terminal-admin","access-terminal-orange","access-terminal-red","access-termonal-blue","aerophin-twin","androids","birdix","birthday-calendar","bitfield-synth","cabin-viewer","campus-ebutuoy","chromatogram","circuit-musicfx","coffeekit1","daily-outline","db-stumbler-blue","dronecamp","ebutuoy","edmia","envelope","equivalence-engine","field-twin","frontend","ghost-kitchen-builder","graceland-diagram","gridmark","groundcore","hackercons","infinicanvan","infinite-centerpoint","invoice-green","irrigation-station","j30p4rdy","kvs","legends","looper","mary-jane-man","ming-globe","mission-operator","offset-listener","open-pipeline","parkingten","rat-site","rat30-deck","red-spoor","repofind","restack","rogue-rail","rtss","screensaver-musicfx","shitty-ass-news","shitty-ass-trading","skwiggle","spaceout","spectral-engin","spirits-atlas","stumbler","suno-forge","swh-sumbler","tanksandzombies","termbeat","tile-spinner","torque-converter","tower-builder","tower-builder-one","tractor-tool","tunnelfx","welcome-to-the-madness"];

export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const result = [];
  for (const name of names) {
    try {
      const r = await fetch(url + '/get/deploy:' + name, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const j = await r.json();
      if (j.result) {
        const ageDays = Math.floor((Date.now() - Number(j.result)) / 86400000);
        result.push({ name, ageDays });
      }
    } catch (e) {}
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(result);
}
