(function () {
  const data = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Letter Lab",
  "url": "https://letterlab.cc/letter-lab/",
  "description": "Guess the hidden word one letter at a time, with progressive hints.",
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
    "suggestedMaxAge": "8"
  }
};
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
})();

// =====================================================================
//  WORD BANK — fresh child-friendly words with 3-level progressive hints
//  hints[0] = vague (after guess 1)
//  hints[1] = clearer (after guess 3)
//  hints[2] = specific (after guess 5)
// =====================================================================
const DEFAULT_WORD_BANK = [
  // ── 4-LETTER WORDS ──
  { word:"BALL", hints:["Something you play with","Round and bouncy","A round toy you throw, kick, or catch ⚽"] },
  { word:"BEAR", hints:["A wild animal","Big and furry, loves the forest","A large furry animal that loves honey 🐻"] },
  { word:"BIRD", hints:["A creature that sings","Has wings and feathers","A feathered animal that can fly 🐦"] },
  { word:"BOAT", hints:["Something that travels on water","Smaller than a ship","A vessel you ride on water ⛵"] },
  { word:"BOOK", hints:["Something you can hold and enjoy","Has pages inside","Pages full of words and stories 📚"] },
  { word:"CAKE", hints:["Something delicious at a party","Sweet and often has frosting","A sweet baked treat with candles 🎂"] },
  { word:"CATS", hints:["You might find these in a home","They purr when happy","Fluffy pets that meow and purr 🐱"] },
  { word:"CHIP", hints:["A small, thin snack","Crispy and salty","A crunchy salted snack from a bag 🥔"] },
  { word:"CRAB", hints:["Lives near the sea","Walks sideways","A sea creature with claws that walks sideways 🦀"] },
  { word:"DOOR", hints:["Part of a room","You open it to move between spaces","A panel you open to walk through 🚪"] },
  { word:"DRUM", hints:["A musical instrument","You need sticks to play it","A musical instrument you bang with sticks 🥁"] },
  { word:"DUCK", hints:["A water bird","Loves ponds and puddles","A bird that swims and says quack 🦆"] },
  { word:"FARM", hints:["A place in the countryside","Animals live here","A place with fields and animals 🐄"] },
  { word:"FIRE", hints:["Hot and bright","Can keep you warm","Flickering orange flames that give heat 🔥"] },
  { word:"FISH", hints:["Lives in water","Has scales and fins","A scaly creature that swims underwater 🐟"] },
  { word:"FLAG", hints:["Flies in the wind","Represents something important","A piece of fabric on a pole representing a country 🏳️"] },
  { word:"FROG", hints:["A small creature near water","Jumps really far","A green jumpy animal that says ribbit 🐸"] },
  { word:"GIFT", hints:["Something special","Wrapped up with a bow","A present you give someone on a special day 🎁"] },
  { word:"GLUE", hints:["Used for making things","Sticky and gooey","A sticky liquid that holds things together"] },
  { word:"GOLD", hints:["A shiny colour","Very valuable","A precious shiny yellow metal 🌟"] },
  { word:"HILL", hints:["Part of the landscape","Like a small mountain","A rounded bump in the ground you can climb ⛰️"] },
  { word:"HIVE", hints:["Home to many insects","Has honeycombs inside","Where bees live and make honey 🍯"] },
  { word:"JUMP", hints:["A movement","Your feet leave the ground","To spring up off the ground 🦘"] },
  { word:"KITE", hints:["A flying toy","You hold a string to control it","A colourful toy that flies in the wind 🪁"] },
  { word:"LAMB", hints:["A baby animal","Soft and woolly","A fluffy baby sheep 🐑"] },
  { word:"LEAF", hints:["Found outside","Grows on plants","A flat green part of a tree or plant 🍃"] },
  { word:"LION", hints:["A powerful wild animal","Lives in hot grasslands","The king of the jungle with a big mane 🦁"] },
  { word:"MILK", hints:["A white drink","Good for your bones","A creamy white drink from cows 🥛"] },
  { word:"MOLE", hints:["A small animal","Lives underground","A tiny furry animal that digs tunnels underground"] },
  { word:"MOON", hints:["Visible at night","Glows in the dark sky","The bright round light in the night sky 🌙"] },
  { word:"NEST", hints:["An animal's home","Found in trees","A cosy home birds build from twigs 🪺"] },
  { word:"PEAR", hints:["A fruit","Green or yellow shape","A sweet green or yellow fruit 🍐"] },
  { word:"PLUM", hints:["A fruit","Dark reddish colour","A small juicy dark purple fruit 🫐"] },
  { word:"POND", hints:["An outdoor place","Has water and maybe ducks","A small body of still water 🦆"] },
  { word:"RAIN", hints:["A type of weather","Falls from clouds","Water that falls from the sky in drops 🌧️"] },
  { word:"RING", hints:["A circular shape","Worn on a finger","A small circular band worn as jewellery 💍"] },
  { word:"ROCK", hints:["Found outdoors","Hard and solid","A hard lump of stone 🪨"] },
  { word:"ROSE", hints:["A plant","Has a lovely smell","A beautiful flower with thorns on its stem 🌹"] },
  { word:"SAIL", hints:["Used on water","Catches the wind","A large cloth on a boat that catches the wind ⛵"] },
  { word:"SAND", hints:["Found at the beach","Tiny tiny grains","Fine grains you find on beaches or in deserts 🏖️"] },
  { word:"SEED", hints:["Something very small","Grows into a plant","A tiny thing you plant in soil to grow 🌱"] },
  { word:"SHIP", hints:["Travels on water","Much bigger than a boat","A large vessel that sails the ocean 🚢"] },
  { word:"SING", hints:["Something you do with your voice","Sounds musical","To make music using your voice 🎵"] },
  { word:"SNOW", hints:["A type of weather","White and cold","Soft white frozen flakes that fall in winter ❄️"] },
  { word:"SOCK", hints:["Something you wear","Goes on before your shoes","A soft fabric covering you put on your foot 🧦"] },
  { word:"STAR", hints:["Seen at night","Twinkles in the sky","A tiny point of light in the night sky ⭐"] },
  { word:"SWAN", hints:["A bird","Elegant and white","A graceful white bird with a long neck 🦢"] },
  { word:"TAIL", hints:["Part of an animal","At the back end","The part that sticks out at the back of an animal 🐶"] },
  { word:"TREE", hints:["A large plant","Has a trunk and branches","A tall plant with a trunk, branches, and leaves 🌳"] },
  { word:"WOLF", hints:["A wild animal","Related to dogs","A wild animal that howls at the moon 🐺"] },
  { word:"WORM", hints:["A tiny creature","Wriggles underground","A long wiggly creature that lives in soil 🪱"] },
  // ── 5-LETTER WORDS ──
  { word:"ACORN", hints:["Something small found outside","Falls from trees in autumn","A small nut that grows on oak trees 🌰"] },
  { word:"ANGEL", hints:["A character in stories","Has wings and is kind","A heavenly being with wings and a halo 😇"] },
  { word:"APPLE", hints:["Something in a lunchbox","A fruit that grows on trees","A crunchy red or green fruit 🍎"] },
  { word:"BADGE", hints:["Something you can earn","Often pinned to clothing","A small pin or patch awarded for an achievement 🏅"] },
  { word:"BEACH", hints:["A place to visit in summer","Sandy and near water","A sandy shore next to the sea 🏖️"] },
  { word:"BREAD", hints:["A food","Made in an oven","A baked food made from flour and water 🍞"] },
  { word:"BRUSH", hints:["A tool","Has bristles on the end","A tool with bristles used to clean or paint 🖌️"] },
  { word:"BUNNY", hints:["A fluffy pet","Has long ears","A small furry animal with long ears that hops 🐰"] },
  { word:"CANDY", hints:["A sweet treat","Comes in lots of colours","A small sweet sugary snack 🍬"] },
  { word:"CHAIR", hints:["Furniture","You sit on it","A piece of furniture with legs that you sit on 🪑"] },
  { word:"CHASE", hints:["An action","Running after something","To run after someone or something quickly"] },
  { word:"CHESS", hints:["A game","Uses a chequered board","A strategy board game with pieces like kings and knights ♟️"] },
  { word:"CHICK", hints:["A baby animal","Fluffy and yellow","A newly hatched baby bird 🐣"] },
  { word:"CHIPS", hints:["A popular food","Cooked potato","Hot fried potato slices or strips 🍟"] },
  { word:"CLOWN", hints:["A performer","Wears silly clothes","A funny entertainer with a big red nose 🤡"] },
  { word:"CLOUD", hints:["Something in the sky","White and fluffy or grey","A fluffy white or grey mass of water vapour ☁️"] },
  { word:"CORAL", hints:["Found in the sea","Colourful and ocean-related","A colourful structure found in tropical seas 🪸"] },
  { word:"CRANE", hints:["Could be a bird or a machine","Tall and long-necked","A large bird with long legs — or a machine that lifts things 🏗️"] },
  { word:"DANCE", hints:["Something you do to music","Involves moving your body","To move your body in rhythm to music 💃"] },
  { word:"DAISY", hints:["Something pretty outdoors","A type of flower","A small white flower with a yellow centre 🌼"] },
  { word:"EAGLE", hints:["A large bird","Known for sharp eyesight","A powerful bird of prey that soars high 🦅"] },
  { word:"FAIRY", hints:["A magical character","Tiny with wings","A tiny magical creature from stories 🧚"] },
  { word:"FLAME", hints:["Bright and warm","You see this on a candle","The glowing orange part of a fire 🔥"] },
  { word:"FLUTE", hints:["Something musical","You blow into it","A thin musical instrument you play by blowing across a hole 🎵"] },
  { word:"FUDGE", hints:["A food","Sweet and soft","A soft chewy sweet made from butter and sugar 🍫"] },
  { word:"GIANT", hints:["Very big","A character in fairy tales","An enormous mythical person from fairy tales 🧌"] },
  { word:"GLOBE", hints:["A round object","Shows where countries are","A sphere-shaped model of the Earth 🌍"] },
  { word:"GRAPE", hints:["A small fruit","Grows in bunches","A small round fruit that grows in clusters 🍇"] },
  { word:"HAPPY", hints:["A feeling","The opposite of sad","A wonderful feeling when everything is good 😄"] },
  { word:"HEART", hints:["A shape","Symbol of love","The organ that pumps blood — also a symbol of love ❤️"] },
  { word:"HONEY", hints:["Something sweet","Made by insects","A golden sweet liquid made by bees 🍯"] },
  { word:"HORSE", hints:["A large animal","You can ride it","A large animal kept on farms for riding 🐴"] },
  { word:"HOUSE", hints:["A building","People live here","A building where a family lives 🏡"] },
  { word:"IGLOO", hints:["A special building","Found in very cold places","A dome-shaped house made of snow and ice ❄️"] },
  { word:"JOKER", hints:["Someone funny","Makes people laugh","A person who loves to tell jokes and clown around 🃏"] },
  { word:"JUICE", hints:["A drink","Made from fruit","A sweet drink squeezed from fruit 🍹"] },
  { word:"KOALA", hints:["An animal","From Australia","A fluffy Australian animal that sleeps in eucalyptus trees 🐨"] },
  { word:"LEMON", hints:["A fruit","Very sour","A bright yellow citrus fruit with a sour taste 🍋"] },
  { word:"LIGHT", hints:["Opposite of dark","Helps you see","Energy that lets us see — like from a bulb or the sun 💡"] },
  { word:"LLAMA", hints:["A furry animal","Looks like a camel without a hump","A fluffy South American animal related to the camel 🦙"] },
  { word:"MAGIC", hints:["Something mysterious","Performed by a wizard","Tricks and spells that seem impossible ✨"] },
  { word:"MELON", hints:["A large fruit","Green on the outside, sweet inside","A big juicy fruit with orange or green flesh 🍈"] },
  { word:"MOUSE", hints:["A small animal","Lives in houses sometimes","A tiny furry rodent with a long tail 🐭"] },
  { word:"MUSIC", hints:["Something you listen to","Made of notes and rhythm","Sounds arranged into melodies and rhythms 🎵"] },
  { word:"NIGHT", hints:["The opposite of day","Stars come out","The dark part of the day when stars appear 🌙"] },
  { word:"OCEAN", hints:["A very large body of water","Covers much of the Earth","A vast salty sea that covers most of the planet 🌊"] },
  { word:"OTTER", hints:["An animal near water","Playful and furry","A cute furry animal that loves swimming in rivers 🦦"] },
  { word:"PANDA", hints:["A large animal","Black and white","A large black-and-white bear from China 🐼"] },
  { word:"PASTA", hints:["A food","Italian and filling","A popular Italian food made from flour and water 🍝"] },
  { word:"PENNY", hints:["Something small and round","Worth a little money","A small copper coin 🪙"] },
  { word:"PIANO", hints:["A musical instrument","Has black and white keys","A large instrument with keys that make music 🎹"] },
  { word:"PIZZA", hints:["A popular meal","Round and cheesy","A circular baked dish with cheese and toppings 🍕"] },
  { word:"PLANT", hints:["Something living","Needs water and sunlight","A living thing that grows in soil and needs sunlight 🌿"] },
  { word:"QUEEN", hints:["A royal person","Rules a kingdom","A female ruler who wears a crown 👑"] },
  { word:"ROBIN", hints:["A small garden bird","Often seen in winter","A small bird with a bright red chest 🐦"] },
  { word:"SHARK", hints:["A sea creature","Has lots of sharp teeth","A large fierce fish with sharp teeth 🦈"] },
  { word:"SHEEP", hints:["A farm animal","Gives us wool","A fluffy farm animal whose coat gives us wool 🐑"] },
  { word:"SHELL", hints:["Found at the beach","Used to protect something","A hard protective casing found on beaches or snails 🐚"] },
  { word:"SMILE", hints:["An expression","Shows you are happy","The curve your mouth makes when you feel joyful 😊"] },
  { word:"SNAIL", hints:["A slow creature","Carries its home on its back","A small slow creature with a spiral shell on its back 🐌"] },
  { word:"SNAKE", hints:["A long creature","No legs","A long reptile with no legs that slithers 🐍"] },
  { word:"SPACE", hints:["Far above us","Where stars and planets live","The vast dark universe beyond Earth's atmosphere 🚀"] },
  { word:"SPARK", hints:["A tiny bit of light","From fire or electricity","A tiny flash of light from a fire or electric charge ✨"] },
  { word:"SPOON", hints:["Cutlery","Used for soup or cereal","A rounded eating utensil for scooping liquid foods 🥄"] },
  { word:"STORK", hints:["A bird","Tall and white","A large white bird known for long migrations 🦢"] },
  { word:"STORM", hints:["Dramatic weather","Loud and powerful","A powerful weather event with wind, rain, or thunder ⛈️"] },
  { word:"SUGAR", hints:["Something sweet","Goes in cakes and drinks","A sweet white powder used in baking and drinks 🍬"] },
  { word:"SUNNY", hints:["A type of weather","Bright and warm","A bright warm day with lots of sunshine ☀️"] },
  { word:"SWEET", hints:["A taste","The opposite of sour","A pleasant sugary taste or a small candy 🍭"] },
  { word:"TIGER", hints:["A big wild cat","Has a striped coat","An orange and black striped big cat 🐯"] },
  { word:"TOAST", hints:["A food","Made in a toaster","Bread that has been browned by heat 🍞"] },
  { word:"TORCH", hints:["A light source","Hand-held","A handheld electric light you carry in the dark 🔦"] },
  { word:"TRAIN", hints:["A type of transport","Runs on rails","A vehicle that travels on railway tracks 🚂"] },
  { word:"TULIP", hints:["Something colourful","Found in gardens","A bright cup-shaped spring flower 🌷"] },
  { word:"VIOLA", hints:["Something musical","Played with a bow","A stringed instrument played with a bow, larger than a violin 🎻"] },
  { word:"WATER", hints:["Something essential","Comes from a tap or river","A clear liquid we drink and wash with 💧"] },
  { word:"WHALE", hints:["A giant sea creature","Breathes air","The largest animal on Earth that lives in the ocean 🐋"] },
  { word:"WITCH", hints:["A character in stories","Has a broomstick","A magical character from fairy tales who casts spells 🧙"] },
  { word:"ZEBRA", hints:["A wild animal","Related to a horse","A horse-like animal with black and white stripes 🦓"] },
];

