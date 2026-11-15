// lab.js — shared utilities for the Letter Lab game suite

let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

function launchConfetti(grownup) {
  const kc = ['#ff6b6b','#4ecdc4','#ffe66d','#a78bfa','#5cb85c','#f0ad4e','#ff9ff3'];
  const ac = ['#40826D','#52a88e','#e6b830','#8aad9f','#c2ddd5'];
  const colors = grownup ? ac : kc;
  const count  = grownup ? 28 : 65;
  for (let i = 0; i < count; i++) setTimeout(() => {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    const sz = grownup ? (4 + Math.random() * 4) : (7 + Math.random() * 7);
    c.style.cssText = `left:${Math.random()*100}vw;width:${sz}px;height:${sz*1.3}px;` +
      `background:${colors[Math.floor(Math.random()*colors.length)]};` +
      `border-radius:${grownup?'1px':'3px'};transform:rotate(${Math.random()*360}deg);` +
      `animation-duration:${2+Math.random()*2}s;`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4500);
  }, i * (grownup ? 65 : 32));
}

function applyGrownup(on) {
  document.body.classList.toggle('grownup', on);
}

function closeGate() {
  document.getElementById('gateOverlay').classList.remove('show');
}

// Choose from a finite pool so even a constant RNG cannot stall on reopening.
const gatePool = [];
for (let a = 2; a <= 9; a++) {
  for (let b = 2; b <= 9; b++) {
    if (a !== 2 || b !== 2) gatePool.push({text: `${a} × ${b} = ?`, answer: a * b});
  }
}
for (let a = 4; a <= 9; a++) {
  for (let b = 4; b <= 9; b++) {
    if (a + b >= 10) gatePool.push({text: `${a} + ${b} = ?`, answer: a + b});
  }
}
function gateQuestionFrom(pool, rng) {
  const {text, answer} = pool[Math.floor(rng() * pool.length)];
  // Distractors at random offsets (up to ±6) so the answer isn't always the middle value.
  const offsets = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].filter(d => answer + d > 0);
  for (let i = offsets.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
  }
  const choices = [answer, ...offsets.slice(0, 4).map(d => answer + d)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return {text, answer, choices};
}
function makeGateQuestion(rng = Math.random) {
  return gateQuestionFrom(gatePool, rng);
}
let lastGateQuestion;
function nextGateQuestion(rng = Math.random) {
  const question = gateQuestionFrom(gatePool.filter(q => q.text !== lastGateQuestion), rng);
  lastGateQuestion = question.text;
  return question;
}

function openGate(onSuccess, options = {}) {
  const container = document.getElementById('gateButtons');
  const err = document.getElementById('gateError');
  err.textContent = '';
  container.innerHTML = '';
  const question = nextGateQuestion();
  document.getElementById('gateQuestion').textContent = question.text;
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', 'Answer choices');
  question.choices.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'abtn ghost';
    btn.textContent = n;
    btn.style.cssText = 'min-width:52px;font-size:1rem;padding:10px 0;';
    btn.addEventListener('click', () => {
      if (n === question.answer) {
        closeGate();
        onSuccess();
      } else {
        err.textContent = 'Not quite — try again';
        if (options.wrongClass) {
          btn.classList.add(options.wrongClass);
          setTimeout(() => { err.textContent = ''; btn.classList.remove(options.wrongClass); }, 1200);
        } else {
          btn.style.borderColor = '#ef4444';
          btn.style.color = '#ef4444';
          setTimeout(() => { err.textContent = ''; btn.style.borderColor = ''; btn.style.color = ''; }, 1200);
        }
      }
    });
    container.appendChild(btn);
  });
  document.getElementById('gateOverlay').classList.add('show');
}

// Shared grownup toggle UI update — call after toggling state.grownup
function syncGrownupBtn(grownup) {
  const lbl = document.getElementById('grownupLabel');
  const dot = document.getElementById('grownupDot');
  const btn = document.getElementById('grownupToggleBtn');
  applyGrownup(grownup);
  if (lbl) lbl.textContent = `Dark mode: ${grownup ? 'ON' : 'OFF'}`;
  if (dot) dot.style.background = grownup ? '#52c4a0' : '#3d6050';
  if (btn) {
    btn.style.background = grownup ? 'rgba(64,130,109,0.2)' : '';
    btn.style.color = grownup ? '#52c4a0' : '#52a88e';
  }
}

// Shared progress stars (5-star badge bar)
function renderStars(progress) {
  for (let i = 0; i < 5; i++) {
    const star = document.getElementById(`star${i}`);
    if (!star) continue;
    if (i < progress) {
      if (!star.classList.contains('lit')) {
        star.classList.add('lit', 'pop');
        setTimeout(() => star.classList.remove('pop'), 400);
      }
    } else {
      star.classList.remove('lit', 'pop');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { makeGateQuestion, nextGateQuestion };
