/* global openModal, closeModal */
(function () {
  const data = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Superhero Spelling Academy",
  "url": "https://letterlab.cc/spelling-academy/",
  "description": "Fix broken words, unscramble villain mix-ups, and earn hero badges.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "audience": {
    "@type": "EducationalAudience",
    "suggestedMinAge": "4",
    "suggestedMaxAge": "7"
  }
};
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
})();

const WORDS = LAB_WORDS.pick('spellingWords');

const st = {
  mode: 'fix', wordLen: 0, grownup: false,
  wordsCorrect: 0, badgeCount: 0, badgeProgress: 0,
  current: null, blankIdx: 0, scrambled: [], tapInput: [], locked: false,
};

try {
  const s = JSON.parse(localStorage.getItem('sa_v1') || '{}');
  if (s.mode) st.mode = s.mode;
  if (s.wordLen !== undefined) st.wordLen = s.wordLen;
  if (s.grownup) st.grownup = s.grownup;
  if (s.wordsCorrect) st.wordsCorrect = s.wordsCorrect;
  if (s.badgeCount) st.badgeCount = s.badgeCount;
} catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }

function save() {
  try { localStorage.setItem('sa_v1', JSON.stringify({mode:st.mode,wordLen:st.wordLen,grownup:st.grownup,wordsCorrect:st.wordsCorrect,badgeCount:st.badgeCount})); } catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }
}

function pool() {
  return st.wordLen === 0 ? WORDS : WORDS.filter(x => x.w.length === st.wordLen);
}

function pick() {
  const p = pool().length ? pool() : WORDS;
  let w;
  do { w = p[Math.floor(Math.random() * p.length)]; }
  while (p.length > 1 && st.current && w.w === st.current.w);
  return w;
}

// ── FIX THE WORD ──────────────────────────────────────────
function startFix() {
  st.locked = false;
  st.current = pick();
  const word = st.current.w;

  const vowels = [...word].map((l,i) => 'AEIOU'.includes(l) ? i : -1).filter(i => i >= 0);
  const all    = [...word].map((_,i) => i);
  const cands  = vowels.length ? vowels : all;
  st.blankIdx  = cands[Math.floor(Math.random() * cands.length)];

  document.getElementById('wordEmoji').textContent = st.current.e;
  document.getElementById('modeLabel').textContent  = 'FIX THE WORD';
  document.getElementById('modeLabel').className    = 'mode-label';
  document.getElementById('modeSub').textContent    = 'Fix the Broken Word';
  document.getElementById('resultMsg').textContent  = '';

  const slotsEl = document.getElementById('wordSlots');
  slotsEl.innerHTML = '';
  for (let i = 0; i < word.length; i++) {
    const s = document.createElement('div');
    s.id = `sl${i}`;
    s.className = 'letter-slot' + (i === st.blankIdx ? ' blank' : '');
    s.textContent = i === st.blankIdx ? '_' : word[i];
    slotsEl.appendChild(s);
  }

  const correct = word[st.blankIdx];
  const alpha   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== correct);
  const opts    = [correct, ...alpha.sort(() => Math.random()-0.5).slice(0,3)].sort(() => Math.random()-0.5);

  const choicesEl = document.getElementById('choices');
  choicesEl.innerHTML = '';
  opts.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = letter;
    btn.addEventListener('click', () => {
      if (st.locked) return;
      if (letter === correct) {
        st.locked = true;
        const slot = document.getElementById(`sl${st.blankIdx}`);
        slot.textContent = letter;
        slot.className = 'letter-slot correct';
        document.getElementById('resultMsg').textContent = '⚡ Hero! Word saved!';
        choicesEl.querySelectorAll('button').forEach(b => b.disabled = true);
        onCorrect();
      } else {
        document.getElementById(`sl${st.blankIdx}`).classList.add('shake');
        setTimeout(() => document.getElementById(`sl${st.blankIdx}`).classList.remove('shake'), 440);
        document.getElementById('resultMsg').textContent = 'Not quite — try again!';
        btn.disabled = true;
      }
    });
    choicesEl.appendChild(btn);
  });
}