// =====================================================================
//  STATE
// =====================================================================
let state = {
  wordBank:     JSON.parse(JSON.stringify(DEFAULT_WORD_BANK)),
  currentWord:  "",
  currentHints: [],
  wordLength:   5,
  hintsEnabled: true,
  grownup:      false,
  guidedMode:   false,
  guesses:      [],
  currentGuess: [],
  gameOver:     false,
  stats: { played: 0, won: 0, totalGuesses: 0, streak: 0 },
};

try {
  const saved = localStorage.getItem('letterLabState3');
  if (saved) {
    const p = JSON.parse(saved);
    state.wordBank     = p.wordBank     || state.wordBank;
    state.wordLength   = p.wordLength   || 5;
    state.hintsEnabled = p.hintsEnabled !== undefined ? p.hintsEnabled : true;
    state.grownup      = p.grownup      || false;
    state.guidedMode   = p.guidedMode   || false;
    state.stats        = p.stats        || state.stats;
  }
} catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }

function saveState() {
  try {
    localStorage.setItem('letterLabState3', JSON.stringify({
      wordBank: state.wordBank, wordLength: state.wordLength,
      hintsEnabled: state.hintsEnabled, grownup: state.grownup,
      guidedMode: state.guidedMode, stats: state.stats,
    }));
  } catch { /* Storage may be unavailable or contain invalid data; keep the fallback. */ }
}

