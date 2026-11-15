const test = require('node:test');
const assert = require('node:assert/strict');
const {initialSkillState, recordAnswer, suggestStartTier} = require('../public/numbers/engine/adapt.js');
test('NumberLab five correct advance and three wrong descend or provide hints', () => {
  for (let tier = 0; tier < 6; tier++) {
    let state = initialSkillState(tier), result;
    for (let i = 0; i < 5; i++) { result = recordAnswer(state, true); state = result.state; }
    assert.equal(state.tier, Math.min(5, tier + 1));
    assert.equal(result.event, tier < 5 ? 'up' : null);
    state = initialSkillState(tier);
    for (let i = 0; i < 3; i++) { result = recordAnswer(state, false); state = result.state; }
    assert.equal(state.tier, Math.max(0, tier - 1));
    assert.equal(result.event, tier > 0 ? 'down' : 'hint');
    assert.equal(recordAnswer(state, true).state.hintLevel, 0);
    state = initialSkillState(tier);
    for (let i = 0; i < 3; i++) state = recordAnswer(state, false, {floor:tier}).state;
    assert.equal(state.tier, tier); assert.equal(state.hintLevel, 2);
  }
  let state = initialSkillState(2);
  for (const answer of [false,true,false,true,false]) state = recordAnswer(state, answer).state;
  assert.equal(state.tier, 1); assert.deepEqual(state.recent, []);
  const result = recordAnswer({...initialSkillState(2), answered:9, correct:8, recent:[true,true,true,false,true,true,true,true,true], streak:4}, true);
  assert.equal(result.event, 'up'); assert.equal(result.state.answered, 10);
});
test('NumberLab seeded sequences preserve bounds, immutability and hint limits', () => {
  let seed = 7723;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let run = 0; run < 1000; run++) {
    const floor = run % 6;
    let state = initialSkillState(floor);
    for (let i = 0; i < 100; i++) {
      const before = JSON.stringify(state), answer = random() < 0.6;
      const next = recordAnswer(state, answer, {floor}).state;
      assert.equal(JSON.stringify(state), before);
      assert.notEqual(next, state); assert.notEqual(next.recent, state.recent);
      assert.ok(next.tier >= floor && next.tier <= 5);
      assert.ok(Math.abs(next.tier - state.tier) <= 1);
      assert.ok(next.hintLevel >= 0 && next.hintLevel <= 2);
      if (answer) assert.equal(next.hintLevel, 0);
      assert.ok(next.recent.length <= 10);
      state = next;
    }
  }
});
test('NumberLab assessment requires full samples and cannot skip a gap', () => {
  const pass = tier => [{tier,correct:true},{tier,correct:false},{tier,correct:true}];
  assert.equal(suggestStartTier([]), 0);
  assert.equal(suggestStartTier([{tier:3,correct:true}]), 0);
  assert.equal(suggestStartTier(pass(1)), 1);
  assert.equal(suggestStartTier(pass(4)), 0);
  assert.equal(suggestStartTier([...pass(0), ...pass(2)]), 0);
  assert.equal(suggestStartTier([...pass(0), ...pass(1), ...pass(2)]), 2);
  assert.equal(suggestStartTier([0,1,2,3,4,5].flatMap(pass)), 5);
});
