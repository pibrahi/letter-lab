(function () {
  const data = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Puzzle Words",
  "url": "https://letterlab.cc/puzzle-words/",
  "description": "Drop letter tiles into place, finish picture sentences, and find rhyming words.",
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

// ── WORD BANKS ─────────────────────────────────────────────
const TILE_WORDS = [
  {w:'CAT',e:'🐱'},{w:'DOG',e:'🐶'},{w:'FOX',e:'🦊'},{w:'BEE',e:'🐝'},
  {w:'OWL',e:'🦉'},{w:'SUN',e:'☀️'},{w:'HAT',e:'🎩'},{w:'CUP',e:'☕'},
  {w:'BOX',e:'📦'},{w:'BUS',e:'🚌'},{w:'CAR',e:'🚗'},{w:'MAP',e:'🗺️'},
  {w:'BEAR',e:'🐻'},{w:'DUCK',e:'🦆'},{w:'FISH',e:'🐟'},{w:'FROG',e:'🐸'},
  {w:'LION',e:'🦁'},{w:'STAR',e:'⭐'},{w:'MOON',e:'🌙'},{w:'CAKE',e:'🎂'},
  {w:'BIRD',e:'🐦'},{w:'CRAB',e:'🦀'},{w:'RAIN',e:'🌧️'},{w:'BOOK',e:'📚'},
  {w:'TIGER',e:'🐯'},{w:'HORSE',e:'🐴'},{w:'APPLE',e:'🍎'},{w:'GRAPE',e:'🍇'},
  {w:'PIZZA',e:'🍕'},{w:'EAGLE',e:'🦅'},{w:'PANDA',e:'🐼'},{w:'TRAIN',e:'🚂'},
];

const SENTENCES = [
  {s:'The ___ can fly.',       a:{w:'Bird',  e:'🐦'}, d:[{w:'Fish', e:'🐟'},{w:'Pig',  e:'🐷'}]},
  {s:'The ___ can swim.',      a:{w:'Fish',  e:'🐟'}, d:[{w:'Cat',  e:'🐱'},{w:'Hen',  e:'🐔'}]},
  {s:'The ___ says moo.',      a:{w:'Cow',   e:'🐮'}, d:[{w:'Dog',  e:'🐶'},{w:'Fox',  e:'🦊'}]},
  {s:'The ___ makes honey.',   a:{w:'Bee',   e:'🐝'}, d:[{w:'Ant',  e:'🐜'},{w:'Owl',  e:'🦉'}]},
  {s:'The ___ has stripes.',   a:{w:'Tiger', e:'🐯'}, d:[{w:'Duck', e:'🦆'},{w:'Bear', e:'🐻'}]},
  {s:'The ___ lives in a hive.',a:{w:'Bee',  e:'🐝'}, d:[{w:'Fish', e:'🐟'},{w:'Frog', e:'🐸'}]},
  {s:'The ___ hops.',          a:{w:'Frog',  e:'🐸'}, d:[{w:'Lion', e:'🦁'},{w:'Cow',  e:'🐮'}]},
  {s:'The ___ is the biggest.', a:{w:'Whale',e:'🐋'}, d:[{w:'Bee',  e:'🐝'},{w:'Ant',  e:'🐜'}]},
  {s:'The ___ has black and white stripes.',a:{w:'Zebra',e:'🦓'},d:[{w:'Lion',e:'🦁'},{w:'Bear',e:'🐻'}]},
  {s:'You bake a ___ for a birthday.',a:{w:'Cake',e:'🎂'},d:[{w:'Fish',e:'🐟'},{w:'Book',e:'📚'}]},
  {s:'You ride on a ___.',     a:{w:'Train', e:'🚂'}, d:[{w:'Apple',e:'🍎'},{w:'Moon', e:'🌙'}]},
  {s:'The ___ shines at night.',a:{w:'Moon', e:'🌙'}, d:[{w:'Duck', e:'🦆'},{w:'Cake', e:'🎂'}]},
  {s:'The ___ is a big sea animal.',a:{w:'Whale',e:'🐋'},d:[{w:'Bee',e:'🐝'},{w:'Fox',e:'🦊'}]},
  {s:'You eat a ___ for a snack.',a:{w:'Apple',e:'🍎'},d:[{w:'Frog',e:'🐸'},{w:'Star',e:'⭐'}]},
  {s:'The ___ twinkles in the sky.',a:{w:'Star',e:'⭐'},d:[{w:'Pig',e:'🐷'},{w:'Cake',e:'🎂'}]},
];

const RHYMES = [
  {p:{w:'CAT', e:'🐱'}, a:{w:'BAT',   e:'🦇'}, d:[{w:'DOG',   e:'🐶'},{w:'BEE',  e:'🐝'}]},
  {p:{w:'DOG', e:'🐶'}, a:{w:'LOG',   e:'🪵'}, d:[{w:'CAT',   e:'🐱'},{w:'HEN',  e:'🐔'}]},
  {p:{w:'BEE', e:'🐝'}, a:{w:'TREE',  e:'🌳'}, d:[{w:'PIG',   e:'🐷'},{w:'COW',  e:'🐮'}]},
  {p:{w:'HEN', e:'🐔'}, a:{w:'PEN',   e:'✏️'}, d:[{w:'FOX',   e:'🦊'},{w:'BEE',  e:'🐝'}]},
  {p:{w:'BEAR',e:'🐻'}, a:{w:'PEAR',  e:'🍐'}, d:[{w:'FISH',  e:'🐟'},{w:'DUCK', e:'🦆'}]},
  {p:{w:'FISH',e:'🐟'}, a:{w:'DISH',  e:'🍽️'}, d:[{w:'BEAR',  e:'🐻'},{w:'FROG', e:'🐸'}]},
  {p:{w:'DUCK',e:'🦆'}, a:{w:'TRUCK', e:'🚚'}, d:[{w:'LION',  e:'🦁'},{w:'BEAR', e:'🐻'}]},
  {p:{w:'STAR',e:'⭐'}, a:{w:'CAR',   e:'🚗'}, d:[{w:'MOON',  e:'🌙'},{w:'FISH', e:'🐟'}]},
  {p:{w:'SUN', e:'☀️'}, a:{w:'BUN',   e:'🍞'}, d:[{w:'MOON',  e:'🌙'},{w:'RAIN', e:'🌧️'}]},
  {p:{w:'MOON',e:'🌙'}, a:{w:'SPOON', e:'🥄'}, d:[{w:'STAR',  e:'⭐'},{w:'SUN',  e:'☀️'}]},
  {p:{w:'CAKE',e:'🎂'}, a:{w:'SNAKE', e:'🐍'}, d:[{w:'DUCK',  e:'🦆'},{w:'BEAR', e:'🐻'}]},
  {p:{w:'FROG',e:'🐸'}, a:{w:'LOG',   e:'🪵'}, d:[{w:'DUCK',  e:'🦆'},{w:'CAT',  e:'🐱'}]},
  {p:{w:'WHALE',e:'🐋'},a:{w:'SNAIL', e:'🐌'}, d:[{w:'SHARK', e:'🦈'},{w:'BEAR', e:'🐻'}]},
  {p:{w:'SNAKE',e:'🐍'},a:{w:'CAKE',  e:'🎂'}, d:[{w:'BEAR',  e:'🐻'},{w:'FROG', e:'🐸'}]},
  {p:{w:'TRAIN',e:'🚂'},a:{w:'RAIN',  e:'🌧️'}, d:[{w:'STAR',  e:'⭐'},{w:'MOON', e:'🌙'}]},
];

// ── STATE ──────────────────────────────────────────────────
const st = {
  mode: 'tiledrop', grownup: false,
  solved: 0, streak: 0, badgeProgress: 0,
  current: null, tapInput: [], locked: false,
  sentIdx: -1, rhymeIdx: -1,
};

try {
  const s = JSON.parse(localStorage.getItem('pw_v1') || '{}');
  if (s.mode)    st.mode    = s.mode;
  if (s.grownup) st.grownup = s.grownup;
  if (s.solved)  st.solved  = s.solved;
  if (s.streak)  st.streak  = s.streak;
} catch(e) {}

function save() {
  try { localStorage.setItem('pw_v1', JSON.stringify({mode:st.mode,grownup:st.grownup,solved:st.solved,streak:st.streak})); } catch(e) {}
}

function hideAll() {
  ['bigEmoji','puzzleSlots','rhymePrompt','sentenceDisplay','tileBtns','pictureOptions']
    .forEach(id => document.getElementById(id).style.display = 'none');
}

// ── TILE DROP ─────────────────────────────────────────────
function startTileDrop() {
  st.locked   = false;
  st.tapInput = [];
  const pool  = TILE_WORDS.filter(x => !st.current || x.w !== st.current.w);
  st.current  = pool[Math.floor(Math.random() * pool.length)];
  const word  = st.current.w;
  hideAll();
  document.getElementById('bigEmoji').style.display    = 'block';
  document.getElementById('bigEmoji').textContent      = st.current.e;
  document.getElementById('puzzleSlots').style.display = 'flex';
  document.getElementById('tileBtns').style.display    = 'flex';
  document.getElementById('modeLabel').textContent     = 'TILE DROP';
  document.getElementById('modeSub').textContent       = 'Tile Drop';
  document.getElementById('resultMsg').textContent     = 'Tap tiles to fill the blanks!';

  // Pick 1 or 2 blank positions
  const numBlanks = word.length >= 4 ? 2 : 1;
  const positions = [...Array(word.length).keys()].sort(() => Math.random()-0.5).slice(0, numBlanks);
  const blanks    = new Set(positions);
  st.blanks       = [...blanks].sort((a,b) => a-b);
  st.blankQueue   = [...st.blanks];

  const slotsEl = document.getElementById('puzzleSlots');
  slotsEl.innerHTML = '';
  for (let i = 0; i < word.length; i++) {
    const s = document.createElement('div');
    s.className = blanks.has(i) ? 'puzzle-slot blank' : 'puzzle-slot';
    s.id = `ps${i}`;
    s.textContent = blanks.has(i) ? '' : word[i];
    slotsEl.appendChild(s);
  }

  // Correct tiles + distractors
  const correctLetters = st.blanks.map(i => word[i]);
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const distractors = alpha.filter(l => !correctLetters.includes(l)).sort(() => Math.random()-0.5).slice(0, 3);
  const tiles = [...correctLetters, ...distractors].sort(() => Math.random()-0.5);

  const tilesEl = document.getElementById('tileBtns');
  tilesEl.innerHTML = '';
  tiles.forEach((letter, idx) => {
    const btn = document.createElement('button');
    btn.className   = 'tile-btn';
    btn.id          = `tb${idx}`;
    btn.textContent = letter;
    btn.addEventListener('click', () => {
      if (st.locked || !st.blankQueue.length) return;
      const targetPos = st.blankQueue[0];
      const expected  = word[targetPos];
      if (letter === expected) {
        st.blankQueue.shift();
        const slot = document.getElementById(`ps${targetPos}`);
        slot.textContent = letter;
        slot.className   = 'puzzle-slot correct';
        btn.classList.add('used');
        document.getElementById('resultMsg').textContent = '';
        if (!st.blankQueue.length) {
          st.locked = true;
          document.getElementById('resultMsg').textContent = '🧩 Puzzle solved!';
          onCorrect();
        }
      } else {
        const slot = document.getElementById(`ps${targetPos}`);
        slot.classList.add('shake');
        setTimeout(() => slot.classList.remove('shake'), 440);
        document.getElementById('resultMsg').textContent = 'That tile doesn\'t fit here!';
        btn.disabled = true;
        setTimeout(() => { btn.disabled = false; }, 800);
      }
    });
    tilesEl.appendChild(btn);
  });
}

// ── FINISH THE SENTENCE ───────────────────────────────────
function startSentence() {
  st.locked = false;
  let idx;
  do { idx = Math.floor(Math.random() * SENTENCES.length); } while (idx === st.sentIdx && SENTENCES.length > 1);
  st.sentIdx = idx;
  const q = SENTENCES[idx];
  hideAll();
  document.getElementById('bigEmoji').style.display       = 'none';
  document.getElementById('sentenceDisplay').style.display = 'block';
  document.getElementById('pictureOptions').style.display  = 'flex';
  document.getElementById('modeLabel').textContent         = 'FINISH THE SENTENCE';
  document.getElementById('modeSub').textContent           = 'Finish the Sentence';
  document.getElementById('resultMsg').textContent         = '';

  const filled = q.s.replace('___', `<span class="sentence-blank">___</span>`);
  document.getElementById('sentenceDisplay').innerHTML = filled;

  const opts = [q.a, ...q.d].sort(() => Math.random()-0.5);
  const el   = document.getElementById('pictureOptions');
  el.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'picture-opt';
    btn.innerHTML = `<span class="opt-emoji">${opt.e}</span><span class="opt-word">${opt.w}</span>`;
    btn.addEventListener('click', () => {
      if (st.locked) return;
      if (opt.w === q.a.w) {
        st.locked = true;
        btn.classList.add('correct-flash');
        el.querySelectorAll('button').forEach(b => b.disabled = true);
        const filled2 = q.s.replace('___', `<span class="sentence-blank">${opt.e} ${opt.w}</span>`);
        document.getElementById('sentenceDisplay').innerHTML = filled2;
        document.getElementById('resultMsg').textContent = '🧩 That\'s right!';
        onCorrect();
      } else {
        btn.classList.add('wrong-flash');
        setTimeout(() => btn.classList.remove('wrong-flash'), 500);
        btn.disabled = true;
        document.getElementById('resultMsg').textContent = 'Not quite — try another!';
      }
    });
    el.appendChild(btn);
  });
}

