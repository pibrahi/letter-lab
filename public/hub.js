(function () {
  const data = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Letter Lab",
  "url": "https://letterlab.cc/",
  "description": "Word learning activities for kids aged 2\u20136.",
  "hasPart": [
    {
      "@type": "WebApplication",
      "name": "Letter Lab",
      "url": "https://letterlab.cc/letter-lab/"
    },
    {
      "@type": "WebApplication",
      "name": "Superhero Spelling Academy",
      "url": "https://letterlab.cc/spelling-academy/"
    },
    {
      "@type": "WebApplication",
      "name": "Word Safari",
      "url": "https://letterlab.cc/word-safari/"
    },
    {
      "@type": "WebApplication",
      "name": "Memory Match",
      "url": "https://letterlab.cc/memory-match/"
    },
    {
      "@type": "WebApplication",
      "name": "Puzzle Words",
      "url": "https://letterlab.cc/puzzle-words/"
    },
    {
      "@type": "WebApplication",
      "name": "NumberLab",
      "url": "https://letterlab.cc/numbers/"
    }
  ]
};
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
})();

let grownup = false;
try { grownup = JSON.parse(localStorage.getItem('lab_dark') || 'false'); } catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }

function applyDark() {
  applyGrownup(grownup);
  document.getElementById('darkLabel').textContent = grownup ? 'Light Mode' : 'Dark Mode';
  try {
    ['sa_v1','ws_v1','pw_v1','mm_v1','nl_v1'].forEach(key => {
      const s = JSON.parse(localStorage.getItem(key) || '{}');
      s.grownup = grownup;
      localStorage.setItem(key, JSON.stringify(s));
    });
    const ll = JSON.parse(localStorage.getItem('letterLabState3') || '{}');
    ll.grownup = grownup;
    localStorage.setItem('letterLabState3', JSON.stringify(ll));
    localStorage.setItem('lab_dark', JSON.stringify(grownup));
  } catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }
}

function loadStats() {
  try {
    const ll = JSON.parse(localStorage.getItem('letterLabState3') || '{}');
    const sa = JSON.parse(localStorage.getItem('sa_v1') || '{}');
    const ws = JSON.parse(localStorage.getItem('ws_v1') || '{}');
    const mm = JSON.parse(localStorage.getItem('mm_v1') || '{}');
    const pw = JSON.parse(localStorage.getItem('pw_v1') || '{}');
    document.getElementById('statLL').textContent = ll.stats?.won      ?? 0;
    document.getElementById('statSA').textContent = sa.wordsCorrect    ?? 0;
    document.getElementById('statWS').textContent = ws.correct         ?? 0;
    document.getElementById('statMM').textContent = mm.pairsFound      ?? 0;
    document.getElementById('statPW').textContent = pw.solved          ?? 0;
  } catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }
}

document.getElementById('darkToggle').addEventListener('click', () => { grownup = !grownup; applyDark(); });

applyDark();
loadStats();
