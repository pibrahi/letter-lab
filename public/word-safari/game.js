/* global openModal, closeModal */
(function () {
  const data = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Word Safari",
  "url": "https://letterlab.cc/word-safari/",
  "description": "Match animals to their words, learn first letters, and spell animal names.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "audience": {
    "@type": "EducationalAudience",
    "suggestedMinAge": "3",
    "suggestedMaxAge": "6"
  }
};
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
})();

const ANIMALS = LAB_WORDS.pick('safariAnimals');

const st = {
  mode: 'match', grownup: false,
  correct: 0, streak: 0, badgeProgress: 0,
  current: null, tapInput: [], locked: false,
};

try {
  const s = JSON.parse(localStorage.getItem('ws_v1') || '{}');
  if (s.mode)    st.mode    = s.mode;
  if (s.grownup) st.grownup = s.grownup;
  if (s.correct) st.correct = s.correct;
  if (s.streak)  st.streak  = s.streak;
} catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }

function save() {
  try { localStorage.setItem('ws_v1', JSON.stringify({mode:st.mode,grownup:st.grownup,correct:st.correct,streak:st.streak})); } catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }
}

function pick(exclude) {
  const pool = exclude ? ANIMALS.filter(a => a.w !== exclude) : ANIMALS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickDistractors(correct, n) {
  const others = ANIMALS.filter(a => a.w !== correct.w);
  const shuffled = others.sort(() => Math.random()-0.5);
  return shuffled.slice(0, n);
}

function hideAll() {
  document.getElementById('wordOptions').style.display   = 'none';
  document.getElementById('letterOptions').style.display = 'none';
  document.getElementById('spellSlots').style.display    = 'none';
}

// ── MATCH THE ANIMAL ──────────────────────────────────────
function startMatch() {
  st.locked  = false;
  st.current = pick(st.current?.w);
  hideAll();
  document.getElementById('wordOptions').style.display  = 'flex';
  document.getElementById('animalEmoji').textContent    = st.current.e;
  document.getElementById('modeLabel').textContent      = 'MATCH';
  document.getElementById('modeSub').textContent        = 'Match the Animal';
  document.getElementById('questionPrompt').textContent = 'Tap the right word!';
  document.getElementById('resultMsg').textContent      = '';

  const distractors = pickDistractors(st.current, 2);
  const opts = [st.current, ...distractors].sort(() => Math.random()-0.5);
  const el   = document.getElementById('wordOptions');
  el.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className   = 'word-opt-btn';
    btn.textContent = opt.w;
    btn.addEventListener('click', () => {
      if (st.locked) return;
      if (opt.w === st.current.w) {
        st.locked = true;
        btn.classList.add('correct-flash');
        el.querySelectorAll('button').forEach(b => b.disabled = true);
        document.getElementById('resultMsg').textContent = '🎉 Correct!';
        onCorrect();
      } else {
        btn.classList.add('wrong-flash');
        setTimeout(() => btn.classList.remove('wrong-flash'), 500);
        btn.disabled = true;
        document.getElementById('resultMsg').textContent = 'Try again!';
      }
    });
    el.appendChild(btn);
  });
}

// ── FIRST LETTER ──────────────────────────────────────────
function startFirstLetter() {
  st.locked  = false;
  st.current = pick(st.current?.w);
  hideAll();
  document.getElementById('letterOptions').style.display = 'flex';
  document.getElementById('animalEmoji').textContent     = st.current.e;
  document.getElementById('modeLabel').textContent       = 'FIRST LETTER';
  document.getElementById('modeSub').textContent         = 'First Letter';
  document.getElementById('questionPrompt').textContent  = `What letter does ${st.current.w} start with?`;
  document.getElementById('resultMsg').textContent       = '';

  const correct     = st.current.w[0];
  const alpha       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== correct);
  const distractors = alpha.sort(() => Math.random()-0.5).slice(0, 3);
  const opts        = [correct, ...distractors].sort(() => Math.random()-0.5);
  const el          = document.getElementById('letterOptions');
  el.innerHTML = '';
  opts.forEach(letter => {
    const btn = document.createElement('button');
    btn.className   = 'letter-opt-btn';
    btn.textContent = letter;
    btn.addEventListener('click', () => {
      if (st.locked) return;
      if (letter === correct) {
        st.locked = true;
        btn.style.background   = 'var(--correct)';
        btn.style.borderColor  = 'var(--correct-b)';
        btn.style.color        = 'var(--correct-txt)';
        el.querySelectorAll('button').forEach(b => b.disabled = true);
        document.getElementById('resultMsg').textContent = `🎉 Yes! ${st.current.w} starts with ${correct}!`;
        onCorrect();
      } else {
        btn.disabled = true;
        btn.style.opacity = '0.25';
        document.getElementById('resultMsg').textContent = 'Not that one — try again!';
      }
    });
    el.appendChild(btn);
  });
}

