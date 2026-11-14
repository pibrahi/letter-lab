try {
  const dark = JSON.parse(localStorage.getItem('lab_dark') || 'false');
  applyGrownup(dark);
} catch(e) {}
