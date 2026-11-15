(function () {
  const {levels, store, adapt} = NumberLab;
  let state = store.load();
  const el = id => document.getElementById(id);
  let resetTimer, resetArmed = false;
  function render() {
    const tier = levels.tierById(state.startTier);
    el('difficultyPill').textContent = `${tier.icon} ${tier.label}`;
    document.querySelectorAll('[data-tier]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.tier) === state.startTier));
    el('floorLowest').setAttribute('aria-pressed', state.floorTier === 0);
    el('floorChosen').setAttribute('aria-pressed', state.floorTier === state.startTier && state.startTier > 0);
    el('progressRows').replaceChildren();
    levels.SKILLS.forEach(skill => {
      const row = document.createElement('div'); row.className = 'progress-row';
      const label = document.createElement('span'); label.textContent = `${skill.icon} ${skill.label}`;
      const current = document.createElement('span'); current.textContent = levels.tierById(state.skills[skill.key].tier).label;
      row.append(label, current); el('progressRows').appendChild(row);
    });
    syncGrownupBtn(state.grownup);
    el('grownupToggleBtn').setAttribute('aria-pressed', state.grownup);
  }
  function save() { state = store.save(state); render(); }
  levels.TIERS.forEach(tier => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'abtn ghost tier-button'; button.dataset.tier = tier.id;
    const label = document.createElement('span'); label.textContent = `${tier.icon} ${tier.label}`;
    const summary = document.createElement('small'); summary.textContent = tier.summary;
    button.append(label, summary);
    button.addEventListener('click', () => {
      state = store.setStartTier(state, tier.id); render(); showToast(`Difficulty set: ${tier.label}`);
    });
    el('tierButtons').appendChild(button);
  });
  function disarmReset() { clearTimeout(resetTimer); resetArmed = false; el('resetBtn').textContent = 'Reset progress'; }
  function closeAdmin() {
    disarmReset(); el('adminOverlay').classList.remove('show'); el('homeView').inert = false; el('adminBtn').focus();
  }
  el('adminBtn').addEventListener('click', () => {
    el('homeView').inert = true;
    openGate(() => { render(); el('adminOverlay').classList.add('show'); el('tierButtons').querySelector('[aria-pressed="true"]').focus(); }, {wrongClass:'gate-wrong'});
    el('gateButtons').querySelector('button').focus();
  });
  function cancelGate() { closeGate(); el('homeView').inert = false; el('adminBtn').focus(); }
  el('gateCancelBtn').addEventListener('click', cancelGate);
  el('gateOverlay').addEventListener('click', e => { if (e.target === el('gateOverlay')) cancelGate(); });
  el('closeAdminBtn').addEventListener('click', closeAdmin);
  el('adminOverlay').addEventListener('click', e => { if (e.target === el('adminOverlay')) closeAdmin(); });
  document.addEventListener('keydown', e => {
    const overlay = document.querySelector('.admin-overlay.show');
    if (!overlay) return;
    if (e.key === 'Escape') { closeGate(); closeAdmin(); }
    if (e.key === 'Tab') {
      const buttons = [...overlay.querySelectorAll('button')];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  el('floorLowest').addEventListener('click', () => { state.floorTier = 0; save(); });
  el('floorChosen').addEventListener('click', () => {
    state.floorTier = state.startTier;
    levels.SKILLS.forEach(({key}) => {
      if (state.skills[key].tier < state.floorTier) state.skills[key] = adapt.initialSkillState(state.floorTier);
    }); save();
  });
  el('resetBtn').addEventListener('click', () => {
    if (!resetArmed) {
      resetArmed = true; el('resetBtn').textContent = 'Tap again to reset'; resetTimer = setTimeout(disarmReset, 3000); return;
    }
    disarmReset(); state = store.setStartTier(state, state.startTier); render(); showToast('Progress reset');
  });
  el('grownupToggleBtn').addEventListener('click', () => {
    state.grownup = !state.grownup;
    try { localStorage.setItem('lab_dark', JSON.stringify(state.grownup)); } catch { /* Keep the in-memory theme. */ }
    save();
  });
  render();
})();