// =====================================================================
//  GUIDED MODE — extract trailing emoji from hints[2]
// =====================================================================
function getWordEmoji(entry) {
  if (!entry || !entry.hints) return null;
  const hint = entry.hints[2] || entry.hints[1] || entry.hints[0] || '';
  const matches = [...hint.matchAll(/\p{Extended_Pictographic}/gu)];
  return matches.length ? matches[matches.length - 1][0] : null;
}

// =====================================================================
//  VIEW SWITCHING
// =====================================================================
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// =====================================================================
//  GROWNUP MODE
// =====================================================================
function applyLetterLabMode() {
  applyGrownup(state.grownup);
  const lbl = document.getElementById('grownupLabel');
  const dot = document.getElementById('grownupDot');
  const btn = document.getElementById('grownupToggleBtn');
  if (lbl) lbl.textContent = `Grownup mode: ${state.grownup ? 'ON' : 'OFF'}`;
  if (dot) dot.style.background = state.grownup ? '#52c4a0' : '#3d6050';
  if (btn) { btn.style.background = state.grownup ? 'rgba(64,130,109,0.2)' : 'rgba(255,255,255,0.05)'; btn.style.color = state.grownup ? '#52c4a0' : '#52a88e'; }
  let subText = 'Word Experiment';
  if (state.grownup)      subText = 'Grownup Mode — Active';
  else if (state.guidedMode) subText = '👶 Guided Mode — ON';
  document.getElementById('logoSub').textContent = subText;
}

