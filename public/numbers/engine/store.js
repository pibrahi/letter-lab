(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const {SKILLS, clampTier} = root.NumberLab?.levels || require('./levels.js');
  const {initialSkillState} = root.NumberLab?.adapt || require('./adapt.js');
  let memory;
  function defaults() { return {version:1, startTier:0, floorTier:0, skills:Object.fromEntries(SKILLS.map(s => [s.key, initialSkillState(0)])), grownup:false}; }
  function repair(value) {
    const state = defaults();
    if (!value || value.version !== 1) return state;
    state.startTier = clampTier(value.startTier);
    state.floorTier = Math.min(state.startTier, clampTier(value.floorTier));
    state.grownup = value.grownup === true;
    SKILLS.forEach(({key}) => {
      const saved = value.skills?.[key];
      const s = saved && typeof saved.tier === 'string' ? {...saved, tier:clampTier(saved.tier)} : saved;
      const validCount = n => Number.isSafeInteger(n) && n >= 0;
      state.skills[key] = s && Number.isInteger(s.tier) && s.tier >= state.floorTier && s.tier <= 5 &&
        validCount(s.streak) && validCount(s.answered) && validCount(s.correct) && s.correct <= s.answered && s.streak <= s.correct &&
        [0,1,2].includes(s.hintLevel) && Array.isArray(s.recent) && s.recent.length <= 10 && s.recent.length <= s.answered && s.recent.every(v => typeof v === 'boolean')
        ? {tier:s.tier, streak:s.streak, recent:[...s.recent], hintLevel:s.hintLevel, answered:s.answered, correct:s.correct} : initialSkillState(state.startTier);
    });
    return state;
  }
  function load() {
    let state;
    try { state = repair(JSON.parse(root.localStorage.getItem('nl_v1'))); }
    catch { state = repair(memory); }
    try {
      const dark = JSON.parse(root.localStorage.getItem('lab_dark'));
      if (typeof dark === 'boolean') state.grownup = dark;
    } catch { /* Keep the saved theme when storage is unavailable. */ }
    return state;
  }
  function save(state) {
    memory = repair(state);
    try { root.localStorage.setItem('nl_v1', JSON.stringify(memory)); } catch { /* Keep the in-memory record. */ }
    return repair(memory);
  }
  function setStartTier(state, tier) {
    const next = repair(state);
    const locked = next.floorTier > 0;
    next.startTier = clampTier(tier);
    next.floorTier = locked ? next.startTier : 0;
    next.skills = Object.fromEntries(SKILLS.map(s => [s.key, initialSkillState(next.startTier)]));
    return save(next);
  }
  function reset() { return save(defaults()); }
  const api = {load, save, setStartTier, reset};
  root.NumberLab = root.NumberLab || {};
  root.NumberLab.store = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
