(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const {clampTier, tierById} = root.NumberLab?.levels || require('./levels.js');
  const types = [['combine','fillTo'], ['combine','fillTo'], ['combine','bond','fillTo'], ['twoDigit','bond','build'], ['mental','bond','build'], ['threeAddends','balance','ways']];
  // Builder mixes these addition facts (all within 20); avoidKind stops back-to-back repeats.
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
    const type = pick(types[tier].filter(t => t !== opts.avoidType));
    const c = {type, tier, answer:0};
    if (type === 'combine' && tier === 2) {
      Object.assign(c, builderCombine(int, pick, opts.avoidKind)); c.answer = c.a + c.b;
    } else if (type === 'combine') {
      const sum = int(tier === 2 ? 11 : 2, max);
      c.a = tier === 2 ? (sum <= 18 ? int(sum - 9, 9) : int(2, sum - 2)) : int(1, sum - 1);
      c.b = sum - c.a; c.answer = sum;
    } else if (type === 'fillTo') {
      c.start = int(tier === 2 ? 5 : 1, [3,8,15][tier]);
      c.target = int(c.start + 1, max); c.answer = c.target - c.start;
    } else if (type === 'bond') {
      if (tier === 2) { c.target = int(10, 20); c.a = int(1, c.target - 1); }
      else if (tier === 4) { c.target = 100; c.a = int(1, 9) * 10 + int(1, 5); }
      else if (int(0, 1)) { c.a = int(1, 9) * 10 + int(1, 9); c.target = Math.ceil(c.a / 10) * 10; }
      else { c.target = int(2, 10) * 10; c.a = int(1, c.target / 10 - 1) * 10; }
      c.answer = c.target - c.a;
    } else if (type === 'build') {
      c.a = c.start = int(10, 89); c.b = int(2, Math.min(40, 99 - c.a)); c.answer = c.a + c.b;
    } else if (type === 'twoDigit') {
      c.a = int(10, 89);
      c.b = int(0, 1) ? int(1, Math.min(9, 99 - c.a)) : int(1, Math.floor((99 - c.a) / 10)) * 10;
      c.answer = c.a + c.b;
    } else if (type === 'mental') {
      c.a = int(1, 7) * 10 + int(1, 9);
      // Select directly from valid regrouping partners, including boundary sums of 100.
      const partners = Array.from({length:90}, (_, i) => i + 11).filter(b => c.a + b <= 100 && c.a % 10 + b % 10 >= 10);
      c.b = pick(partners); c.answer = c.a + c.b;
    } else if (type === 'threeAddends') {
      c.a = int(2, 40); c.b = int(2, 40); c.c = int(2, Math.min(40, 100 - c.a - c.b)); c.answer = c.a + c.b + c.c;
    } else if (type === 'balance') {
      const sum = int(6, 100); c.a = int(1, sum - 1); c.b = sum - c.a;
      c.c = pick(Array.from({length:sum - 1}, (_, i) => i + 1).filter(n => n !== c.a && n !== c.b)); c.answer = sum - c.c;
    } else {
      c.target = int(10, 100);
      const count = opts.hintLevel >= 1 ? 2 : 3;
      const sums = [c.target, ...shuffle([-10,-2,-1,1,2,10]).map(d => c.target + d).filter(n => n >= 2 && n <= 100).slice(0, count - 1)];
      c.pairs = shuffle(sums.map(sum => { const x = int(1, sum - 1); return [x, sum - x]; }));
      c.answer = c.pairs.findIndex(([x,y]) => x + y === c.target);
      c.choices = shuffle(c.pairs.map((_, i) => i));
    }
    if (!c.choices && !['fillTo','build'].includes(type)) {
      const swapped = c.answer % 10 * 10 + Math.floor(c.answer / 10);
      const candidates = shuffle([...new Set([c.answer - 1,c.answer + 1,c.answer - 2,c.answer + 2,c.answer - 10,c.answer + 10,swapped])].filter(n => n >= 1 && n <= max && n !== c.answer));
      c.choices = shuffle([c.answer, ...candidates.slice(0, opts.hintLevel >= 1 ? 1 : 2)]);
    }
    return c;
  }
  function checkAnswer(challenge, value) { return Number.isSafeInteger(value) && value === challenge.answer; }
  const api = {makeChallenge, checkAnswer, BUILDER_KINDS};
  root.NumberLab = root.NumberLab || {}; root.NumberLab.addition = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