// ── SPELL IT OUT ──────────────────────────────────────────
function startSpell() {
  st.locked   = false;
  st.tapInput = [];
  st.current  = pick(st.current?.w);
  hideAll();
  document.getElementById('spellSlots').style.display    = 'flex';
  document.getElementById('letterOptions').style.display = 'flex';
  document.getElementById('animalEmoji').textContent     = st.current.e;
  document.getElementById('modeLabel').textContent       = 'SPELL IT';
  document.getElementById('modeSub').textContent         = 'Spell It Out';
  document.getElementById('questionPrompt').textContent  = 'Tap the letters in order!';
  document.getElementById('resultMsg').textContent       = '';

  const word    = st.current.w;
  const slotsEl = document.getElementById('spellSlots');
  slotsEl.innerHTML = '';
  for (let i = 0; i < word.length; i++) {
    const s = document.createElement('div');
    s.className = 'spell-slot';
    s.id = `ss${i}`;
    slotsEl.appendChild(s);
  }

  // Shuffle the exact letters (no distractors — guided for younger kids)
  const letters = [...word].map((l, i) => ({l, i})).sort(() => Math.random()-0.5);
  const el = document.getElementById('letterOptions');
  el.innerHTML = '';
  letters.forEach(({l}, idx) => {
    const btn = document.createElement('button');
    btn.className   = 'letter-opt-btn';
    btn.id          = `sp${idx}`;
    btn.textContent = l;
    btn.addEventListener('click', () => {
      if (st.locked || btn.classList.contains('used')) return;
      const pos      = st.tapInput.length;
      const expected = word[pos];
      if (l === expected) {
        st.tapInput.push(l);
        const slot = document.getElementById(`ss${pos}`);
        slot.textContent = l;
        slot.className = 'spell-slot filled';
        btn.classList.add('used');
        document.getElementById('resultMsg').textContent = '';
        if (st.tapInput.length === word.length) {
          st.locked = true;
          document.querySelectorAll('.spell-slot').forEach(s => s.className = 'spell-slot correct');
          document.getElementById('resultMsg').textContent = `🎉 You spelled ${word}!`;
          onCorrect();
        }
      } else {
        document.getElementById('resultMsg').textContent = 'Try a different letter!';
        btn.style.animation = 'shake 0.42s ease';
        setTimeout(() => btn.style.animation = '', 440);
      }
    });
    el.appendChild(btn);
  });
}

// ── REWARD ────────────────────────────────────────────────
function onCorrect() {
  st.correct++;
  st.streak++;
  st.badgeProgress++;
  renderStars(st.badgeProgress);
  launchConfetti(st.grownup);
  const em = document.getElementById('animalEmoji');
  em.classList.add('bounce');
  setTimeout(() => em.classList.remove('bounce'), 550);
  save();
  if (st.badgeProgress >= 5) {
    st.badgeProgress = 0;
    showToast('⭐ Safari Star earned!');
  }
  setTimeout(() => { document.getElementById('resultMsg').textContent = ''; startRound(); }, 1200);
}

function startRound() {
  if (st.mode === 'match')       startMatch();
  else if (st.mode === 'firstletter') startFirstLetter();
  else                           startSpell();
}

// ── ADMIN ─────────────────────────────────────────────────
function syncAdminUI() {
  document.querySelectorAll('.mode-opt').forEach(b => b.classList.toggle('active', b.dataset.mode === st.mode));
  document.getElementById('statCorrect').textContent = st.correct;
  document.getElementById('statStreak').textContent  = st.streak;
  syncGrownupBtn(st.grownup);
}

document.getElementById('adminBtn').addEventListener('click', () => openGate(() => {
  syncAdminUI();
  openModal(document.getElementById('adminOverlay'), {returnFocus: document.getElementById('adminBtn'), onClose: startRound});
}));
document.getElementById('closeAdminBtn').addEventListener('click', () => closeModal(document.getElementById('adminOverlay')));
document.getElementById('grownupToggleBtn').addEventListener('click', () => { st.grownup = !st.grownup; syncGrownupBtn(st.grownup); });
document.querySelectorAll('.mode-opt').forEach(b => b.addEventListener('click', () => { st.mode = b.dataset.mode; syncAdminUI(); }));
document.getElementById('skipBtn').addEventListener('click', () => { st.locked = false; startRound(); });

// ── BOOT ──────────────────────────────────────────────────
syncGrownupBtn(st.grownup);
renderStars(st.badgeProgress);
startRound();
