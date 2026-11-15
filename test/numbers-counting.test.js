const test = require('node:test');
const assert = require('node:assert/strict');
const {makeChallenge, checkAnswer, dotPattern} = require('../public/numbers/engine/counting.js');
const {TIERS} = require('../public/numbers/engine/levels.js');
function seeded(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
const allowed = [['count','more'],['count','more'],['count','more','missing'],['missing','more'],['missing','more'],['missing','more']];
for (const tier of TIERS) for (const hintLevel of [0,1,2]) {
  test(`counting properties tier ${tier.id}, hint ${hintLevel}`, () => {
    const rng = seeded(1234), duplicate = seeded(1234), seen = new Set();
    let previous;
    for (let i = 0; i < 2000; i++) {
      const opts = {hintLevel, avoidType:previous};
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
      if (c.type === 'count') {
        assert.equal(c.count, c.answer); assert.ok(c.count >= (tier.id === 2 ? 6 : 1));
      } else if (c.type === 'more') {
        assert.notEqual(c.left, c.right); assert.equal(c.answer, Math.max(c.left, c.right));
        assert.deepEqual(c.choices, [c.left,c.right]);
        const min = [1,1,2,10,10,10][tier.id]; assert.ok(c.left >= min && c.right >= min);
        if (tier.id === 4) assert.ok(Math.abs(c.left - c.right) <= 10);
        if (tier.id === 5) {
          assert.ok(c.left <= 99 && c.right <= 99);
          assert.ok(Math.abs(c.left - c.right) <= 3 || c.right === c.left % 10 * 10 + Math.floor(c.left / 10));
        }
      } else {
        assert.equal(c.sequence.length, 4); assert.ok(c.blankIndex >= 0 && c.blankIndex < 4);
        assert.equal(c.answer, c.sequence[c.blankIndex]);
        c.sequence.slice(1).forEach((n, j) => assert.equal(n - c.sequence[j], c.step));
        if (tier.id <= 3) { assert.equal(c.step, 1); assert.ok(c.sequence[0] >= 1); }
        if (tier.id === 4) { assert.ok([2,5,10].includes(c.step)); assert.equal(c.sequence[0] % c.step, 0); }
        if (tier.id === 5) assert.ok([3,4,5,6,7,8,9,-1,-2,-5,-10].includes(c.step));
      }
    }
    assert.deepEqual([...seen].sort(), [...allowed[tier.id]].sort());
  });
}
test('dot patterns are distinct bounded positions for one through ten', () => {
  for (let n = 1; n <= 10; n++) {
    const dots = dotPattern(n); assert.equal(dots.length, n);
    assert.equal(new Set(dots.map(p => p.join(','))).size, n);
    dots.forEach(p => { assert.equal(p.length, 2); p.forEach(v => assert.ok(v >= 0 && v <= 1)); });
  }
});
