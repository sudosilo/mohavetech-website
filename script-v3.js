const baseDates = {
  "access-terminal": "2026-09-09",
  "access-terminal-admin": "2026-08-01",
  "access-terminal-orange": "2026-09-09",
  "access-terminal-red": "2026-09-09",
  "access-termonal-blue": "2026-09-09",
  "aerophin-twin": "2026-09-07",
  "androids": "2026-07-02",
  "birdix": "2026-05-13",
  "birthday-calendar": "2026-09-02",
  "bitfield-synth": "2026-09-08",
  "cabin-viewer": "2026-05-13",
  "campus-ebutuoy": "2026-07-02",
  "chromatogram": "2026-08-26",
  "circuit-musicfx": "2026-07-02",
  "coffeekit1": "2026-07-02",
  "daily-outline": "2026-05-13",
  "db-stumbler-blue": "2026-08-26",
  "dronecamp": "2026-07-02",
  "ebutuoy": "2026-05-13",
  "edmia": "2026-05-13",
  "envelope": "2026-05-13",
  "equivalence-engine": "2026-09-06",
  "field-twin": "2026-09-10",
  "frontend": "2026-05-13",
  "ghost-kitchen-builder": "2026-05-13",
  "graceland-diagram": "2026-05-13",
  "gridmark": "2026-05-13",
  "groundcore": "2026-05-13",
  "hackercons": "2026-07-02",
  "infinicanvan": "2026-09-06",
  "infinite-centerpoint": "2026-09-02",
  "invoice-green": "2026-08-01",
  "irrigation-station": "2026-08-01",
  "j30p4rdy": "2026-08-01",
  "kvs": "2026-05-13",
  "legends": "2026-05-13",
  "looper": "2026-05-13",
  "mary-jane-man": "2026-09-02",
  "ming-globe": "2026-05-13",
  "mission-operator": "2026-05-13",
  "offset-listener": "2026-09-05",
  "open-pipeline": "2026-07-02",
  "parkingten": "2026-09-05",
  "rat-site": "2026-09-08",
  "rat30-deck": "2026-08-01",
  "red-spoor": "2026-08-01",
  "repofind": "2026-08-26",
  "restack": "2026-05-13",
  "rogue-rail": "2026-07-02",
  "rtss": "2026-05-13",
  "screensaver-musicfx": "2026-07-02",
  "shitty-ass-news": "2026-09-07",
  "shitty-ass-trading": "2026-09-05",
  "skwiggle": "2026-09-07",
  "spaceout": "2026-05-13",
  "spectral-engin": "2026-09-03",
  "spirits-atlas": "2026-05-13",
  "stumbler": "2026-09-07",
  "suno-forge": "2026-05-13",
  "swh-sumbler": "2026-08-01",
  "tanksandzombies": "2026-07-02",
  "termbeat": "2026-08-01",
  "tile-spinner": "2026-05-13",
  "torque-converter": "2026-08-01",
  "tower-builder": "2026-09-02",
  "tower-builder-one": "2026-09-02",
  "tractor-tool": "2026-08-01",
  "tunnelfx": "2026-07-02",
  "welcome-to-the-madness": "2026-08-01"
};

const links = document.querySelectorAll('#category-view a, #alpha-view a');
const now = Date.now();
links.forEach(a => {
  const name = a.textContent.trim();
  const base = baseDates[name];
  if (!base) return;
  const d = Math.floor((now - new Date(base).getTime()) / 86400000);
  let c = '#888888';
  if (d < 7) c = '#00ff00';
  else if (d < 30) c = '#ffff00';
  else if (d < 60) c = '#ffa500';
  else if (d < 90) c = '#ff4444';
  a.style.color = c;
});

function stumble() {
  const links = document.querySelectorAll('#category-view a');
  const pick = links[Math.floor(Math.random() * links.length)];
  window.location.href = pick.href;
}

fetch('/api/ratings').then(r => r.json()).then(ratings => {
  document.querySelectorAll('#category-view a, #alpha-view a').forEach(a => {
    const name = a.textContent.trim();
    const count = ratings[name] || 0;
    const btn = document.createElement('button');
    btn.textContent = '+1 (' + count + ')';
    btn.style.marginLeft = '10px';
    btn.style.background = 'black';
    btn.style.color = '#00ffff';
    btn.style.border = '1px solid #00ffff';
    btn.style.fontFamily = 'monospace';
    btn.style.fontSize = '11px';
    btn.onclick = () => {
      fetch('/api/rate?name=' + name, { method: 'POST' }).then(r => r.json()).then(d => {
        btn.textContent = '+1 (' + d.votes + ')';
      });
    };
    a.parentNode.appendChild(btn);
  });
});

function showView(view) {
  document.getElementById('alpha-view').classList.add('hidden');
  document.getElementById('category-view').classList.add('hidden');
  document.getElementById(view + '-view').classList.remove('hidden');
  document.getElementById('menu').classList.remove('open');
}
function toggleInfo() {
  document.getElementById('info-box').classList.toggle('hidden');
  document.getElementById('menu').classList.remove('open');
}

document.querySelectorAll('#category-view a, #alpha-view a').forEach(a => {
  const name = a.textContent.trim();
  const toggle = document.createElement('span');
  toggle.textContent = ' \u25be';
  toggle.style.cursor = 'pointer';
  toggle.style.color = '#00ffff';
  a.parentNode.appendChild(toggle);

  const box = document.createElement('textarea');
  box.style.display = 'none';
  box.style.width = '90%';
  box.style.background = 'black';
  box.style.color = '#00ff00';
  box.style.border = '1px solid #00ff00';
  box.style.fontFamily = 'monospace';
  box.style.fontSize = '12px';
  box.rows = 2;
  box.value = localStorage.getItem('note:' + name) || '';
  box.addEventListener('input', () => {
    localStorage.setItem('note:' + name, box.value);
  });
  a.parentNode.parentNode.insertBefore(box, a.parentNode.nextSibling);

  toggle.addEventListener('click', () => {
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  });
});