function syncGuidedUI() {
  const lbl = document.getElementById('guidedLabel');
  const dot = document.getElementById('guidedDot');
  const btn = document.getElementById('guidedToggleBtn');
  if (!lbl) return;
  lbl.textContent = state.guidedMode ? 'Guided mode: ON — emoji shown 👶' : 'Guided mode: OFF';
  dot.style.background = state.guidedMode ? '#52c4a0' : '#3d6050';
  btn.style.background = state.guidedMode ? 'rgba(64,130,109,0.2)' : 'rgba(255,255,255,0.05)';
  btn.style.color      = state.guidedMode ? '#52c4a0' : '#52a88e';
}

function syncLenUI() {
  document.querySelectorAll('.len-opt').forEach(b => {
    const on = parseInt(b.dataset.len) === state.wordLength;
    b.style.background = on ? '#40826D' : 'rgba(255,255,255,0.05)';
    b.style.color      = on ? '#fff'    : '#52a88e';
    b.style.boxShadow  = on ? '0 2px 0 #2d6355' : 'none';
  });
}

// =====================================================================
//  GAME INIT
// =====================================================================
function getWordsByLength(len) { return state.wordBank.filter(w => w.word.length === len); }

function pickRandomWord() {
  const pool = getWordsByLength(state.wordLength);
  const src  = pool.length ? pool : DEFAULT_WORD_BANK.filter(w => w.word.length === state.wordLength);
  if (!src.length) return { word: state.wordLength === 4 ? "WORD" : "WORDS", hints: ["A word","A word","A word"] };
  return src[Math.floor(Math.random() * src.length)];
}

