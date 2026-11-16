(function () {
  function start({skill, engine, item, theme}) {
    const {levels, adapt, store, counting} = NumberLab;
    const el = id => document.getElementById(id);
    let state = store.load(), challenge, submitted, round = 0, wins = 0, previous, previousKind;
    let keyboard = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    applyGrownup(state.grownup);
    function node(tag, cls, text = '') {
      const n = document.createElement(tag); n.className = cls; n.textContent = text; return n;
    }
    // Fewer items are drawn bigger so small counts fill the picture.
    function group(amount, cls = '', size = amount, paired = false) {
      const g = node('div', `items ${cls} ${size <= 5 ? 'size-s' : size <= 10 ? 'size-m' : 'size-l'}`);
      // Paired groups share one column count so both sides draw items the same size.
      const columns = Math.max(1, paired ? Math.min(size, 3) : Math.min(amount, 5));
      g.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
      g.style.setProperty('--columns', columns);
      for (let i = 0; i < amount; i++) g.append(node('span', 'item', item));
      return g;
    }
    function picture() {
      const c = challenge, scene = el('picture'); scene.replaceChildren();
      let label;
      if (c.type === 'count') {
        scene.append(group(c.count)); label = 'How many eggs?';
        if (c.tier <= 1 && state.skills[skill].hintLevel >= 2) scene.append(node('div', 'equation', c.count));
      } else if (c.type === 'more') {
        label = `Which is more, ${c.left} or ${c.right}?`;
        const row = node('div', 'comparison');
        [c.left, c.right].forEach((n, i) => {
          const cls = `compare-${i === 0 ? 'a' : 'b'}`;
          row.append(n <= 10 ? group(n, cls, Math.max(c.left, c.right), true) : node('div', `equation ${cls}`, n));
        });
        const cue = node('div', 'compare-cue', '⚖'); cue.setAttribute('aria-hidden', 'true');
        scene.append(cue, row);
      } else if (c.sequence) {
        const row = node('div', 'sequence');
        c.sequence.forEach((n, i) => row.append(node('span', i === c.blankIndex ? 'blank' : '', i === c.blankIndex ? '?' : n)));
        scene.append(row);
        label = `Missing number: ${c.sequence.map((n, i) => i === c.blankIndex ? 'blank' : n).join(', ')}.`;
      } else {
        label = c.type === 'add' ? `${c.a} plus ${c.b}?` : `${c.a} plus what equals ${c.total}?`;
        const small = c.type === 'add' ? c.a <= 10 && c.b <= 10 && c.answer <= 20 : c.total <= 20;
        if (small) {
          const row = node('div', 'sum');
          const size = c.type === 'add' ? c.answer : c.total;
          row.append(group(c.a, 'color-a', size, true), node('span', 'operator', '+'), group(c.type === 'add' ? c.b : c.answer, c.type === 'add' ? 'color-b' : 'empty', size, true));
          scene.append(row);
          if (c.type === 'missing') scene.append(node('div', 'equation', `${c.a} + ? = ${c.total}`));
        } else scene.append(node('div', 'equation', c.type === 'add' ? `${c.a} + ${c.b}` : `${c.a} + ? = ${c.total}`));
      }
      scene.setAttribute('aria-label', label); scene.setAttribute('role', 'img');
      el('status').textContent = `Question ${round + 1}. ${label}`;
    }
    function next() {
      if (round === 5) { end(); return; }
      const s = state.skills[skill];
      challenge = engine.makeChallenge(s.tier, Math.random, {hintLevel:s.hintLevel, avoidType:previous, avoidKind:previousKind});
      previous = challenge.type;
      if (challenge.kind) previousKind = challenge.kind;
      submitted = false;
      el('level').textContent = levels.levelLabel(s.tier);
      picture(); el('actions').replaceChildren();
      const choices = challenge.type === 'more' ? [challenge.left, challenge.right] : challenge.choices;
      choices.forEach((value, index) => {
        const b = node('button', 'choice', value); b.type = 'button';
        if (challenge.type === 'more') b.classList.add(index === 0 ? 'compare-a' : 'compare-b');
        b.dataset.value = value; b.setAttribute('aria-label', `Answer ${value}`);
        if (s.tier <= 1 && value <= 10) {
          const dots = node('span', 'dots'); dots.setAttribute('aria-hidden', 'true');
          counting.dotPattern(value).forEach(([x,y]) => {
            const dot = node('i', 'dot'); dot.style.left = `${x * 100}%`; dot.style.top = `${y * 100}%`; dots.append(dot);
          }); b.append(dots);
        }
        b.addEventListener('click', event => answer(value, event)); el('actions').append(b);
      });
      if (keyboard) el('actions').firstElementChild.focus();
    }
    function answer(value, event) {
      if (submitted) return;
      submitted = true; keyboard = event.detail === 0;
      const correct = engine.checkAnswer(challenge, value);
      state.skills[skill] = adapt.recordAnswer(state.skills[skill], correct, {floor:state.floorTier}).state;
      state = store.save(state); round++;
      el('actions').querySelectorAll('button').forEach(b => {
        b.setAttribute('aria-disabled', 'true');
        b.classList.add(Number(b.dataset.value) === challenge.answer ? 'correct' : 'faded');
        if (!correct && Number(b.dataset.value) === challenge.answer) b.classList.add('pulse');
      });
      if (correct) {
        wins++; renderStars(wins);
        const reward = node('div', `reward ${theme}`, theme === 'dino' ? '🐣' : '🚀');
        reward.setAttribute('aria-hidden', 'true'); el('picture').append(reward);
        if (theme === 'dino') setTimeout(() => { reward.textContent = '🦕'; }, 450);
      }
      el('status').textContent = correct ? 'Correct!' : `The answer is ${challenge.answer}.`;
      setTimeout(next, correct ? 1050 : 1200);
    }
    function end() {
      el('play').hidden = true; el('end').hidden = false;
      el('parade').textContent = theme === 'dino' ? '🦕'.repeat(Math.max(1, wins)) : `🚀 ${'🪐'.repeat(Math.max(1, wins))}`;
      renderStars(wins); if (!reduced.matches) launchConfetti(state.grownup);
      el('status').textContent = `Round complete. ${wins} correct answers. Play again or return to NumberLab.`;
      if (keyboard) el('again').focus();
    }
    el('again').addEventListener('click', event => {
      keyboard = event.detail === 0; round = 0; wins = 0; renderStars(0);
      el('end').hidden = true; el('play').hidden = false; next();
    });
    renderStars(0); next();
  }
  NumberLab.simpleGame = {start};
})();
