(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const {clampTier, tierById} = root.NumberLab?.levels || require('./levels.js');
  const types = [['fill','count'], ['fill','count'], ['count','fill','missing'], ['build','tensCount','missing'], ['skip','build','tensCount'], ['regroup','toNextTen','pattern']];
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
    const type = pick(types[tier].filter(t => t !== opts.avoidType));
    const c = {type, tier, answer:0};
    if (type === 'fill' || type === 'count') {
      c.answer = int(tier === 2 ? 6 : 1, tierById(tier).maxNumber);
      if (type === 'fill') { c.target = c.answer; c.pile = c.answer + int(2, 4); }
      else c.eggs = c.answer;
    } else if (type === 'build') {
      c.target = c.answer = int(11, 99);
    } else if (type === 'tensCount' || type === 'regroup') {
      c.crates = int(1, type === 'regroup' ? 8 : 9);
      c.loose = type === 'regroup' ? int(10, 19) : int(0, 9);
      c.answer = c.crates * 10 + c.loose;
    } else if (type === 'toNextTen') {
      c.eggs = int(1, 9) * 10 + int(1, 9); c.answer = 10 - c.eggs % 10;
    } else {
      const length = type === 'missing' ? 4 : 5;
      c.step = type === 'skip' ? pick([2,5,10]) : type === 'pattern' ? pick([3,4,5,6,7,8,9,11]) : 1;
      const maxStart = tierById(tier).maxNumber - (length - 1) * c.step;
      const start = type === 'skip' ? int(0, Math.floor(maxStart / c.step)) * c.step : int(1, Math.min(type === 'pattern' ? 20 : maxStart, maxStart));
      c.sequence = Array.from({length}, (_, i) => start + i * c.step);
      c.blankIndex = int(0, length - 1); c.answer = c.sequence[c.blankIndex];
    }
    if (type !== 'fill' && type !== 'build') {
      // Keep distractors inside what the tier can show (G mode never sees 15).
      const min = type === 'count' || type === 'toNextTen' ? 1 : 0;
      const max = type === 'toNextTen' ? 9 : Math.min(tierById(tier).maxNumber, type === 'tensCount' || type === 'regroup' ? 99 : 100);
      const offsets = shuffle([1,-1,c.step || 10,-(c.step || 10),10,-10,2,-2]);
      const candidates = [...new Set(offsets.map(d => c.answer + d).filter(n => n >= min && n <= max && n !== c.answer))];
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
