const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Exercise the real runner with a small DOM and a manually advanced clock.
function setup({theme = 'dino', reduced = false, challenge} = {}) {
  let focused = null, saves = 0, confetti = 0;
  class Element {
    constructor(tag = 'div') {
      this.tag = tag; this.children = []; this.dataset = {}; this.attributes = {}; this.style = {setProperty:(key, value) => { this.style[key] = value; }}; this.listeners = {};
      this.classes = new Set(); this.classList = {add:(...names) => names.forEach(n => this.classes.add(n))};
    }
    set className(value) { this.classes = new Set(value.split(' ')); }
    set textContent(value) { this.text = String(value); this.children = []; }
    get textContent() { return this.text || ''; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    setAttribute(key, value) { this.attributes[key] = value; }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    focus() { focused = this; }
    get firstElementChild() { return this.children[0]; }
    querySelectorAll(tag) { return this.children.flatMap(n => [...(n.tag === tag ? [n] : []), ...n.querySelectorAll(tag)]); }
    click(detail = 1) { this.listeners.click({detail}); }
  }
  const ids = Object.fromEntries(['level','picture','actions','status','play','end','parade','again'].map(id => [id, new Element()]));
  const timers = [], stars = [], requests = [];
  const skill = theme === 'dino' ? 'counting' : 'addition';
  const state = {floorTier:0, grownup:true, skills:{[skill]:{tier:0, hintLevel:0}}};
  const engine = {
    makeChallenge(tier, rng, opts) {
      requests.push({tier, opts});
      return challenge || (theme === 'dino' ? {tier, type:'count', count:2, answer:2, choices:[1,2,3]} : {tier, type:'add', a:1, b:1, answer:2, choices:[1,2,3]});
    },
    checkAnswer:(c, value) => value === c.answer,
    dotPattern:() => [[0.5,0.5]],
  };
  const context = {
    NumberLab:{levels:{levelLabel:() => 'G mode'}, store:{load:() => state, save:s => { saves++; return s; }},
      adapt:{recordAnswer:(s, correct, opts) => { assert.equal(opts.floor, 0); return {state:{...s, last:correct}}; }}, counting:engine},
    document:{getElementById:id => ids[id], createElement:tag => new Element(tag)},
    window:{matchMedia:() => ({matches:reduced})},
    applyGrownup:value => assert.equal(value, true), renderStars:value => stars.push(value),
    launchConfetti:grownup => { assert.equal(grownup, true); confetti++; },
    setTimeout:(fn, delay) => timers.push({fn, delay}),
  };
  vm.runInNewContext(fs.readFileSync('public/numbers/games/shared/simple-game.js', 'utf8'), context);
  context.NumberLab.simpleGame.start({skill, engine, theme, item:theme === 'dino' ? '🥚' : '▰'});
  return {ids, stars, requests, get focused() { return focused; }, get saves() { return saves; }, get confetti() { return confetti; },
    advance:() => { const pending = timers.splice(0).sort((a,b) => a.delay - b.delay); pending.forEach(t => t.fn()); }};
}

for (const theme of ['dino','rocket']) for (const reduced of [false,true]) {
  test(`${theme} round records first answers, awards wins and replays (reduced=${reduced})`, () => {
    const game = setup({theme, reduced});
    assert.equal(game.focused, null);
    for (let i = 0; i < 5; i++) {
      const answers = game.ids.actions.children;
      answers[i % 2 ? 0 : 1].click();
      answers[1].click(); // A second click during feedback must do nothing.
      assert.equal(game.saves, i + 1);
      assert.ok(answers[1].classes.has('correct'));
      assert.ok(answers[0].classes.has('faded'));
      if (i % 2) assert.ok(answers[1].classes.has('pulse'));
      game.advance();
      assert.equal(game.focused, null);
    }
    assert.equal(game.ids.play.hidden, true); assert.equal(game.ids.end.hidden, false);
    assert.equal(game.stars.at(-1), 3); assert.equal(game.confetti, reduced ? 0 : 1);
    assert.equal(game.requests.length, 5);
    assert.equal(game.ids.parade.textContent, theme === 'dino' ? '🦕🦕🦕' : '🚀 🪐🪐🪐');
    game.ids.again.click();
    assert.equal(game.stars.at(-1), 0); assert.equal(game.ids.play.hidden, false);
    assert.equal(game.requests.length, 6);
  });
}
test('focus follows keyboard answers and replay, then stops following tap answers', () => {
  const game = setup();
  game.ids.actions.children[1].click(0); game.advance();
  assert.equal(game.focused, game.ids.actions.firstElementChild);
  const previousFocus = game.focused;
  game.ids.actions.children[1].click(1); game.advance();
  assert.equal(game.focused, previousFocus);
  for (let i = 0; i < 3; i++) { game.ids.actions.children[0].click(0); game.advance(); }
  assert.equal(game.focused, game.ids.again);
  game.ids.again.click(0);
  assert.equal(game.focused, game.ids.actions.firstElementChild);
});
test('zero-win rounds still show one baby dinosaur', () => {
  const game = setup();
  for (let i = 0; i < 5; i++) { game.ids.actions.children[0].click(); game.advance(); }
  assert.equal(game.stars.at(-1), 0); assert.equal(game.ids.parade.textContent, '🦕');
});

for (const [left,right] of [[4,2], [1,10], [99,98]]) {
  test(`compare ${left} vs ${right} links ordered groups and answers with a quiet cue`, () => {
    const game = setup({challenge:{type:'more', tier:1, left, right, answer:Math.max(left,right), choices:[right,left]}});
    const [cue,row] = game.ids.picture.children;
    assert.ok(cue.classes.has('compare-cue'));
    assert.equal(cue.attributes['aria-hidden'], 'true');
    assert.equal(cue.textContent, '⚖');
    assert.match(game.ids.picture.attributes['aria-label'], /Which is more/);
    for (const [i,value] of [left,right].entries()) {
      const cls = i === 0 ? 'compare-a' : 'compare-b';
      assert.ok(row.children[i].classes.has(cls));
      assert.ok(game.ids.actions.children[i].classes.has(cls));
      assert.equal(game.ids.actions.children[i].dataset.value, value);
      if (value > 10) assert.equal(row.children[i].textContent, String(value));
      else assert.equal(row.children[i].children.length, value);
    }
    game.ids.actions.children[[left,right].indexOf(Math.max(left,right))].click();
    assert.equal(game.stars.at(-1), 1);
  });
}