function startGame(entry) {
  const e = entry || pickRandomWord();
  state.currentWord   = e.word.toUpperCase();
  state.currentHints  = Array.isArray(e.hints) ? e.hints : (e.hint ? [e.hint] : []);
  state.guesses       = [];
  state.currentGuess  = [];
  state.gameOver      = false;
  renderGrid(); renderKeyboard(); renderHint();
  // Guided mode: show answer emoji from the start
  const emojiEl = document.getElementById('guidedEmoji');
  if (state.guidedMode) {
    const emoji = getWordEmoji(e);
    if (emoji) {
      emojiEl.textContent = emoji;
      emojiEl.style.display = 'block';
      // re-trigger animation
      emojiEl.style.animation = 'none';
      void emojiEl.offsetWidth;
      emojiEl.style.animation = '';
    } else {
      emojiEl.style.display = 'none';
    }
  } else {
    emojiEl.style.display = 'none';
  }
  document.getElementById('endOverlay').classList.remove('show');
  updateAdminCurrentWord();
}

// =====================================================================
//  GRID
// =====================================================================
function renderGrid() {
  const grid = document.getElementById('grid');
  const len  = state.currentWord.length;
  const sz   = len === 4 ? 66 : 60;
  const done = state.guesses.length;
  const total = done + (state.gameOver ? 0 : 1);
  grid.style.gridTemplateColumns = `repeat(${len}, ${sz}px)`;
  grid.innerHTML = '';
  for (let r = 0; r < total; r++) {
    for (let c = 0; c < len; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile'; tile.id = `tile-${r}-${c}`;
      tile.style.width = tile.style.height = sz + 'px';
      if (r < done) { tile.textContent = state.guesses[r].letters[c]; tile.classList.add(state.guesses[r].result[c]); }
      else if (r === done && !state.gameOver && state.currentGuess[c]) { tile.textContent = state.currentGuess[c]; tile.classList.add('filled'); }
      grid.appendChild(tile);
    }
  }
}

// =====================================================================
//  PROGRESSIVE HINTS
// =====================================================================
function getActiveHint() {
  const n = state.guesses.length, h = state.currentHints;
  if (!h || !h.length) return null;
  if (n >= 5 && h[2]) return { text: h[2], level: 3 };
  if (n >= 3 && h[1]) return { text: h[1], level: 2 };
  if (n >= 1 && h[0]) return { text: h[0], level: 1 };
  return null;
}

