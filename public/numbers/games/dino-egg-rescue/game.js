(function () {
  const {levels, counting, adapt, store} = NumberLab;
  const el = id => document.getElementById(id);
  let state = store.load(), challenge, submitted, placed = [], marked = new Map();
  let round = 0, wins = 0, previous, demoTimer, advanceTimer, explanationTimer;
  const seen = new Set();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Move focus only for keyboard players; touch players would see a stray ring.
  let keyboard = false;
  document.addEventListener('keydown', e => { if (['Tab','Enter',' ','ArrowLeft','ArrowRight'].includes(e.key)) keyboard = true; }, {capture:true});
  document.addEventListener('pointerdown', () => { keyboard = false; }, {capture:true});
  const focus = target => { if (target && keyboard) target.focus(); };
  applyGrownup(state.grownup);
  function node(tag, cls, text) {
    const n = document.createElement(tag); n.className = cls; n.textContent = text ?? ''; return n;
  }
  function button(text, label, action, cls = '') {
    const b = node('button', cls, text); b.type = 'button'; b.setAttribute('aria-label', label);
    b.addEventListener('click', action); return b;
  }
  function dots(n) {
    const frame = node('span', 'dots'); frame.setAttribute('aria-hidden', 'true');
    counting.dotPattern(n).forEach(([x,y]) => {
      const dot = node('i', 'dot'); dot.style.left = `${x * 100}%`; dot.style.top = `${y * 100}%`; frame.append(dot);
    }); return frame;
  }
  function numeral(n, cls = '') {
    const sign = node('div', `numeral ${cls}`, n);
    if (n <= 10 && challenge.tier <= 1) sign.append(dots(n));
    return sign;
  }
  function crate(filled = 10) {
    const box = node('span', 'crate'); box.setAttribute('aria-label', `${filled} eggs in crate`);
    for (let i = 0; i < 10; i++) box.append(node('span', i < filled ? '' : 'empty-slot', i < filled ? '🥚' : '○'));
    return box;
  }
  function egg(i, interactive, action) {
    const e = interactive ? button('🥚', `Egg ${i + 1}`, action, 'egg') : node('span', 'egg', '🥚');
    e.dataset.egg = i;
    if (marked.has(i) || state.skills.counting.hintLevel >= 2) e.append(node('span', 'badge', marked.get(i) || i + 1));
    return e;
  }
  function showPill() {
    const tier = levels.tierById(state.skills.counting.tier);
    el('level').textContent = `${tier.icon} ${tier.label}`;
  }
  function total() { return placed.reduce((a,b) => a + b, 0); }
  function moveEgg(i) {
    if (submitted) return;
    if (placed.includes(i)) placed = placed.filter(v => v !== i); else placed.push(i);
    renderInteraction();
    const moved = document.querySelector(`[data-egg="${i}"]`);
    moved.classList.add('fly'); focus(moved);
    el('status').textContent = `${placed.length} eggs in nest`;
  }
  function drag(e, i) {
    let start;
    e.addEventListener('pointerdown', event => {
      if (submitted) return;
      start = {x:event.clientX, y:event.clientY}; e.setPointerCapture(event.pointerId);
    });
    e.addEventListener('pointermove', event => {
      if (!start) return;
      e.style.transform = `translate(${event.clientX - start.x}px, ${event.clientY - start.y}px)`;
    });
    e.addEventListener('pointerup', event => {
      if (!start) return;
      const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12;
      start = null; e.style.transform = '';
      if (!moved) return;
      const rect = el('nest').getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom && !placed.includes(i)) moveEgg(i);
      else e.addEventListener('click', event => event.stopImmediatePropagation(), {once:true, capture:true});
    });
    e.addEventListener('pointercancel', () => { start = null; e.style.transform = ''; });
  }
  function renderInteraction() {
    el('nest').replaceChildren(); el('pile').replaceChildren();
    if (challenge.type === 'fill') {
      el('pile').classList.toggle('many', challenge.pile > 10);
      el('nest').append(numeral(placed.length, 'counter'));
      const nestEggs = node('div', 'egg-grid'); el('nest').append(nestEggs);
      for (let i = 0; i < challenge.pile; i++) {
        const e = egg(i, true, () => moveEgg(i));
        if (placed.includes(i)) nestEggs.append(e);
        else { el('pile').append(e); drag(e, i); }
      }
    } else {
      const amount = total();
      const digits = node('div', 'place-value');
      digits.append(node('span', 'tens', Math.floor(amount / 10)), node('span', '', '|'), node('span', 'ones', amount % 10));
      el('nest').append(digits);
      const collection = node('div', 'collection'); el('nest').append(collection);
      placed.forEach((value, i) => {
        const b = button('', `Remove ${value} eggs`, () => {
          if (submitted) return; placed.splice(i, 1); renderInteraction(); focus(el('pile').querySelector('button'));
        }, 'built');
        b.append(value === 10 ? crate() : node('span', '', '🥚')); collection.append(b);
      });
      [10,1].forEach(value => {
        const b = button(value === 10 ? '+10' : '🥚 +1', `Add ${value} eggs`, () => {
          if (submitted || placed.filter(n => n === value).length >= (value === 10 ? 10 : 9) || total() + value > 109) return;
          placed.push(value); renderInteraction(); focus(el('pile').querySelectorAll('button')[value === 10 ? 0 : 1]);
          el('status').textContent = `${total()} eggs built`;
        }, 'bin');
        if (value === 10) b.prepend(crate()); el('pile').append(b);
      });
    }
  }
  function showEggs(count, parent, interactive = false) {
    const grid = node('div', 'egg-grid'); parent.append(grid);
    for (let i = 0; i < count; i++) {
      const e = egg(i, interactive, () => {
        if (submitted || marked.has(i)) return;
        marked.set(i, marked.size + 1); e.append(node('span', 'badge', marked.size));
        el('status').textContent = `${marked.size}`;
      }); grid.append(e);
    }
  }
  function renderSequence(explain = false) {
    el('nest').replaceChildren();
    const row = node('div', 'sequence');
    challenge.sequence.forEach((n, i) => {
      if (i && (explain || state.skills.counting.hintLevel >= 1)) row.append(node('span', 'step', `+${challenge.step} →`));
      row.append(node('span', `small-nest ${i === challenge.blankIndex ? 'blank' : ''}`, i === challenge.blankIndex && !explain ? '?' : n));
    }); el('nest').append(row);
  }
  function renderGroups(crates, loose, packing = false) {
    el('nest').replaceChildren();
    const group = node('div', `collection ${packing ? 'packing' : ''}`); el('nest').append(group);
    for (let i = 0; i < crates; i++) group.append(crate());
    showEggs(loose, group);
  }
  function stopDemo() { clearTimeout(demoTimer); el('demo').hidden = true; }
  function demo() {
    stopDemo(); if (submitted || el('play').hidden) return;
    const targets = challenge.type === 'fill' ? [el('pile').querySelector('button'), el('nest'), el('done')] : challenge.type === 'build' ? [el('pile').querySelector('button'), el('nest'), el('done')] : [el('actions').querySelector('button')];
    let index = 0;
    function point() {
      const target = targets[index++]; if (!target) { stopDemo(); return; }
      const r = target.getBoundingClientRect();
      el('demo').textContent = reduced ? '➜' : '👆'; el('demo').hidden = false;
      el('demo').style.left = `${r.left + r.width / 2}px`; el('demo').style.top = `${r.top + r.height / 2}px`;
      demoTimer = setTimeout(point, targets.length === 1 ? 1800 : 700);
    }
    point();
  }
  function next() {
    stopDemo(); clearTimeout(advanceTimer); clearTimeout(explanationTimer);
    if (round === 5) { end(); return; }
    const skill = state.skills.counting;
    challenge = counting.makeChallenge(skill.tier, Math.random, {hintLevel:skill.hintLevel, avoidType:previous});
    previous = challenge.type; submitted = false; placed = []; marked = new Map();
    el('play').className = ''; el('actions').classList.remove('explaining'); showPill();
    ['sign','nest','pile','actions'].forEach(id => el(id).replaceChildren());
    el('pile').className = 'pile'; el('nest').classList.toggle('many', (challenge.eggs || challenge.target || 0) > 10);
    if (challenge.target !== undefined) el('sign').append(numeral(challenge.target));
    if (challenge.type === 'fill' || challenge.type === 'build') {
      renderInteraction();
      const done = button('✓', 'Done, check eggs', () => submit(challenge.type === 'fill' ? placed.length : total()), 'done');
      done.id = 'done'; el('actions').append(done);
    } else {
      if (challenge.type === 'count') showEggs(challenge.eggs, el('nest'), true);
      else if (challenge.sequence) renderSequence();
      else if (challenge.type === 'toNextTen') {
        renderGroups(Math.floor(challenge.eggs / 10), 0);
        el('nest').querySelector('.collection').append(crate(challenge.eggs % 10));
        el('sign').append(node('span', 'numeral', '+ ? → 📦'));
      } else renderGroups(challenge.crates, challenge.loose);
      challenge.choices.forEach(value => {
        const b = button('', `Answer ${value}`, () => submit(value), 'choice'); b.dataset.value = value;
        b.append(numeral(value)); el('actions').append(b);
      });
    }
    el('status').textContent = `Challenge ${round + 1}. ${challenge.type === 'fill' ? `Move ${challenge.target} eggs to the nest.` : challenge.type === 'build' ? `Build ${challenge.target} with tens and ones.` : 'Choose the missing number or egg count.'}`;
    focus(el('play').querySelector('button'));
    if (!seen.has(challenge.type)) { seen.add(challenge.type); demo(); }
  }
  function explain() {
    if (challenge.sequence) renderSequence(true);
    if (challenge.type === 'count') {
      el('nest').querySelectorAll('.egg').forEach((e, i) => {
        e.querySelector('.badge')?.remove();
        const badge = node('span', 'badge reveal', i + 1); badge.style.animationDelay = `${i * 70}ms`; e.append(badge);
      });
    }
    if (challenge.type === 'regroup') {
      const looseEggs = el('nest').querySelectorAll('.egg');
      looseEggs.forEach((e, i) => { if (i < 10) e.classList.add('pack-egg'); });
      explanationTimer = setTimeout(() => renderGroups(challenge.crates + 1, challenge.loose - 10, true), reduced ? 0 : 900);
    }
    if (challenge.type === 'tensCount' || challenge.type === 'regroup') {
      el('sign').append(node('span', 'equation', `${challenge.crates} × 10 + ${challenge.loose} = ${challenge.answer}`));
    }
    if (challenge.type === 'fill') {
      placed = Array.from({length:challenge.answer}, (_, i) => i); renderInteraction();
    }
    if (challenge.type === 'build') {
      placed = [...Array(Math.floor(challenge.answer / 10)).fill(10), ...Array(challenge.answer % 10).fill(1)]; renderInteraction();
    }
    if (challenge.type === 'toNextTen') {
      el('sign').replaceChildren(node('span', 'equation', `${challenge.eggs} + ${challenge.answer} = ${challenge.eggs + challenge.answer}`));
      const partial = el('nest').querySelector('.collection').lastElementChild;
      partial.querySelectorAll('.empty-slot').forEach(slot => { slot.textContent = '🥚'; slot.classList.add('filled'); });
    }
    el('done')?.remove();
    if (challenge.target === undefined) el('sign').append(numeral(challenge.answer, 'answer'));
    el('actions').querySelectorAll('button').forEach(b => {
      if (Number(b.dataset.value) === challenge.answer) b.classList.add('highlight');
    });
    el('actions').classList.add('explaining');
    const forward = button('➜', 'Continue to next challenge', next, 'forward'); el('actions').append(forward); focus(forward);
  }
  function submit(value) {
    if (submitted) return;
    submitted = true; stopDemo();
    const correct = counting.checkAnswer(challenge, value);
    const result = adapt.recordAnswer(state.skills.counting, correct, {floor:state.floorTier});
    state.skills.counting = result.state; state = store.save(state);
    round++;
    el('play').querySelectorAll('button').forEach(b => b.setAttribute('aria-disabled', 'true'));
    if (result.event === 'up') {
      showPill(); el('level').classList.add('celebrate');
      setTimeout(() => el('level').classList.remove('celebrate'), 1200);
      if (!reduced) launchConfetti(state.grownup);
    }
    if (correct) {
      wins++; renderStars(wins);
      el('status').textContent = 'Eggs rescued!'; el('play').classList.add('hatching');
      el('nest').append(node('div', 'hatchling', '🥚'));
      advanceTimer = setTimeout(() => { el('nest').querySelector('.hatchling').textContent = '🦕'; }, reduced ? 0 : 500);
      advanceTimer = setTimeout(next, 1200);
    } else {
      el('status').textContent = `The answer is ${challenge.answer}. Follow the eggs, then continue.`;
      explain();
    }
  }
  function end() {
    el('play').hidden = true; el('end').hidden = false;
    el('parade').textContent = Array.from({length:Math.max(1, wins)}, (_, i) => ['🦕','🦖'][i % 2]).join(' ');
    renderStars(wins); if (!reduced) launchConfetti(state.grownup);
    el('status').textContent = 'Round complete! Play again or return home.'; focus(el('again'));
  }
  el('again').addEventListener('click', () => {
    round = 0; wins = 0; renderStars(0); el('end').hidden = true; el('play').hidden = false; next();
  });
  el('help').addEventListener('click', demo);
  document.addEventListener('pointerdown', stopDemo, {capture:true});
  document.addEventListener('keydown', stopDemo);
  next();
})();
