(function () {
  const {levels, addition, counting, adapt, store} = NumberLab;
  const el = id => document.getElementById(id);
  let state = store.load(), challenge, submitted, placed = [], hint;
  let round = 0, wins = 0, previous, demoTimer, advanceTimer;
  const seen = new Set();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  function numeral(value) {
    const n = node('span', 'numeral', value);
    if (challenge.tier <= 1 && typeof value === 'number' && value <= 10) {
      const dots = node('span', 'dots'); dots.setAttribute('aria-hidden', 'true');
      counting.dotPattern(value).forEach(([x,y]) => {
        const d = node('i', 'dot'); d.style.left = `${x * 100}%`; d.style.top = `${y * 100}%`; dots.append(d);
      }); n.append(dots);
    }
    return n;
  }
  function cell(color, badge, empty = false) {
    const n = node('span', `cell ${color}${empty ? ' empty' : ''}`);
    if (badge !== undefined) n.append(node('span', 'badge', badge));
    return n;
  }
  function rod(color) {
    const r = node('span', `rod ${color}`);
    for (let i = 0; i < 10; i++) r.append(cell(color));
    r.setAttribute('aria-label', '10 fuel cells'); return r;
  }
  function group(amount, color, offset = 0, reveal = false, empty = false) {
    const g = node('div', `group ${color}${challenge.type === 'bond' && challenge.tier === 2 ? ' ten-frame' : ''}`);
    g.setAttribute('aria-label', `${amount} ${empty ? 'empty slots' : 'fuel cells'}`);
    if (challenge.tier >= 3) {
      for (let i = 0; i < Math.floor(amount / 10); i++) {
        const r = rod(color); if (reveal) r.append(node('span', 'rod-count', offset + (i + 1) * 10)); if (empty) r.classList.add('empty'); g.append(r);
      }
      for (let i = 0; i < amount % 10; i++) g.append(cell(color, reveal ? offset + Math.floor(amount / 10) * 10 + i + 1 : undefined, empty));
    } else for (let i = 0; i < amount; i++) g.append(cell(color, reveal || hint >= 2 ? offset + i + 1 : undefined, empty));
    return g;
  }
  function equation(parts) {
    el('sign').replaceChildren(...parts.map(p => numeral(p)));
  }
  function splitAid() {
    const c = challenge, terms = c.type === 'bond' ? [c.a,c.answer] : c.type === 'balance' ? [c.a,c.b] : [c.a,c.b,...(c.c === undefined ? [] : [c.c])];
    const tens = terms.map(n => Math.floor(n / 10) * 10).join(' + ');
    const ones = terms.map(n => n % 10).join(' + ');
    const aid = node('div', 'split', `${tens} | ${ones}`);
    if (submitted) {
      const sum = terms.reduce((a,b) => a + b, 0), loose = terms.reduce((a,b) => a + b % 10, 0);
      if (loose >= 10) { const regroup = node('span', 'regroup', `${loose} ➜ ${Math.floor(loose / 10) * 10} + ${loose % 10}`); regroup.prepend(rod('b')); aid.append(regroup); }
      aid.append(node('span', '', `= ${sum}`));
    }
    el('bay').append(aid);
  }
  function showChoiceScene(reveal = false) {
    const c = challenge;
    el('tank').replaceChildren(); el('bay').replaceChildren();
    if (c.type === 'ways') {
      el('tank').append(group(c.target, 'a', 0, false, true)); return;
    }
    if (c.type === 'bond') {
      el('tank').append(group(c.a, 'a', 0, reveal), group(c.answer, 'b', c.a, reveal, !reveal));
    } else {
      el('tank').append(group(c.a, 'a', 0, reveal), node('span', 'flow', '+'), group(c.b, 'b', c.a, reveal));
      if (c.type === 'threeAddends') el('tank').append(node('span', 'flow', '+'), group(c.c, 'c', c.a + c.b, reveal));
      if (c.type === 'balance') {
        const pipe = node('div', 'balance-pipe'); pipe.append(numeral('='), group(c.c, 'c', 0, reveal), numeral('+'), reveal ? group(c.answer, 'b', c.c, true) : numeral('?')); el('tank').append(pipe);
      }
    }
    if (challenge.tier >= 3 && (hint >= 2 || reveal)) splitAid();
    if (reveal && !['bond','balance'].includes(c.type)) el('bay').append(numeral(c.answer));
  }
  function total() { return challenge.start + placed.reduce((a,b) => a + b, 0); }
  function renderInteraction(reveal = false) {
    const c = challenge, build = c.type === 'build';
    el('tank').replaceChildren(); el('bay').replaceChildren();
    if (build) el('tank').append(node('div', 'place-value', `${Math.floor(total() / 10)} | ${total() % 10}`));
    else el('tank').append(node('div', 'gauge', total()));
    const contents = node('div', 'contents'); contents.append(group(c.start, 'a', 0, reveal));
    placed.forEach((value, i) => {
      const b = button('', `Unload ${value} fuel cells`, () => {
        if (submitted) return; placed.splice(i, 1); renderInteraction(); focus(el('bay').querySelector('button'));
      }, 'loaded');
      b.append(value === 10 ? rod('b') : cell('b', reveal || hint >= 2 ? c.start + placed.slice(0, i).reduce((sum, n) => sum + n, 0) + 1 : undefined));
      if (submitted) b.disabled = true; contents.append(b);
    });
    el('tank').append(contents);
    if (!build) {
      const target = node('div', 'target-line'); target.append(numeral(c.target), node('span', '', '←')); el('tank').append(target);
    }
    if (!submitted) (build ? [10,1] : [1]).forEach(value => {
      const count = build ? 1 : levels.tierById(c.tier).maxNumber - total();
      for (let i = 0; i < count; i++) {
        const b = button(build ? `+${value}` : '', `Load ${value} fuel cells`, () => {
          if (submitted || total() + value > levels.tierById(c.tier).maxNumber || (build && placed.filter(n => n === value).length >= 9)) return;
          placed.push(value); renderInteraction(); focus(el('bay').querySelector('button:not(:disabled)') || el('done'));
          el('status').textContent = `${total()} fuel cells in tank`;
        }, build ? 'bin' : 'supply');
        if (build && value === 10) b.prepend(rod('b')); else if (!build) b.append(cell('b', hint >= 2 ? total() + i + 1 : undefined));
        if (total() + value > levels.tierById(c.tier).maxNumber || (build && placed.filter(n => n === value).length >= 9)) b.disabled = true;
        el('bay').append(b);
      }
    });
    if (build && (hint >= 2 || reveal)) splitAid();
  }
  function stopDemo() { clearTimeout(demoTimer); el('demo').hidden = true; }
  function demo() {
    stopDemo(); if (submitted || el('play').hidden) return;
    const interaction = !challenge.choices;
    const targets = interaction ? [el('bay').querySelector('button'), el('tank'), el('done')] : [el('actions').querySelector('button')];
    let index = 0;
    function point() {
      const target = targets[index++]; if (!target) { stopDemo(); return; }
      const r = target.getBoundingClientRect(); el('demo').textContent = reduced ? '➜' : '👆'; el('demo').hidden = false;
      el('demo').style.left = `${r.left + r.width / 2}px`; el('demo').style.top = `${r.top + r.height / 2}px`;
      demoTimer = setTimeout(point, reduced ? 1800 : 800);
    }
    point();
  }
  function showPill() { el('level').textContent = levels.levelLabel(state.skills.addition.tier); }
  function next() {
    stopDemo(); clearTimeout(advanceTimer);
    if (round === 5) { end(); return; }
    const skill = state.skills.addition; hint = skill.hintLevel;
    challenge = addition.makeChallenge(skill.tier, Math.random, {hintLevel:hint, avoidType:previous});
    previous = challenge.type; submitted = false; placed = [];
    el('play').className = challenge.tier >= 2 ? 'many' : '';
    el('actions').className = 'actions'; el('actions').replaceChildren(); showPill();
    const c = challenge;
    if (c.type === 'fillTo' || c.type === 'ways') equation([c.target]);
    else if (c.type === 'bond') equation([c.a,'+','?','=',c.target]);
    else if (c.type === 'balance') equation([c.a,'+',c.b,'=',c.c,'+','?']);
    else equation([c.a,'+',c.b,...(c.type === 'threeAddends' ? ['+',c.c] : [])]);
    if (!c.choices) {
      renderInteraction();
      const done = button('✓', 'Check fuel', () => submit(c.type === 'fillTo' ? total() - c.start : total()), 'done'); done.id = 'done'; el('actions').append(done);
    } else {
      showChoiceScene();
      c.choices.forEach(value => {
        const pair = c.pairs?.[value];
        const b = button('', pair ? `${pair[0]} plus ${pair[1]}` : `Answer ${value}`, () => submit(value), 'choice'); b.dataset.value = value;
        if (pair) {
          b.append(node('span', 'pair', `${pair[0]} + ${pair[1]}`));
          const bars = node('span', 'bars');
          pair.forEach((n, i) => { const bar = node('span', i ? 'b' : 'a'); bar.style.width = `${n}%`; bars.append(bar); }); b.append(bars);
        } else b.append(numeral(value));
        el('actions').append(b);
      });
    }
    el('status').textContent = `Challenge ${round + 1}. ${c.type === 'fillTo' ? `Load fuel to reach ${c.target}.` : c.type === 'build' ? `Build ${c.a} plus ${c.b}.` : 'Choose the fuel that completes the sum.'}`;
    focus(el('play').querySelector('button'));
    if (!seen.has(c.type)) { seen.add(c.type); demo(); }
  }
  function explain() {
    const c = challenge;
    if (!c.choices) {
      const added = c.type === 'fillTo' ? c.answer : c.b;
      placed = c.type === 'fillTo' ? Array(added).fill(1) : [...Array(Math.floor(added / 10)).fill(10), ...Array(added % 10).fill(1)];
      renderInteraction(true);
    } else showChoiceScene(true);
    el('actions').querySelectorAll('.choice').forEach(b => {
      b.disabled = true; if (Number(b.dataset.value) === c.answer) b.classList.add('highlight');
    });
    el('actions').classList.add('explaining');
    const forward = button('➜', 'Continue to next challenge', next, 'forward'); el('actions').append(forward); focus(forward);
  }
  function submit(value) {
    if (submitted) return;
    submitted = true; stopDemo(); el('done')?.remove();
    const correct = addition.checkAnswer(challenge, value);
    const result = adapt.recordAnswer(state.skills.addition, correct, {floor:state.floorTier});
    state.skills.addition = result.state; state = store.save(state); round++;
    el('play').querySelectorAll('button').forEach(b => { b.disabled = true; });
    if (result.event === 'up') { showPill(); if (!reduced) launchConfetti(state.grownup); }
    if (correct) {
      wins++; renderStars(wins); el('play').classList.add('launch');
      el('status').textContent = 'Rocket fuel ready!'; advanceTimer = setTimeout(next, 1200);
    } else {
      el('status').textContent = challenge.type === 'ways' ? `Follow the highlighted fuel pair for ${challenge.target}.` : `Follow the fuel cells: ${challenge.answer}.`;
      explain();
    }
  }
  function end() {
    el('play').hidden = true; el('end').hidden = false;
    el('planets').textContent = `🚀 ${['🪐','🌍','🌕','🌑','☄️'].slice(0, Math.max(1, wins)).join(' ')}`;
    renderStars(wins); if (!reduced) launchConfetti(state.grownup);
    el('status').textContent = 'Round complete. Play again or return home.'; focus(el('again'));
  }
  el('again').addEventListener('click', () => {
    round = 0; wins = 0; renderStars(0); el('end').hidden = true; el('play').hidden = false; next();
  });
  el('help').addEventListener('click', demo);
  document.addEventListener('pointerdown', stopDemo, {capture:true});
  document.addEventListener('keydown', stopDemo);
  next();
})();