function renderHint() {
  const bar = document.getElementById('hintBar');
  const txt = document.getElementById('hintText');
  const tag = document.getElementById('hintTag');
  if (!state.hintsEnabled || !state.currentHints.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  if (state.guesses.length === 0) {
    tag.textContent = 'HINT'; tag.className = 'hint-tag locked';
    txt.replaceChildren();
    const locked = document.createElement('span');
    locked.className = 'hint-locked-text';
    locked.textContent = 'Hint unlocks after your first guess…';
    txt.appendChild(locked);
    return;
  }
  const active = getActiveHint();
  if (!active) { bar.style.display = 'none'; return; }
  const labels = ['','VAGUE','CLEARER','SPECIFIC'];
  tag.textContent = labels[active.level]; tag.className = 'hint-tag';
  txt.textContent = active.text;
  bar.classList.remove('revealed'); void bar.offsetWidth; bar.classList.add('revealed');
}

// =====================================================================
//  KEYBOARD
// =====================================================================
const KB_ROWS = [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['ENTER','Z','X','C','V','B','N','M','⌫']];

function getKeyStates() {
  const map = {};
  for (const g of state.guesses) for (let i=0;i<g.letters.length;i++) {
    const l=g.letters[i],r=g.result[i],cur=map[l];
    if(r==='correct') map[l]='correct';
    else if(r==='present'&&cur!=='correct') map[l]='present';
    else if(!cur) map[l]='absent';
  }
  return map;
}

function renderKeyboard() {
  const kb = document.getElementById('keyboard'); kb.innerHTML = '';
  for (const row of KB_ROWS) {
    const div = document.createElement('div'); div.className = 'kb-row';
    for (const key of row) {
      const btn = document.createElement('button');
      btn.className = 'key' + (key.length>1?' wide':'');
      btn.textContent = key;
      btn.addEventListener('click', () => handleKey(key));
      div.appendChild(btn);
    }
    kb.appendChild(div);
  }
  updateKeyboard();
}

function updateKeyboard() {
  const ks = getKeyStates();
  document.querySelectorAll('#keyboard .key').forEach(btn => {
    const k = btn.textContent.trim();
    if (k.length !== 1) return;
    btn.className = 'key';
    if (ks[k]) btn.classList.add(ks[k]);
  });
}

function appendGridRow(rowIdx) {
  const grid = document.getElementById('grid');
  const len = state.currentWord.length;
  const sz = len === 4 ? 66 : 60;
  for (let c = 0; c < len; c++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.id = `tile-${rowIdx}-${c}`;
    tile.style.width = tile.style.height = sz + 'px';
    grid.appendChild(tile);
  }
}

// =====================================================================
//  GAME LOGIC
// =====================================================================
function handleKey(key) {
  if (document.getElementById('endOverlay').classList.contains('show')) {
    if (key === 'ENTER') startGame();
    return;
  }
  if (state.gameOver) return;
  const len = state.currentWord.length;
  if (key==='⌫'||key==='BACKSPACE') { if(state.currentGuess.length){state.currentGuess.pop();updateCurrentRow();} return; }
  if (key==='ENTER') { submitGuess(); return; }
  if (/^[A-Z]$/i.test(key)&&state.currentGuess.length<len) { state.currentGuess.push(key.toUpperCase()); updateCurrentRow(); }
}

function updateCurrentRow() {
  const r=state.guesses.length, len=state.currentWord.length;
  for(let c=0;c<len;c++){
    const tile=document.getElementById(`tile-${r}-${c}`); if(!tile) return;
    const l=state.currentGuess[c]||''; tile.textContent=l;
    l?tile.classList.add('filled'):tile.classList.remove('filled');
  }
}

function evaluateGuess(guess) {
  const word=state.currentWord, result=Array(word.length).fill('absent'), used=Array(word.length).fill(false);
  const wa=word.split(''), ga=guess.split('');
  for(let i=0;i<word.length;i++) if(ga[i]===wa[i]){result[i]='correct';used[i]=true;}
  for(let i=0;i<word.length;i++){
    if(result[i]==='correct') continue;
    for(let j=0;j<word.length;j++) if(!used[j]&&ga[i]===wa[j]){result[i]='present';used[j]=true;break;}
  }
  return result;
}

function submitGuess() {
  const len=state.currentWord.length;
  if(state.currentGuess.length<len){shakeRow(state.guesses.length);showToast(`NEED ${len} LETTERS`);return;}
  const guessWord=state.currentGuess.join(''), result=evaluateGuess(guessWord);
  state.guesses.push({letters:[...state.currentGuess],result}); state.currentGuess=[];
  revealRow(state.guesses.length-1, result, ()=>{
    updateKeyboard();
    const won=result.every(r=>r==='correct');
    if(won){
      state.gameOver=true; state.stats.played++; state.stats.won++;
      state.stats.totalGuesses+=state.guesses.length; state.stats.streak++;
      saveState();
      setTimeout(()=>bounceRow(state.guesses.length-1),80);
      setTimeout(()=>showEndScreen(),640);
      launchConfetti(state.grownup);
    } else { appendGridRow(state.guesses.length); renderHint(); }
  });
}

function revealRow(rowIdx,result,cb){
  const len=state.currentWord.length,delay=310;
  for(let c=0;c<len;c++){
    const tile=document.getElementById(`tile-${rowIdx}-${c}`); if(!tile) continue;
    setTimeout(()=>{ tile.classList.add('reveal'); setTimeout(()=>{tile.classList.add(result[c]);tile.classList.remove('filled');},220); },c*delay);
  }
  setTimeout(cb,len*delay+260);
}

function bounceRow(rowIdx){
  const len=state.currentWord.length;
  for(let c=0;c<len;c++){const tile=document.getElementById(`tile-${rowIdx}-${c}`);if(tile)setTimeout(()=>tile.classList.add('bounce'),c*65);}
}
function shakeRow(rowIdx){
  const len=state.currentWord.length;
  for(let c=0;c<len;c++){const tile=document.getElementById(`tile-${rowIdx}-${c}`);if(tile){tile.classList.remove('shake');void tile.offsetWidth;tile.classList.add('shake');}}
}

// =====================================================================
//  END SCREEN
// =====================================================================
function showEndScreen() {
  const icon=document.getElementById('endIcon');
  icon.textContent='✓'; icon.className='modal-icon';
  const msgs=['Correct sequence.','Word cracked.','Experiment successful.','Pattern matched.','Analysis complete.'];
  document.getElementById('endTitle').textContent='SOLVED';
  document.getElementById('endMsg').textContent=`${msgs[state.guesses.length%msgs.length]} ${state.guesses.length} attempt${state.guesses.length===1?'':'s'}.`;
  document.getElementById('endOverlay').classList.add('show');
}

document.getElementById('gateOverlay').addEventListener('click',e=>{ if(e.target===document.getElementById('gateOverlay')) closeGate(); });
document.getElementById('gateCloseBtn').addEventListener('click', closeGate);
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&document.getElementById('gateOverlay').classList.contains('show')) closeGate(); });

// =====================================================================
//  ADMIN / SETTINGS
// =====================================================================
function openAdmin() {
  updateAdminCurrentWord(); updateAdminStats();
  document.getElementById('hintsEnabledSelect').value=state.hintsEnabled?'yes':'no';
  syncLenUI(); applyLetterLabMode(); syncGuidedUI();
  document.getElementById('adminOverlay').classList.add('show');
}
function closeAdmin() { document.getElementById('adminOverlay').classList.remove('show'); }
function updateAdminCurrentWord() {
  const el=document.getElementById('adminCurrentWord');
  if(el) el.textContent=`${state.currentWord} (${state.wordLength}L)`;
}
function updateAdminStats() {
  document.getElementById('statPlayed').textContent=state.stats.played;
  document.getElementById('statWon').textContent=state.stats.won;
  document.getElementById('statAvgGuess').textContent=state.stats.won?(state.stats.totalGuesses/state.stats.won).toFixed(1):'—';
  document.getElementById('statStreak').textContent=state.stats.streak;
}

