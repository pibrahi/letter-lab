(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const {clampTier, tierById} = root.NumberLab?.levels || require('./levels.js');
  const types = [['add'], ['add'], ['add','missing'], ['add','missing'], ['add','missing'], ['add','missing']];
  const BUILDER_KINDS = ['withinTen','crossTen','teenPlus','doubles','plusTen'];
  function builderCombine(int, pick, avoidKind) {
    const kind = pick(BUILDER_KINDS.filter(k => k !== avoidKind));
    let a, b;
    if (kind === 'withinTen') { const sum = int(4, 10); a = int(1, sum - 1); b = sum - a; }
    else if (kind === 'crossTen') { const sum = int(11, 18); a = int(sum - 9, 9); b = sum - a; }
    else if (kind === 'teenPlus') { a = int(11, 18); b = int(1, 19 - a); }
    else if (kind === 'doubles') { a = int(2, 10); b = a < 10 ? a + int(0, 1) : a; }
    else { a = int(1, 9); b = 10; }
    if (kind !== 'crossTen' && kind !== 'withinTen' && int(0, 1)) [a, b] = [b, a];
    return {kind, a, b};
  }
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
    if (type === 'missing') {
      if (tier === 2) { c.total = int(10, 20); c.a = int(1, c.total - 1); }
      else if (tier === 3) { c.a = int(1, 9) * 10 + int(1, 9); c.total = Math.ceil(c.a / 10) * 10; }
      else if (tier === 4) { c.total = 100; c.a = int(10, 99); }
      else { c.a = int(1, 9) * 10 + int(1, 8); c.total = int(c.a + 1, 100); }
      c.answer = c.total - c.a;
    } else {
      if (tier === 2) Object.assign(c, builderCombine(int, pick, opts.avoidKind));
      else if (tier <= 1) { const sum = int(2, max); c.a = int(1, sum - 1); c.b = sum - c.a; }
      else if (tier === 3) { c.a = int(10, 98); c.b = int(1, Math.min(9, 99 - c.a)); }
      else if (tier === 4) { c.a = int(10, 90); c.b = int(10, 100 - c.a); }
      else {
        c.a = int(1, 7) * 10 + int(1, 9);
        c.b = pick(Array.from({length:90}, (_, i) => i + 10).filter(b => c.a + b <= 100 && c.a % 10 + b % 10 >= 10));
      }
      c.answer = c.a + c.b;
    }
    if (!c.choices) {
      const min = 1;
      const swapped = c.answer % 10 * 10 + Math.floor(c.answer / 10);
      const candidates = shuffle([...new Set([c.answer - 1, c.answer + 1, c.answer - 2, c.answer + 2, c.answer - 10, c.answer + 10, swapped])].filter(n => n >= min && n <= max && n !== c.answer));
      c.choices = shuffle([c.answer, ...candidates.slice(0, opts.hintLevel >= 1 ? 1 : 2)]);
    }
    return c;
  }
  function checkAnswer(challenge, value) { return Number.isSafeInteger(value) && value === challenge.answer; }
  const api = {makeChallenge, checkAnswer, BUILDER_KINDS};
  root.NumberLab = root.NumberLab || {}; root.NumberLab.addition = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
