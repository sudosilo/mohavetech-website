const statusEl = document.createElement('div');
statusEl.id = 'fetch-status';
statusEl.style.color = '#888888';
statusEl.style.fontSize = '12px';
statusEl.style.marginBottom = '10px';
document.body.insertBefore(statusEl, document.body.firstChild);

fetch('/api/projects').then(r => r.json()).then(data => {
  if (data && data.error) {
    statusEl.textContent = 'error ' + data.status + ': ' + data.body;
    return;
  }
  if (!Array.isArray(data) || data.length === 0) {
    statusEl.textContent = 'live data unavailable, colors are from last manual update';
    return;
  }
  const links = document.querySelectorAll('#category-view a, #alpha-view a');
  links.forEach(a => {
    const name = a.textContent.trim();
    const match = data.find(p => p.name === name);
    if (!match) return;
    const d = match.ageDays;
    let c = '#888888';
    if (d < 7) c = '#00ff00';
    else if (d < 30) c = '#ffff00';
    else if (d < 60) c = '#ffa500';
    else if (d < 90) c = '#ff4444';
    a.style.color = c;
  });
  statusEl.textContent = 'live data loaded';
}).catch(e => {
  statusEl.textContent = 'live data fetch failed: ' + e;
});
