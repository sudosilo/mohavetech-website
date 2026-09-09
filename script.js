fetch('/api/projects').then(r => r.json()).then(data => {
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
});
