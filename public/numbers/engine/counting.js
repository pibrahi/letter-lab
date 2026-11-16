(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const {clampTier, tierById} = root.NumberLab?.levels || require('./levels.js');
  const types = [['count','more'], ['count','more'], ['count','more','missing'], ['missing','more'], ['missing','more'], ['missing','more']];
  function makeChallenge(tier, rng = Math.random, opts = {}) {
    tier = clampTier(tier);
    const int = (min, max) => min + Math.floor(rng() * (max - min + 1));
    const pick = list => list[int(0, list.length - 1)];
    const shuffle = list => {
      for (let i = list.length - 1; i > 0; i--) {
        const j = int(0, i); [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    };
    const max = tierById(tier).maxNumber;
    const available = types[tier].filter(t => t !== opts.avoidType);
    const type = pick(available.length ? available : types[tier]);
    const c = {type, tier, answer:0};
    if (type === 'count') {
      c.count = c.answer = int(tier === 2 ? 6 : 1, max);
    } else if (type === 'more') {
      const min = [1,1,2,10,10,10][tier];
      c.left = int(min, tier === 5 ? 99 : max);
      let candidates = Array.from({length:max - min + 1}, (_, i) => i + min).filter(n => n !== c.left);
      if (tier === 4) candidates = candidates.filter(n => Math.abs(n - c.left) <= 10);
      if (tier === 5) {
        const swapped = c.left % 10 * 10 + Math.floor(c.left / 10);
        candidates = candidates.filter(n => n <= 99 && (Math.abs(n - c.left) <= 3 || n === swapped) && n !== c.left);
      }
      c.right = pick(candidates); c.answer = Math.max(c.left, c.right);
      c.choices = [c.left, c.right];
    } else {
      c.step = tier <= 3 ? 1 : tier === 4 ? pick([2,5,10]) : pick([3,4,5,6,7,8,9,-1,-2,-5,-10]);
      const span = Math.abs(c.step) * 3;
      const min = tier <= 3 ? 1 : 0;
      const start = tier === 4 ? int(0, Math.floor((max - span) / c.step)) * c.step : int(min, max - span);
      c.sequence = Array.from({length:4}, (_, i) => start + (c.step < 0 ? span : 0) + i * c.step);
      c.blankIndex = int(0, 3); c.answer = c.sequence[c.blankIndex];
    }
    if (!c.choices) {
      const min = c.sequence && c.sequence.includes(0) ? 0 : 1;
      const swapped = c.answer % 10 * 10 + Math.floor(c.answer / 10);
      const candidates = shuffle([...new Set([c.answer - 1, c.answer + 1, c.answer - 2, c.answer + 2, c.answer - 10, c.answer + 10, swapped])].filter(n => n >= min && n <= max && n !== c.answer));
      c.choices = shuffle([c.answer, ...candidates.slice(0, opts.hintLevel >= 1 ? 1 : 2)]);
    }
    return c;
  }
  function checkAnswer(challenge, value) { return Number.isSafeInteger(value) && value === challenge.answer; }
  function dotPattern(n) {
    if (!Number.isInteger(n) || n < 1 || n > 10) return [];
    // Ten-frame rows of five, each row centred; a single row sits in the middle.
    return Array.from({length:n}, (_, i) => {
      const inRow = i < 5 ? Math.min(n, 5) : n - 5;
      return [0.5 + ((i % 5) - (inRow - 1) / 2) * 0.2, n <= 5 ? 0.5 : i < 5 ? 0.25 : 0.75];
    });
  }
  const api = {makeChallenge, checkAnswer, dotPattern};
  root.NumberLab = root.NumberLab || {}; root.NumberLab.counting = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
