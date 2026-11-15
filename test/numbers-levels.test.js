const test = require('node:test');
const assert = require('node:assert/strict');
const {TIERS, SKILLS, paramsFor, tierById, clampTier} = require('../public/numbers/engine/levels.js');
test('NumberLab tiers and all skill parameters are ordered and monotone', () => {
  assert.deepEqual(TIERS.map(t => t.id), [0,1,2,3,4,5]);
  assert.deepEqual(TIERS.map(t => t.key), ['little','explorer','builder','inventor','master','genius']);
  assert.equal(new Set(TIERS.map(t => t.key)).size, 6);
  assert.ok(TIERS[0].maxNumber <= 10);
  for (const skill of SKILLS) {
    let previous = {};
    TIERS.forEach(t => {
      const params = paramsFor(skill.key, t.id);
      assert.ok(Object.keys(params).length);
      for (const [key, value] of Object.entries({...params, maxNumber:t.maxNumber})) {
        if (key.startsWith('max')) assert.ok(value >= (previous[key] || 0));
      }
      previous = {...params, maxNumber:t.maxNumber};
    });
  }
});
test('NumberLab rejects skills, clamps tiers and returns independent parameters', () => {
  assert.throws(() => paramsFor('unknown', 0), RangeError);
  for (const value of [NaN, Infinity, undefined, null, '3', {}, -20]) assert.equal(clampTier(value), 0);
  assert.equal(clampTier(99), 5); assert.equal(clampTier(2.9), 2);
  assert.equal(tierById(99), TIERS[5]);
  assert.deepEqual(paramsFor('counting', -1), paramsFor('counting', 0));
  assert.deepEqual(paramsFor('counting', 99), paramsFor('counting', 5));
  paramsFor('counting', 0).skipBy.push(99);
  assert.deepEqual(paramsFor('counting', 0).skipBy, [1]);
});
