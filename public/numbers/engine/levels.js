(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const TIERS = [
    {id:0, key:'little', label:'Little', icon:'🌱', maxNumber:5, summary:'Picture-based counting and comparing up to 5.'},
    {id:1, key:'explorer', label:'Explorer', icon:'🧭', maxNumber:10, summary:'Numbers to 10, adding and taking away.'},
    {id:2, key:'builder', label:'Builder', icon:'🧱', maxNumber:20, summary:'Number bonds and missing numbers to 20.'},
    {id:3, key:'inventor', label:'Inventor', icon:'💡', maxNumber:100, summary:'Two-digit numbers and place value.'},
    {id:4, key:'master', label:'Master', icon:'⭐', maxNumber:100, summary:'Mental maths, groups and patterns.'},
    {id:5, key:'genius', label:'Genius Lab', icon:'🧪', maxNumber:100, summary:'Multi-step puzzles, logic and early fractions.'},
  ];
  const SKILLS = [
    {key:'counting', label:'Counting', slug:'dino-egg-rescue', icon:'🦕'},
    {key:'addition', label:'Addition', slug:'rocket-fuel', icon:'🚀'},
    {key:'subtraction', label:'Subtraction', slug:'monster-munch', icon:'👾'},
    {key:'sequencing', label:'Sequencing', slug:'number-train', icon:'🚂'},
    {key:'comparing', label:'Comparing', slug:'who-has-more', icon:'⚖️'},
  ];
  function clampTier(tier) { return Number.isFinite(tier) ? Math.max(0, Math.min(5, Math.trunc(tier))) : 0; }
  function tierById(tier) { return TIERS[clampTier(tier)]; }
  const params = {};
  TIERS.forEach(({id, maxNumber}) => {
    params[id] = {
      counting: {min:1, max:maxNumber, skipBy:id >= 4 ? [2,5,10] : [1], tensGrouping:id >= 3, missingNumber:id >= 2},
      addition: {maxSum:maxNumber, operands:id >= 5 ? 3 : 2, missing:id >= 2, twoDigit:id >= 3},
      subtraction: {maxStart:maxNumber, missing:id >= 2, multiStep:id >= 5},
      sequencing: {max:maxNumber, steps:id >= 4 ? [1,2,5,10] : [1], backward:id >= 1, oddEven:id >= 2, multiplesPattern:id >= 4},
      comparing: {max:maxNumber, mode:['more','fewer','equal'], differences:id >= 2, balance:id >= 3, fractions:id >= 5 ? ['half','quarter'] : []},
    };
  });
  function paramsFor(skill, tier) {
    if (!SKILLS.some(s => s.key === skill)) throw new RangeError('Unknown skill');
    // Return fresh data so a game cannot alter another game's settings.
    return JSON.parse(JSON.stringify(params[clampTier(tier)][skill]));
  }
  const api = {TIERS, SKILLS, paramsFor, tierById, clampTier};
  root.NumberLab = root.NumberLab || {};
  root.NumberLab.levels = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
