(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const {clampTier} = root.NumberLab?.levels || require('./levels.js');
  function initialSkillState(tier) {
    return {tier:clampTier(tier), streak:0, recent:[], hintLevel:0, answered:0, correct:0};
  }
  function recordAnswer(state, correct, opts = {}) {
    const floor = clampTier(opts.floor);
    const next = {...state, tier:Math.max(floor, clampTier(state.tier)), recent:[...state.recent, !!correct].slice(-10),
      answered:state.answered + 1, correct:state.correct + (correct ? 1 : 0),
      streak:correct ? state.streak + 1 : 0, hintLevel:correct ? 0 : Math.min(2, state.hintLevel + 1)};
    let event = correct ? null : 'hint';
    if (correct && next.tier < 5 && (next.streak >= 5 || (next.recent.length >= 8 && next.recent.filter(Boolean).length >= 9))) {
      next.tier++; event = 'up';
    } else if (!correct && next.tier > floor && next.recent.slice(-5).filter(v => !v).length >= 3) {
      next.tier--; event = 'down';
    }
    if (event === 'up' || event === 'down') { next.streak = 0; next.recent = []; next.hintLevel = 0; }
    return {state:next, event};
  }
  function suggestStartTier(answers) {
    // A full pass needs at least two correct in the last three at a tier.
    // Start at Little; accept passed tiers in order only within one tier of
    // the last accepted pass. A gap never allows a jump over an unpassed tier.
    let result = 0;
    for (let tier = 0; tier <= 5; tier++) {
      const recent = answers.filter(a => a.tier === tier).slice(-3);
      if (recent.length === 3 && recent.filter(a => a.correct === true).length >= 2 && tier <= result + 1) result = tier;
    }
    return result;
  }
  const api = {initialSkillState, recordAnswer, suggestStartTier};
  root.NumberLab = root.NumberLab || {};
  root.NumberLab.adapt = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