// =====================================================================
//  WORD EDITOR
// =====================================================================
let editorFilter = 0; // 0=all, 4=4-letter, 5=5-letter
let editingIdx   = -1;

function openEditor() {
  closeAdmin();
  renderEditorCards();
  showView('editorView');
}

function renderEditorCards() {
  const grid    = document.getElementById('wordGrid');
  const search  = document.getElementById('editorSearch').value.trim().toUpperCase();
  const filtered = state.wordBank.filter(e => {
    if (editorFilter > 0 && e.word.length !== editorFilter) return false;
    if (search && !e.word.includes(search)) return false;
    return true;
  });

  document.getElementById('wordCount').textContent = `${filtered.length} word${filtered.length!==1?'s':''}`;
  grid.replaceChildren();

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No words match your filter.';
    grid.appendChild(empty);
    return;
  }

  const hintLabels = ['VAGUE', 'CLEARER', 'SPECIFIC'];
  const hintLevels = ['l1', 'l2', 'l3'];
  const hintPlaceholders = ['Vague clue…', 'A bit more specific…', 'Very specific clue…'];

  // Build index map from filtered → actual wordBank index
  filtered.forEach(entry => {
    const realIdx = state.wordBank.indexOf(entry);
    const card = document.createElement('div');
    card.className = 'word-card' + (editingIdx === realIdx ? ' editing' : '');
    card.dataset.idx = String(realIdx);

    const hints = entry.hints || [];
    const isEditing = editingIdx === realIdx;

    const header = document.createElement('div');
    header.className = 'wc-header';

    const title = document.createElement('div');
    title.className = 'wc-title';
    const word = document.createElement('span');
    word.className = 'wc-word';
    word.textContent = entry.word;
    const badge = document.createElement('span');
    badge.className = 'wc-badge';
    badge.textContent = `${entry.word.length}L`;
    title.append(word, badge);

    const actions = document.createElement('div');
    actions.className = 'wc-actions';
    const editBtn = document.createElement('button');
    editBtn.className = 'wc-btn edit-btn';
    editBtn.dataset.idx = String(realIdx);
    editBtn.title = isEditing ? 'Done' : 'Edit';
    editBtn.textContent = isEditing ? '✓' : '✏';
    const delBtn = document.createElement('button');
    delBtn.className = 'wc-btn del wc-del-btn';
    delBtn.dataset.idx = String(realIdx);
    delBtn.title = 'Delete';
    delBtn.textContent = '✕';
    actions.append(editBtn, delBtn);
    header.append(title, actions);

    const rows = document.createElement('div');
    rows.className = 'hint-rows';
    for (let i = 0; i < 3; i++) {
      const row = document.createElement('div');
      row.className = 'hint-row';
      const level = document.createElement('span');
      level.className = `hint-level ${hintLevels[i]}`;
      level.textContent = hintLabels[i];
      row.appendChild(level);
      const val = hints[i] || '';
      if (isEditing) {
        const input = document.createElement('input');
        input.className = 'hint-input';
        input.dataset.idx = String(realIdx);
        input.dataset.hint = String(i);
        input.value = val;
        input.placeholder = hintPlaceholders[i];
        row.appendChild(input);
      } else {
        const text = document.createElement('span');
        text.className = 'hint-text' + (val ? '' : ' empty');
        text.textContent = val || 'No hint set';
        row.appendChild(text);
      }
      rows.appendChild(row);
    }

    card.append(header, rows);

    // Edit / done toggle
    editBtn.addEventListener('click', () => {
      if (isEditing) {
        // Save hints from inputs
        const inputs = card.querySelectorAll('.hint-input');
        const newHints = Array.from(inputs).map(inp => inp.value.trim());
        state.wordBank[realIdx].hints = newHints;
        saveState();
        editingIdx = -1;
      } else {
        editingIdx = realIdx;
      }
      renderEditorCards();
    });

    // Delete
    card.querySelector('.wc-del-btn').addEventListener('click', () => {
      if (!confirm(`Remove "${entry.word}" from the word bank?`)) return;
      state.wordBank.splice(realIdx, 1);
      if (editingIdx === realIdx) editingIdx = -1;
      saveState(); renderEditorCards();
      showToast('WORD REMOVED');
    });

    grid.appendChild(card);
  });
}

// Filter buttons
document.querySelectorAll('.filter-btn[data-len]').forEach(btn => {
  btn.addEventListener('click', () => {
    editorFilter = parseInt(btn.dataset.len);
    document.querySelectorAll('.filter-btn[data-len]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderEditorCards();
  });
});
document.getElementById('filterAllBtn').classList.add('active'); // default

// Search (debounced)
let searchTimer;
document.getElementById('editorSearch').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderEditorCards, 150);
});

