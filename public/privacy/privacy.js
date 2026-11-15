try {
  const dark = JSON.parse(localStorage.getItem('lab_dark') || 'false');
  applyGrownup(dark);
} catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }
