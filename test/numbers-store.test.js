const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../public/numbers/engine/store.js');
const {SKILLS} = require('../public/numbers/engine/levels.js');
test('NumberLab storage validates, resets, round-trips and only writes its record', () => {
  const old = global.localStorage;
  const data = new Map(), writes = [];
  global.localStorage = {getItem:key => data.get(key) ?? null, setItem:(key, value) => { writes.push(key); data.set(key, value); }};
  try {
    const defaults = store.load();
    for (const value of ['garbage','null','[]','{"version":0}', '{"version":1,"startTier":"bad","skills":{}}']) {
      data.set('nl_v1', value); assert.deepEqual(store.load(), defaults);
    }
    let state = store.setStartTier(defaults, 3);
    for (const skill of SKILLS) assert.equal(state.skills[skill.key].tier, 3);
    state.skills.counting = {...state.skills.counting, answered:2, correct:1, recent:[true,false]};
    store.save(state); assert.deepEqual(store.load(), state);
    state.floorTier = 3; state = store.setStartTier(state, 4);
    assert.equal(state.floorTier, 4); assert.equal(state.skills.counting.answered, 0);
    data.set('lab_dark', 'true'); assert.equal(store.load().grownup, true); data.delete('lab_dark');
    data.set('nl_v1', JSON.stringify({...state, skills:{counting:{tier:99}}}));
    assert.equal(store.load().skills.counting.tier, 4);
    assert.deepEqual(store.reset(), defaults);
    assert.ok(writes.every(key => key === 'nl_v1'));
    global.localStorage = {getItem:() => { throw Error('blocked'); }, setItem:() => { throw Error('blocked'); }};
    state = store.setStartTier(defaults, 2); assert.deepEqual(store.load(), state);
    store.reset();
  } finally { global.localStorage = old; }
});