// ── VILLAIN MIX-UP ────────────────────────────────────────
function startMixUp() {
  st.locked  = false;
  st.tapInput = [];
  st.current  = pick();
  const word  = st.current.w;

  let scrambled;
  do { scrambled = [...word].sort(() => Math.random()-0.5); }
  while (scrambled.join('') === word && word.length > 1);
  st.scrambled = scrambled;

  document.getElementById('wordEmoji').textContent = st.current.e;
  document.getElementById('modeLabel').textContent  = 'VILLAIN MIX-UP!';
  document.getElementById('modeLabel').className    = 'mode-label villain';
  document.getElementById('modeSub').textContent    = 'Unscramble the word';
  document.getElementById('resultMsg').textContent  = 'Tap the letters in order!';

  const slotsEl = document.getElementById('wordSlots');
  slotsEl.innerHTML = '';
  for (let i = 0; i < word.length; i++) {
    const s = document.createElement('div');
    s.id = `sl${i}`;
    s.className = 'letter-slot blank';
    slotsEl.appendChild(s);
  }

  const choicesEl = document.getElementById('choices');
  choicesEl.innerHTML = '';
  scrambled.forEach((letter, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.id = `sc${idx}`;
    btn.textContent = letter;
    btn.addEventListener('click', () => {
      if (st.locked || btn.classList.contains('used')) return;
      const pos      = st.tapInput.length;
      const expected = word[pos];
      if (letter === expected) {
        st.tapInput.push(letter);
        document.getElementById(`sl${pos}`).textContent  = letter;
        document.getElementById(`sl${pos}`).className    = 'letter-slot filled-pending';
        btn.classList.add('used');
        document.getElementById('resultMsg').textContent = '';
        if (st.tapInput.length === word.length) {
          st.locked = true;
          document.querySelectorAll('.letter-slot').forEach(s => s.className = 'letter-slot correct');
          document.getElementById('resultMsg').textContent = '⚡ Hero! Unscrambled!';
          onCorrect();
        }
      } else {
        document.getElementById('resultMsg').textContent = 'Oops! Start from the beginning!';
        document.querySelectorAll('.letter-slot').forEach(s => { s.classList.add('shake'); setTimeout(() => { s.classList.remove('shake'); s.textContent = ''; s.className = 'letter-slot blank'; }, 440); });
        document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('used'));
        st.tapInput = [];
      }
    });
    choicesEl.appendChild(btn);
  });
}

// ── REWARD ────────────────────────────────────────────────
function onCorrect() {
  st.wordsCorrect++;
  st.badgeProgress++;
  renderStars(st.badgeProgress);
  launchConfetti(st.grownup);
  const em = document.getElementById('wordEmoji');
  em.classList.add('bounce');
  setTimeout(() => em.classList.remove('bounce'), 550);

  if (st.badgeProgress >= 5) {
    st.badgeProgress = 0;
    st.badgeCount++;
    save();
    setTimeout(() => document.getElementById('badgeOverlay').classList.add('show'), 900);
  } else {
    save();
    setTimeout(() => { document.getElementById('resultMsg').textContent = ''; startRound(); }, 1100);
  }
}

function startRound() {
  if (st.mode === 'fix') startFix();
  else startMixUp();
}

// ── ADMIN ─────────────────────────────────────────────────
function syncAdminUI() {
  document.querySelectorAll('.mode-opt').forEach(b => b.classList.toggle('active', b.dataset.mode === st.mode));
  document.querySelectorAll('.len-opt').forEach(b => b.classList.toggle('active', parseInt(b.dataset.len) === st.wordLen));
  document.getElementById('statWords').textContent  = st.wordsCorrect;
  document.getElementById('statBadges').textContent = st.badgeCount;
  syncGrownupBtn(st.grownup);
}

document.getElementById('adminBtn').addEventListener('click', () => openGate(() => {
  syncAdminUI();
  openModal(document.getElementById('adminOverlay'), {returnFocus: document.getElementById('adminBtn'), onClose: startRound});
}));
document.getElementById('closeAdminBtn').addEventListener('click', () => closeModal(document.getElementById('adminOverlay')));
document.getElementById('grownupToggleBtn').addEventListener('click', () => { st.grownup = !st.grownup; syncGrownupBtn(st.grownup); });
document.querySelectorAll('.mode-opt').forEach(b => b.addEventListener('click', () => { st.mode = b.dataset.mode; syncAdminUI(); }));
document.querySelectorAll('.len-opt').forEach(b => b.addEventListener('click', () => { st.wordLen = parseInt(b.dataset.len); syncAdminUI(); }));
document.getElementById('skipBtn').addEventListener('click', () => { st.locked = false; startRound(); });
document.getElementById('keepPlayingBtn').addEventListener('click', () => { document.getElementById('badgeOverlay').classList.remove('show'); startRound(); });

// ── BOOT ──────────────────────────────────────────────────
syncGrownupBtn(st.grownup);
renderStars(st.badgeProgress);
startRound();
