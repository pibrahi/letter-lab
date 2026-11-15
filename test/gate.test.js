const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {makeGateQuestion, nextGateQuestion} = require('../public/_shared/lab.js');
test('gate questions have valid arithmetic and five distinct positive choices', () => {
  let seed = 42;
  const rng = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
  let previous;
  for (let i = 0; i < 500; i++) {
    const q = makeGateQuestion(rng);
    assert.match(q.text, /^\d+ [×+] \d+ = \?$/);
    const [a, op, b] = q.text.split(' ');
    assert.equal(q.answer, op === '×' ? a * b : Number(a) + Number(b));
    if (op === '×') {
      assert.ok(a >= 2 && a <= 9 && b >= 2 && b <= 9);
      assert.ok(a !== '2' || b !== '2');
    } else {
      assert.ok(a >= 4 && a <= 9 && b >= 4 && b <= 9);
      assert.ok(q.answer >= 10);
    }
    assert.equal(q.choices.length, 5);
    assert.equal(new Set(q.choices).size, 5);
    assert.ok(q.choices.every(n => Number.isInteger(n) && n > 0));
    assert.equal(q.choices.filter(n => n === q.answer).length, 1);
    const next = nextGateQuestion(rng);
    assert.notEqual(next.text, previous);
    previous = next.text;
  }
  assert.notEqual(nextGateQuestion(() => 0).text, nextGateQuestion(() => 0).text);
});
test('all games expose an announced gate question and answer group', () => {
  for (const game of ['letter-lab','spelling-academy','word-safari','puzzle-words','memory-match']) {
    const html = readFileSync(`public/${game}/index.html`, 'utf8');
    assert.match(html, /id="gateQuestion" aria-live="polite"/);
    assert.match(html, /id="gateButtons" role="group" aria-label="Answer choices"/);
  }
});
test('openGate renders a fresh question and accepts only its answer', () => {
  const vm = require('node:vm');
  const elements = {};
  const element = () => ({textContent:'', innerHTML:'', style:{}, classList:{add(){},remove(){}}, setAttribute(){}, appendChild(b){this.buttons.push(b);}, buttons:[]});
  for (const id of ['gateQuestion','gateButtons','gateError','gateOverlay']) elements[id] = element();
  const context = vm.createContext({document:{getElementById:id => elements[id],createElement:element},setTimeout(){}});
  vm.runInContext(readFileSync('public/_shared/lab.js','utf8'),context);
  let previous;
  for (let i=0;i<20;i++) {
    let successes = 0;
    context.document.createElement = () => ({...element(),addEventListener(type,fn){this.click=fn;}});
    elements.gateButtons.buttons = [];
    context.openGate(() => successes++);
    const text = elements.gateQuestion.textContent;
    assert.notEqual(text,previous);
    previous=text;
    const [a,op,b]=text.split(' ');
    const answer=op==='×'?a*b:Number(a)+Number(b);
    for(const button of elements.gateButtons.buttons){
      const before=successes;
      button.click();
      assert.equal(successes-before,button.textContent===answer?1:0);
    }
  }
});