// ── RHYME TIME ────────────────────────────────────────────
function startRhyme() {
  st.locked = false;
  let idx;
  do { idx = Math.floor(Math.random() * RHYMES.length); } while (idx === st.rhymeIdx && RHYMES.length > 1);
  st.rhymeIdx = idx;
  const q = RHYMES[idx];
  hideAll();
  document.getElementById('rhymePrompt').style.display   = 'flex';
  document.getElementById('pictureOptions').style.display = 'flex';
  document.getElementById('modeLabel').textContent        = 'RHYME TIME';
  document.getElementById('modeSub').textContent          = 'Rhyme Time';
  document.getElementById('resultMsg').textContent        = '';

  document.getElementById('rhymePrompt').innerHTML =
    `<div class="rhyme-word">${q.p.e} ${q.p.w}</div>
     <div class="rhyme-sub">Which word rhymes with <strong>${q.p.w}</strong>?</div>`;

  const opts = [q.a, ...q.d].sort(() => Math.random()-0.5);
  const el   = document.getElementById('pictureOptions');
  el.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'picture-opt';
    btn.innerHTML = `<span class="opt-emoji">${opt.e}</span><span class="opt-word">${opt.w}</span>`;
    btn.addEventListener('click', () => {
      if (st.locked) return;
      if (opt.w === q.a.w) {
        st.locked = true;
        btn.classList.add('correct-flash');
        el.querySelectorAll('button').forEach(b => b.disabled = true);
        document.getElementById('resultMsg').textContent = `🎵 Yes! ${q.p.w} and ${q.a.w} rhyme!`;
        onCorrect();
      } else {
        btn.classList.add('wrong-flash');
        setTimeout(() => btn.classList.remove('wrong-flash'), 500);
        btn.disabled = true;
        document.getElementById('resultMsg').textContent = 'Try another!';
      }
    });
    el.appendChild(btn);
  });
}

// ── REWARD ────────────────────────────────────────────────
function onCorrect() {
  st.solved++;
  st.streak++;
  st.badgeProgress++;
  renderStars(st.badgeProgress);
  launchConfetti(st.grownup);
  const em = document.getElementById('bigEmoji');
  if (em.style.display !== 'none') { em.classList.add('bounce'); setTimeout(() => em.classList.remove('bounce'), 550); }
  if (st.badgeProgress >= 5) {
    st.badgeProgress = 0;
    showToast('⭐ Puzzle Master badge earned!');
  }
  save();
  setTimeout(() => { document.getElementById('resultMsg').textContent = ''; startRound(); }, 1200);
}

function startRound() {
  if      (st.mode === 'tiledrop') startTileDrop();
  else if (st.mode === 'sentence') startSentence();
  else                             startRhyme();
}

// ── ADMIN ─────────────────────────────────────────────────
function syncAdminUI() {
  document.querySelectorAll('.mode-opt').forEach(b => b.classList.toggle('active', b.dataset.mode === st.mode));
  document.getElementById('statSolved').textContent = st.solved;
  document.getElementById('statStreak').textContent = st.streak;
  syncGrownupBtn(st.grownup);
}

document.getElementById('adminBtn').addEventListener('click', () => openGate(() => {
  syncAdminUI();
  document.getElementById('adminOverlay').classList.add('show');
}));
document.getElementById('closeAdminBtn').addEventListener('click', () => {
  document.getElementById('adminOverlay').classList.remove('show');
  startRound();
});
document.getElementById('adminOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('adminOverlay')) { document.getElementById('adminOverlay').classList.remove('show'); startRound(); }
});
document.getElementById('grownupToggleBtn').addEventListener('click', () => { st.grownup = !st.grownup; syncGrownupBtn(st.grownup); });
document.querySelectorAll('.mode-opt').forEach(b => b.addEventListener('click', () => { st.mode = b.dataset.mode; syncAdminUI(); }));
document.getElementById('skipBtn').addEventListener('click', () => { st.locked = false; startRound(); });

// ── BOOT ──────────────────────────────────────────────────
syncGrownupBtn(st.grownup);
renderStars(st.badgeProgress);
startRound();
