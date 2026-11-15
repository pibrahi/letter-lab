const test = require('node:test');
const assert = require('node:assert/strict');
const {makeChallenge, checkAnswer, dotPattern} = require('../public/numbers/engine/counting.js');
const {TIERS} = require('../public/numbers/engine/levels.js');
const allowed = [['fill','count'],['fill','count'],['count','fill','missing'],['build','tensCount','missing'],['skip','build','tensCount'],['regroup','toNextTen','pattern']];
function seeded(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function numbers(value) {
  if (typeof value === 'number') assert.ok(Number.isSafeInteger(value) && value >= 0);
  else if (Array.isArray(value)) value.forEach(numbers);
  else if (value && typeof value === 'object') Object.values(value).forEach(numbers);
}
for (const tier of TIERS) for (const hintLevel of [0,1,2]) {
  test(`counting properties tier ${tier.id}, hint ${hintLevel}`, () => {
    const rng = seeded(1234), duplicate = seeded(1234), seen = new Set(), blanks = new Set();
    let previous;
    for (let i = 0; i < 2000; i++) {
      const opts = {hintLevel, avoidType:previous};
      const c = makeChallenge(tier.id, rng, opts);
      assert.deepEqual(c, makeChallenge(tier.id, duplicate, opts));
      numbers(c); assert.ok(allowed[tier.id].includes(c.type));
      assert.notEqual(c.type, previous); previous = c.type; seen.add(c.type);
      assert.ok(c.answer <= tier.maxNumber);
      assert.equal(checkAnswer(c, c.answer), true);
      for (const wrong of [c.answer - 1, c.answer + 1, ...c.choices || []]) if (wrong !== c.answer) assert.equal(checkAnswer(c, wrong), false);
      assert.equal(checkAnswer(c, String(c.answer)), false);
      if (c.choices) {
        assert.equal(c.choices.length, hintLevel ? 2 : 3);
        assert.equal(new Set(c.choices).size, c.choices.length);
        assert.ok(c.choices.includes(c.answer));
        assert.ok(c.choices.every(n => n >= (c.type === 'count' || c.type === 'toNextTen' ? 1 : 0)));
        assert.ok(c.choices.every(n => n <= (c.type === 'toNextTen' ? 9 : tier.maxNumber)));
      } else assert.ok(['fill','build'].includes(c.type));
      if (c.type === 'count' || c.type === 'fill') {
        assert.ok(c.answer >= (tier.id === 2 ? 6 : 1));
        if (c.type === 'count') assert.equal(c.eggs, c.answer);
        else { assert.equal(c.target, c.answer); assert.ok(c.pile - c.target >= 2 && c.pile - c.target <= 4); }
      }
      if (c.type === 'build') { assert.equal(c.target, c.answer); assert.ok(c.target >= 11 && c.target <= 99); }
      if (c.sequence) {
        assert.equal(c.sequence.length, c.type === 'missing' ? 4 : 5);
        assert.ok(c.blankIndex < c.sequence.length); blanks.add(c.blankIndex);
        assert.equal(c.answer, c.sequence[c.blankIndex]);
        assert.ok(c.sequence.every(n => n <= tier.maxNumber && n >= (c.type === 'skip' ? 0 : 1)));
        c.sequence.slice(1).forEach((n, j) => assert.equal(n - c.sequence[j], c.step));
        if (c.type === 'skip') { assert.ok([2,5,10].includes(c.step)); assert.equal(c.sequence[0] % c.step, 0); }
        if (c.type === 'missing') assert.equal(c.step, 1);
        if (c.type === 'pattern') { assert.ok([3,4,5,6,7,8,9,11].includes(c.step)); assert.ok(c.sequence[0] <= 20); }
      }
      if (c.type === 'tensCount' || c.type === 'regroup') {
        const regroup = c.type === 'regroup';
        assert.ok(c.crates >= 1 && c.crates <= (regroup ? 8 : 9));
        assert.ok(c.loose >= (regroup ? 10 : 0) && c.loose <= (regroup ? 19 : 9));
        assert.equal(c.answer, c.crates * 10 + c.loose); assert.ok(c.answer >= 10 && c.answer <= 99);
      }
      if (c.type === 'toNextTen') {
        assert.ok(c.eggs >= 11 && c.eggs <= 99 && c.eggs % 10 !== 0);
        assert.ok(c.answer >= 1 && c.answer <= 9); assert.equal((c.eggs + c.answer) % 10, 0);
      }
    }
    assert.deepEqual([...seen].sort(), [...allowed[tier.id]].sort());
    if (tier.id >= 2) assert.ok(blanks.size >= 4);
  });
}
test('dot patterns are distinct bounded positions for one through ten', () => {
  for (let n = 1; n <= 10; n++) {
    const dots = dotPattern(n); assert.equal(dots.length, n);
    assert.equal(new Set(dots.map(p => p.join(','))).size, n);
    dots.forEach(p => { assert.equal(p.length, 2); p.forEach(v => assert.ok(v >= 0 && v <= 1)); });
  }
});