// Add word panel
document.getElementById('openAddBtn').addEventListener('click', () => {
  const panel = document.getElementById('addPanel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) document.getElementById('addWordInput').focus();
});
document.getElementById('cancelAddBtn').addEventListener('click', () => {
  document.getElementById('addPanel').classList.remove('open');
});
document.getElementById('addWordInput').addEventListener('input', e => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g,'');
});

document.getElementById('confirmAddBtn').addEventListener('click', () => {
  const w = document.getElementById('addWordInput').value.trim().toUpperCase();
  if (!w || w.length < 3 || w.length > 9 || !/^[A-Z]+$/.test(w)) {
    showToast('ENTER A VALID WORD (3–9 LETTERS)'); return;
  }
  if (state.wordBank.find(e => e.word === w)) { showToast('WORD ALREADY EXISTS'); return; }
  const h1 = document.getElementById('addHint1').value.trim();
  const h2 = document.getElementById('addHint2').value.trim();
  const h3 = document.getElementById('addHint3').value.trim();
  state.wordBank.push({ word: w, hints: [h1, h2, h3] });
  saveState();
  // Clear form
  document.getElementById('addWordInput').value = '';
  document.getElementById('addHint1').value = '';
  document.getElementById('addHint2').value = '';
  document.getElementById('addHint3').value = '';
  document.getElementById('addPanel').classList.remove('open');
  renderEditorCards();
  showToast(`"${w}" ADDED`);
});

// Back to game
document.getElementById('editorBackBtn').addEventListener('click', () => {
  editingIdx = -1;
  showView('gameView');
});

// =====================================================================
//  MAIN EVENT LISTENERS
// =====================================================================
document.addEventListener('keydown', e => {
  if (!document.getElementById('gameView').classList.contains('active')) return;
  if (document.getElementById('adminOverlay').classList.contains('show')) return;
  if (document.getElementById('helpOverlay').classList.contains('show')) return;
  if (e.key==='Backspace') handleKey('BACKSPACE');
  else if (e.key==='Enter') handleKey('ENTER');
  else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
});

document.getElementById('nextBtn').addEventListener('click', () => { startGame(); showToast('NEW WORD'); });
document.getElementById('playAgainBtn').addEventListener('click', () => startGame());
document.getElementById('adminBtn').addEventListener('click', () => openGate(openAdmin, {wrongClass: 'wrong'}));
document.getElementById('closeAdminBtn').addEventListener('click', closeAdmin);
document.getElementById('adminOverlay').addEventListener('click', e => { if(e.target===document.getElementById('adminOverlay')) closeAdmin(); });
document.getElementById('helpBtn').addEventListener('click', () => document.getElementById('helpOverlay').classList.add('show'));
document.getElementById('closeHelpBtn').addEventListener('click', () => document.getElementById('helpOverlay').classList.remove('show'));
document.getElementById('helpOverlay').addEventListener('click', e => { if(e.target===document.getElementById('helpOverlay')) document.getElementById('helpOverlay').classList.remove('show'); });
document.getElementById('endOverlay').addEventListener('click', e => { if(e.target===document.getElementById('endOverlay')) startGame(); });

document.querySelectorAll('.len-opt').forEach(btn => {
  btn.addEventListener('click', () => { state.wordLength=parseInt(btn.dataset.len); syncLenUI(); });
});
document.getElementById('grownupToggleBtn').addEventListener('click', () => { state.grownup=!state.grownup; applyLetterLabMode(); });
document.getElementById('guidedToggleBtn').addEventListener('click', () => { state.guidedMode=!state.guidedMode; syncGuidedUI(); applyLetterLabMode(); });
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  state.hintsEnabled=document.getElementById('hintsEnabledSelect').value==='yes';
  saveState(); startGame(); showToast('SETTINGS SAVED'); closeAdmin();
});
document.getElementById('setWordBtn').addEventListener('click', () => {
  const w=document.getElementById('manualWord').value.toUpperCase().trim();
  if(!w||w.length<3||w.length>9||!/^[A-Z]+$/.test(w)){showToast('INVALID WORD');return;}
  state.wordLength=w.length; syncLenUI();
  startGame({word:w,hints:[]});
  document.getElementById('manualWord').value='';
  showToast(`WORD SET: ${w}`); closeAdmin();
});
document.getElementById('randomWordBtn').addEventListener('click', () => {
  const pool=getWordsByLength(state.wordLength);
  if(!pool.length){showToast('NO WORDS FOR THAT LENGTH');return;}
  startGame(pool[Math.floor(Math.random()*pool.length)]);
  showToast('RANDOM WORD'); closeAdmin();
});
document.getElementById('openEditorBtn').addEventListener('click', openEditor);
document.getElementById('clearBankBtn').addEventListener('click', () => {
  if(!confirm('Reset word bank to defaults?')) return;
  state.wordBank=JSON.parse(JSON.stringify(DEFAULT_WORD_BANK));
  saveState(); showToast('BANK RESET'); closeAdmin();
});
document.getElementById('resetStatsBtn').addEventListener('click', () => {
  if(!confirm('Reset all stats?')) return;
  state.stats={played:0,won:0,totalGuesses:0,streak:0};
  saveState(); updateAdminStats(); showToast('STATS RESET');
});

// =====================================================================
//  BOOT
// =====================================================================
applyLetterLabMode(); syncGuidedUI(); syncLenUI(); startGame();
