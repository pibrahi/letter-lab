const test = require('node:test');
const assert = require('node:assert/strict');
const {makeChallenge, checkAnswer} = require('../public/numbers/engine/addition.js');
const {TIERS} = require('../public/numbers/engine/levels.js');
function seeded(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
const allowed = [['add'],['add'],['add','missing'],['add','missing'],['add','missing'],['add','missing']];
// Each Builder fact kind has its defining shape, always within 20.
function builderKind(c) {
  const [hi, lo] = c.a >= c.b ? [c.a, c.b] : [c.b, c.a];
  assert.ok(c.answer <= 20);
  if (c.kind === 'withinTen') assert.ok(c.answer >= 4 && c.answer <= 10);
  else if (c.kind === 'crossTen') assert.ok(c.a <= 9 && c.b <= 9 && c.answer >= 11);
  else if (c.kind === 'teenPlus') assert.ok(hi >= 11 && lo >= 1 && lo <= 9 && hi % 10 + lo <= 9);
  else if (c.kind === 'doubles') assert.ok(hi - lo <= 1 && lo >= 2);
  else if (c.kind === 'plusTen') assert.ok(hi === 10 && lo >= 1 && lo <= 9);
  else assert.fail(`unknown Builder kind ${c.kind}`);
}
test('Builder addition mixes every fact kind without back-to-back repeats', () => {
  const {BUILDER_KINDS} = require('../public/numbers/engine/addition.js');
  for (const seed of [11, 222, 3333, 44444]) {
    const rng = seeded(seed), counts = Object.fromEntries(BUILDER_KINDS.map(k => [k, 0]));
    let previousKind, total = 0;
    for (let i = 0; i < 4000; i++) {
      const c = makeChallenge(2, rng, {avoidType:'missing', avoidKind:previousKind});
      if (c.type !== 'add') continue;
      builderKind(c); assert.notEqual(c.kind, previousKind);
      counts[c.kind]++; total++; previousKind = c.kind;
    }
    Object.entries(counts).forEach(([kind, n]) => assert.ok(n / total > 0.12 && n / total < 0.28, `${kind} ${n}/${total}`));
  }
});
for (const tier of TIERS) for (const hintLevel of [0,1,2]) {
  test(`addition properties tier ${tier.id}, hint ${hintLevel}`, () => {
    const rng = seeded(1234), duplicate = seeded(1234), seen = new Set();
    let previous, previousKind;
    for (let i = 0; i < 2000; i++) {
      const opts = {hintLevel, avoidType:previous, avoidKind:previousKind};
      const c = makeChallenge(tier.id, rng, opts);
      assert.deepEqual(c, makeChallenge(tier.id, duplicate, opts));
      assert.equal(c.tier, tier.id); assert.ok(allowed[tier.id].includes(c.type));
      if (allowed[tier.id].length > 1) assert.notEqual(c.type, previous);
      previous = c.type; seen.add(c.type);
      assert.equal(c.choices.length, c.type === 'more' || hintLevel ? 2 : 3);
      assert.equal(new Set(c.choices).size, c.choices.length); assert.ok(c.choices.includes(c.answer));
      const shown = [c.answer, ...c.choices, ...c.sequence || [], ...['count','left','right','a','b','total'].filter(k => c[k] !== undefined).map(k => c[k])];
      shown.forEach(n => assert.ok(Number.isSafeInteger(n) && n >= 0 && n <= tier.maxNumber, `${n} outside tier`));
      c.choices.forEach(n => assert.ok(n >= (c.sequence?.includes(0) ? 0 : 1)));
      assert.equal(checkAnswer(c, c.answer), true);
      for (const v of [...c.choices, c.answer - 1, c.answer + 1, String(c.answer), NaN, Infinity, null, undefined]) {
        if (v !== c.answer) assert.equal(checkAnswer(c, v), false);
      }
      if (c.type === 'add') {
        assert.equal(c.a + c.b, c.answer); assert.ok(c.a >= 1 && c.b >= 1);
        if (tier.id === 2) { builderKind(c); assert.notEqual(c.kind, previousKind); previousKind = c.kind; }
        if (tier.id === 3) assert.ok(c.a >= 10 && c.b <= 9 && c.answer <= 99);
        if (tier.id >= 4) assert.ok(c.a >= 10 && c.b >= 10);
        if (tier.id === 5) assert.ok(c.a % 10 + c.b % 10 >= 10);
      } else {
        assert.equal(c.a + c.answer, c.total); assert.ok(c.answer >= 1);
        if (tier.id === 2) assert.ok(c.total >= 10 && c.total <= 20);
        if (tier.id === 3) { assert.equal(c.total, Math.ceil(c.a / 10) * 10); assert.notEqual(c.a % 10, 0); }
        if (tier.id === 4) assert.equal(c.total, 100);
        if (tier.id === 5) assert.notEqual(c.a % 10, 0);
      }
    }
    assert.deepEqual([...seen].sort(), [...allowed[tier.id]].sort());
  });
}
