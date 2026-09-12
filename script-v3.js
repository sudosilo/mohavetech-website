const baseDates = {
  "access-terminal": "2026-09-09",
  "access-terminal-admin": "2026-07-13",
  "access-terminal-orange": "2026-09-09",
  "access-terminal-red": "2026-09-09",
  "access-termonal-blue": "2026-09-09",
  "aerophin-twin": "2026-08-29",
  "androids": "2026-07-01",
  "ascend": "2026-09-10",
  "birdix": "2026-05-10",
  "birthday-calendar": "2026-09-02",
  "bitfield-synth": "2026-09-09",
  "cabin-viewer": "2026-09-11",
  "campus-ebutuoy": "2026-06-28",
  "chromatogram": "2026-08-16",
  "circuit-musicfx": "2026-09-11",
  "coffeekit1": "2026-06-23",
  "daily-outline": "2026-06-01",
  "db-stumbler-blue": "2026-08-06",
  "dronecamp": "2026-07-03",
  "ebutuoy": "2026-09-11",
  "edmia": "2026-05-21",
  "envelope": "2026-07-09",
  "equivalence-engine": "2026-09-07",
  "field-twin": "2026-09-10",
  "final-vector": "2026-09-10",
  "frontend": "2026-05-31",
  "ghost-kitchen-builder": "2026-05-22",
  "graceland-diagram": "2026-05-08",
  "gridmark": "2026-05-24",
  "groundcore": "2026-05-14",
  "hackercons": "2026-06-15",
  "infinicanvan": "2026-09-11",
  "infinite-centerpoint": "2026-09-02",
  "invoice-green": "2026-07-12",
  "irrigation-station": "2026-07-13",
  "j30p4rdy": "2026-07-26",
  "kvs": "2026-05-10",
  "legends": "2026-05-14",
  "looper": "2026-05-19",
  "mary-jane-man": "2026-09-02",
  "ming-globe": "2026-05-31",
  "mission-operator": "2026-05-19",
  "mohavetech-contracts": "2026-09-10",
  "offset-listener": "2026-09-05",
  "open-pipeline": "2026-07-02",
  "parkingten": "2026-09-05",
  "rat-site": "2026-09-09",
  "rat30-deck": "2026-07-20",
  "red-spoor": "2026-07-17",
  "repofind": "2026-08-19",
  "restack": "2026-05-19",
  "rogue-rail": "2026-09-11",
  "rtss": "2026-05-24",
  "screensaver-musicfx": "2026-06-21",
  "shitty-ass-trading": "2026-09-05",
  "skwiggle": "2026-09-07",
  "spaceout": "2026-05-09",
  "spectral-engin": "2026-09-03",
  "spirits-atlas": "2026-09-11",
  "stumbler": "2026-09-02",
  "suno-forge": "2026-05-19",
  "swh-sumbler": "2026-07-14",
  "tanksandzombies": "2026-07-03",
  "termbeat": "2026-07-21",
  "tile-spinner": "2026-09-11",
  "torque-converter": "2026-07-31",
  "tower-builder": "2026-09-02",
  "tower-builder-one": "2026-09-02",
  "tractor-tool": "2026-07-14",
  "tunnelfx": "2026-06-20",
  "welcome-to-the-madness": "2026-07-10"
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
  document.getElementById('stats-view').classList.add('hidden');
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

function showStats() {
  document.getElementById('alpha-view').classList.add('hidden');
  document.getElementById('category-view').classList.add('hidden');
  document.getElementById('stats-view').classList.remove('hidden');
  document.getElementById('menu').classList.remove('open');
  renderStats();
}

function renderStats() {
  const el = document.getElementById('stats-view');
  const now = Date.now();
  const entries = Object.entries(baseDates);
  const total = entries.length;

  const buckets = {};
  entries.forEach(([name, date]) => {
    const d = new Date(date);
    const weekLabel = d.getFullYear() + '-W' + String(Math.ceil((((d - new Date(d.getFullYear(),0,1)) / 86400000) + new Date(d.getFullYear(),0,1).getDay() + 1) / 7)).padStart(2, '0');
    buckets[weekLabel] = (buckets[weekLabel] || 0) + 1;
  });
  const sortedWeeks = Object.keys(buckets).sort();
  const maxCount = Math.max(...Object.values(buckets));

  let thisWeek = 0, lastWeek = 0;
  entries.forEach(([name, date]) => {
    const days = Math.floor((now - new Date(date).getTime()) / 86400000);
    if (days < 7) thisWeek++;
    else if (days < 14) lastWeek++;
  });

  const oldest = entries
    .map(([name, date]) => ({ name, days: Math.floor((now - new Date(date).getTime()) / 86400000) }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 5);

  let html = '<h2>Statistics</h2>';
  html += '<p>Total tracked deployments: ' + total + '</p>';
  html += '<p>Updated in the last 7 days: ' + thisWeek + '</p>';
  html += '<p>Updated the 7 days before that: ' + lastWeek + '</p>';
  html += '<p>' + (thisWeek >= lastWeek ? 'Up' : 'Down') + ' week over week by ' + Math.abs(thisWeek - lastWeek) + '</p>';

  html += '<h2>Deploy Timeline</h2>';
  sortedWeeks.forEach(w => {
    const count = buckets[w];
    const barWidth = Math.round((count / maxCount) * 200);
    html += '<div style="margin-bottom:4px">' + w + ' <span style="display:inline-block;background:#00ff00;height:10px;width:' + barWidth + 'px;vertical-align:middle"></span> ' + count + '</div>';
  });

  html += '<h2>Could Use Some Love</h2>';
  oldest.forEach(o => {
    html += '<p>' + o.name + ' - ' + o.days + ' days</p>';
  });

  html += '<h2>Favorite Project</h2>';
  html += '<p id="favorite-slot">loading...</p>';

  el.innerHTML = html;

  fetch('/api/ratings').then(r => r.json()).then(ratings => {
    let best = null, bestVotes = -1;
    for (const name in ratings) {
      if (ratings[name] > bestVotes) {
        best = name;
        bestVotes = ratings[name];
      }
    }
    document.getElementById('favorite-slot').textContent = best ? (best + ' with ' + bestVotes + ' votes') : 'no votes yet';
  }).catch(() => {
    document.getElementById('favorite-slot').textContent = 'ratings unavailable';
  });
}
