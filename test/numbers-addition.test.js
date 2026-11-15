const test = require('node:test');
const assert = require('node:assert/strict');
const {makeChallenge, checkAnswer} = require('../public/numbers/engine/addition.js');
const {TIERS} = require('../public/numbers/engine/levels.js');
const allowed = [['combine','fillTo'],['combine','fillTo'],['combine','bond','fillTo'],['twoDigit','bond','build'],['mental','bond','build'],['threeAddends','balance','ways']];
function seeded(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function bounds(value, max) {
  if (typeof value === 'number') assert.ok(Number.isSafeInteger(value) && value >= 0 && value <= max, `${value} outside 0..${max}`);
  else if (Array.isArray(value)) value.forEach(v => bounds(v, max));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key,v]) => { if (key !== 'tier') bounds(v, max); });
}
for (const tier of TIERS) for (const hintLevel of [0,1,2]) {
  test(`addition properties tier ${tier.id}, hint ${hintLevel}`, () => {
    const rng = seeded(1234), duplicate = seeded(1234), seen = new Set();
    let previous, bonds = 0, nonRound = 0, combines = 0, crossing = 0;
    for (let i = 0; i < 2000; i++) {
      const opts = {hintLevel, avoidType:previous};
      const c = makeChallenge(tier.id, rng, opts);
      assert.deepEqual(c, makeChallenge(tier.id, duplicate, opts));
      bounds(c, tier.maxNumber); assert.equal(c.tier, tier.id);
      assert.ok(allowed[tier.id].includes(c.type)); assert.notEqual(c.type, previous);
      previous = c.type; seen.add(c.type);
      assert.equal(checkAnswer(c, c.answer), true);
      for (const value of [c.answer - 1,c.answer + 1,...c.choices || [],String(c.answer),NaN,Infinity,null,undefined]) {
        if (value !== c.answer) assert.equal(checkAnswer(c, value), false);
      }
      if (c.choices) {
        assert.equal(c.choices.length, hintLevel ? 2 : 3);
        assert.equal(new Set(c.choices).size, c.choices.length); assert.ok(c.choices.includes(c.answer));
        assert.ok(c.choices.every(n => n >= (c.type === 'ways' ? 0 : 1)));
      } else assert.ok(['fillTo','build'].includes(c.type));
      if (['combine','twoDigit','mental','build'].includes(c.type)) assert.equal(c.a + c.b, c.answer);
      if (c.type === 'combine') {
        assert.ok(c.a >= (tier.id === 2 ? 2 : 1) && c.b >= (tier.id === 2 ? 2 : 1));
        assert.ok(c.answer >= (tier.id === 2 ? 11 : 2));
        combines++; if (c.a < 10 && c.b < 10 && c.answer > 10) crossing++;
      }
      if (c.type === 'fillTo') {
        assert.equal(c.start + c.answer, c.target); assert.ok(c.answer >= 1);
        assert.ok(c.start >= (tier.id === 2 ? 5 : 1) && c.start <= [3,8,15][tier.id]);
      }
      if (c.type === 'bond') {
        assert.equal(c.a + c.answer, c.target); assert.ok(c.answer >= 1); bonds++;
        if (tier.id === 2) assert.ok(c.target >= 10 && c.target <= 20);
        if (tier.id === 3) { assert.equal(c.target % 10, 0); assert.ok(c.a % 10 === 0 || c.target === Math.ceil(c.a / 10) * 10); }
        if (tier.id === 4) { assert.equal(c.target, 100); assert.ok(c.a >= 11 && c.a <= 95); if (c.a % 10) nonRound++; }
      }
      if (c.type === 'twoDigit') {
        assert.ok(c.a >= 10 && c.a <= 99); assert.ok(c.b >= 1);
        assert.ok(c.b <= 9 || (c.b >= 10 && c.b % 10 === 0)); assert.ok(c.answer <= 99);
      }
      if (c.type === 'mental') {
        assert.ok(c.a >= 11 && c.b >= 11); assert.ok(c.a % 10 + c.b % 10 >= 10);
      }
      if (c.type === 'build') {
        assert.equal(c.start, c.a); assert.ok(c.a >= 10 && c.a <= 89);
        assert.ok(c.b >= 2 && c.b <= 40); assert.ok(c.answer <= 99);
      }
      if (c.type === 'threeAddends') {
        assert.equal(c.a + c.b + c.c, c.answer); [c.a,c.b,c.c].forEach(n => assert.ok(n >= 2 && n <= 40));
      }
      if (c.type === 'balance') {
        assert.equal(c.a + c.b, c.c + c.answer); assert.ok(c.answer >= 1); assert.notEqual(c.c, c.a); assert.notEqual(c.c, c.b);
      }
      if (c.type === 'ways') {
        assert.ok(c.target >= 10 && c.target <= 100); assert.equal(c.pairs.length, c.choices.length);
        assert.deepEqual([...c.choices].sort(), c.pairs.map((_, i) => i));
        const matches = c.pairs.map(([x,y]) => x + y === c.target);
        assert.equal(matches.filter(Boolean).length, 1); assert.equal(matches[c.answer], true);
        c.pairs.forEach(([x,y]) => assert.ok([0,1,2,10].includes(Math.abs(x + y - c.target))));
      }
    }
    assert.deepEqual([...seen].sort(), [...allowed[tier.id]].sort());
    if (tier.id === 2) assert.ok(crossing >= combines / 2);
    if (tier.id === 4) assert.ok(nonRound >= bonds / 2);
  });
}
test('addition defaults and uniform type selection', () => {
  assert.equal(makeChallenge().tier, 0);
  for (const tier of TIERS) {
    const rng = seeded(9876), counts = Object.fromEntries(allowed[tier.id].map(type => [type,0]));
    for (let i = 0; i < 6000; i++) counts[makeChallenge(tier.id, rng).type]++;
    Object.values(counts).forEach(count => assert.ok(Math.abs(count - 6000 / allowed[tier.id].length) < 200));
    allowed[tier.id].forEach(avoidType => {
      for (let i = 0; i < 50; i++) assert.notEqual(makeChallenge(tier.id, rng, {avoidType}).type, avoidType);
    });
  }
});
