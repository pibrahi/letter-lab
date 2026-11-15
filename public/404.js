try {
  applyGrownup(JSON.parse(localStorage.getItem('lab_dark') || 'false'));
} catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }
