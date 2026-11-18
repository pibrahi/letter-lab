/* global openModal, closeModal */
const WORDS_LIB = typeof LAB_WORDS !== 'undefined' ? LAB_WORDS : require('../_shared/words.js');
const ANIMALS = WORDS_LIB.pick('memoryAnimals');
const MODES = {picture:'Picture Pairs', word:'Picture & Word', letter:'Big & Little'};

function shuffle(items, rng = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildDeck(mode, pairs, rng = Math.random) {
  if (!Object.hasOwn(MODES, mode) || ![3,4,6].includes(pairs)) throw new RangeError('Invalid board settings');
  const pool = mode === 'letter' ? [...'ABCDEFGHJKMNPQRSTUVWXYZ'] : ANIMALS;
  const cards = shuffle(pool, rng).slice(0, pairs).flatMap(item => {
    if (mode === 'letter') return [
      {pairId:item, face:item, label:`uppercase ${item}`, kind:'letter'},
      {pairId:item, face:item.toLowerCase(), label:`lowercase ${item.toLowerCase()}`, kind:'letter'},
    ];
    const picture = {pairId:item.w, face:item.e, label:`picture of ${/^[AEIOU]/.test(item.w) ? 'an' : 'a'} ${item.w.toLowerCase()}`, kind:'picture'};
    return [picture, mode === 'word' ? {pairId:item.w, face:item.w, label:item.w, kind:'word'} : {...picture}];
  });
  return shuffle(cards, rng);
}

function isMatch(a, b) { return a !== b && a.pairId === b.pairId; }
// Generous thresholds: a perfect board (turns === pairs) is mostly luck, so 3 stars = up to 2 turns per pair.
function calculateStars(turns, pairs) { return turns <= pairs * 2 ? 3 : turns <= pairs * 3 ? 2 : 1; }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {shuffle, buildDeck, isMatch, calculateStars};
}

if (typeof document !== 'undefined') {
  const st = {mode:'picture', pairs:3, grownup:false, pairsFound:0, boardsCleared:0};
  try {
    const s = JSON.parse(localStorage.getItem('mm_v1') || '{}');
    if (s && Object.hasOwn(MODES, s.mode)) st.mode = s.mode;
    if (s && [3,4,6].includes(s.pairs)) st.pairs = s.pairs;
    st.grownup = s?.grownup === true;
    for (const key of ['pairsFound','boardsCleared']) {
      if (Number.isSafeInteger(s?.[key]) && s[key] >= 0) st[key] = s[key];
    }
  } catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }
  const el = id => document.getElementById(id);
  let deck, buttons, revealed = [], matched = new Set(), turns = 0, resetTimer;
  function save() {
    try { localStorage.setItem('mm_v1', JSON.stringify(st)); } catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }
  }
  function syncUI() {
    document.querySelectorAll('[data-mode]').forEach(b => {
      const active = b.dataset.mode === st.mode;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
    document.querySelectorAll('[data-pairs]').forEach(b => {
      const active = Number(b.dataset.pairs) === st.pairs;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
    syncGrownupBtn(st.grownup);
  }
  function updateCard(i, up) {
    const button = buttons[i];
    button.classList.toggle('flipped', up);
    button.classList.toggle('matched', matched.has(i));
    // aria-disabled (not disabled) so keyboard focus stays on the card after a match
    button.setAttribute('aria-disabled', matched.has(i));
    button.setAttribute('aria-label', `Card ${i + 1}, ${up ? deck[i].label : 'face down'}${matched.has(i) ? ', matched' : ''}`);
  }
  const gameView = document.querySelector('.view');
  function closeWin(returnFocus = true) {
    el('winPanel').hidden = true;
    gameView.inert = false;
    if (returnFocus) el('newBoardBtn').focus();
  }
  function openWin() {
    el('winPanel').hidden = false;
    gameView.inert = true;
    el('playAgainBtn').focus();
  }
  el('closeWinBtn').addEventListener('click', () => closeWin());
  el('winPanel').addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeWin();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const first = el('playAgainBtn');
      const last = el('closeWinBtn');
      (document.activeElement === first ? last : document.activeElement === last ? first : e.shiftKey ? last : first).focus();
    }
  });
  function reveal(i) {
    if (revealed.length === 2 || matched.has(i) || revealed.includes(i)) return;
    revealed.push(i);
    updateCard(i, true);
    if (revealed.length < 2) return;
    turns++;
    el('turns').textContent = turns;
    const [a,b] = revealed;
    if (isMatch(deck[a], deck[b])) {
      matched.add(a); matched.add(b);
      updateCard(a, true); updateCard(b, true);
      revealed = [];
      st.pairsFound++;
      el('found').textContent = matched.size / 2;
      el('announcement').textContent = 'Match! You found a pair.';
      if (matched.size === deck.length) {
        st.boardsCleared++;
        const stars = calculateStars(turns, st.pairs);
        el('winStars').textContent = '⭐'.repeat(stars);
        el('winStars').setAttribute('aria-label', `${stars} stars`);
        el('winTurns').textContent = `You found all ${st.pairs} pairs in ${turns} turns!`;
        openWin();
        el('announcement').textContent = `Board cleared! ${stars} stars in ${turns} turns.`;
        launchConfetti(st.grownup);
      }
      save();
    } else {
      el('announcement').textContent = 'No match. Try another pair!';
      resetTimer = setTimeout(() => {
        updateCard(a, false); updateCard(b, false);
        revealed = [];
      }, 900);
    }
  }
  function newBoard() {
    clearTimeout(resetTimer);
    deck = buildDeck(st.mode, st.pairs);
    revealed = []; matched = new Set(); turns = 0;
    el('turns').textContent = '0'; el('found').textContent = '0';
    el('totalPairs').textContent = st.pairs;
    el('modeSub').textContent = MODES[st.mode];
    closeWin(false);
    el('announcement').textContent = 'New board. Find the matching pairs!';
    el('board').classList.remove('pairs-3', 'pairs-4', 'pairs-6');
    el('board').classList.add(`pairs-${st.pairs}`);
    el('board').replaceChildren();
    buttons = deck.map((card, i) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = `memory-card kind-${card.kind}`;
      const inner = document.createElement('span'); inner.className = 'card-inner';
      const back = document.createElement('span'); back.className = 'card-back'; back.textContent = '?';
      const face = document.createElement('span'); face.className = 'card-face'; face.textContent = card.face;
      inner.setAttribute('aria-hidden', 'true');
      inner.append(back, face); button.appendChild(inner);
      button.addEventListener('click', () => reveal(i));
      el('board').appendChild(button);
      return button;
    });
    buttons.forEach((b,i) => updateCard(i, false));
    syncUI(); save();
  }
  el('adminBtn').addEventListener('click', () => openGate(() => {
    syncUI(); openModal(el('adminOverlay'), {focus: el('closeAdminBtn'), returnFocus: el('adminBtn')});
  }));
  function closeAdmin() { closeModal(el('adminOverlay')); }
  el('closeAdminBtn').addEventListener('click', closeAdmin);
  el('grownupToggleBtn').addEventListener('click', () => {
    st.grownup = !st.grownup; syncUI(); save();
  });
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    st.mode = b.dataset.mode; newBoard();
  }));
  document.querySelectorAll('[data-pairs]').forEach(b => b.addEventListener('click', () => {
    st.pairs = Number(b.dataset.pairs); newBoard();
  }));
  el('newBoardBtn').addEventListener('click', newBoard);
  el('playAgainBtn').addEventListener('click', () => { newBoard(); buttons[0].focus(); });
  newBoard();
}
