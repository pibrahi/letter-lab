const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../public');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
test('NumberLab scaffold has safe markup, ordered scripts, playable game and navigation', () => {
  const html = read('numbers/index.html');
  assert.doesNotMatch(html, /<style[\s>]|\sstyle\s*=|\son\w+\s*=|<script(?![^>]*\bsrc=)/i);
  assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]), ['../_shared/lab.js','engine/levels.js','engine/adapt.js','engine/store.js','numbers.js']);
  assert.equal([...html.matchAll(/<div class="game-card is-soon[^"]*" aria-disabled="true">/g)].length, 3);
  for (const title of ['Dino Egg Rescue','Rocket Fuel','Monster Munch','Number Train','Who Has More?']) assert.ok(html.includes(title));
  assert.equal([...html.matchAll(/⏳ Coming soon/g)].length, 3);
  assert.match(read('index.html'), /href="numbers\/"/);
  assert.match(read('hub.js'), /https:\/\/letterlab.cc\/numbers\//);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/letterlab.cc\/numbers\/<\/loc><priority>0.8<\/priority><changefreq>weekly/);
});
test('NumberLab files obey visual and anonymous policy', () => {
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /speechSynthesis|AudioContext|new Audio|<audio|Gabriel|Luca|profile/i, file);
    }
  }
  walk(path.join(root, 'numbers'));
});

test('Dino Egg Rescue has safe markup, ordered scripts and five stars', () => {
  const home = read('numbers/index.html');
  assert.match(home, /<a class="game-card card-0" href="games\/dino-egg-rescue\/">/);
  assert.equal([...home.matchAll(/<a class="game-card /g)].length, 2);
  assert.match(home, /▶ Play/);
  const html = read('numbers/games/dino-egg-rescue/index.html');
  assert.doesNotMatch(html, /<style[\s>]|\sstyle\s*=|\son\w+\s*=|<script(?![^>]*\bsrc=)/i);
  assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]), ['../../../_shared/lab.js','../../engine/levels.js','../../engine/adapt.js','../../engine/store.js','../../engine/counting.js','../shared/simple-game.js','game.js']);
  assert.doesNotMatch(html, /❔|👆|id="(?:help|demo)"/);
  for (let i = 0; i < 5; i++) assert.ok(html.includes(`id="star${i}"`));
  assert.match(read('sitemap.xml'), /<loc>https:\/\/letterlab.cc\/numbers\/games\/dino-egg-rescue\/<\/loc>/);
});
test('NumberLab home shows the start setting and each playable game its own level', () => {
  const {SKILLS, levelLabel, TIERS} = require('../public/numbers/engine/levels.js');
  const html = read('numbers/index.html');
  const chips = [...html.matchAll(/data-skill-level="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(chips, ['counting','addition']);
  chips.forEach(key => assert.ok(SKILLS.some(s => s.key === key)));
  const playable = [...html.matchAll(/<a class="game-card[\s\S]*?<\/a>/g)].map(m => m[0]);
  assert.equal(playable.length, 2); assert.match(playable[0], /data-skill-level="counting"/);
  assert.match(playable[1], /data-skill-level="addition"/);
  assert.doesNotMatch(playable.reduce((rest, card) => rest.replace(card, ''), html), /level-chip/);
  TIERS.forEach(t => assert.equal(levelLabel(t.id), `${t.icon} ${t.label}`));
  assert.equal(levelLabel(0), '🌱 G mode');
  assert.match(read('numbers/numbers.js'), /`Start: \$\{levels\.levelLabel\(state\.startTier\)\}`/);
});
test('public/ holds only servable files (no markdown docs)', () => {
  const found = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file); else if (/\.md$/i.test(entry.name)) found.push(path.relative(root, file));
    }
  })(root);
  assert.deepEqual(found, []);
});

test('Rocket Fuel has safe markup, ordered scripts and five stars', () => {
  const home = read('numbers/index.html');
  assert.match(home, /<a class="game-card card-1" href="games\/rocket-fuel\/">/);
  const html = read('numbers/games/rocket-fuel/index.html');
  assert.doesNotMatch(html, /<style[\s>]|\sstyle\s*=|\son\w+\s*=|<script(?![^>]*\bsrc=)/i);
  assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]), ['../../../_shared/lab.js','../../engine/levels.js','../../engine/adapt.js','../../engine/store.js','../../engine/counting.js','../../engine/addition.js','../shared/simple-game.js','game.js']);
  assert.doesNotMatch(html, /❔|👆|id="(?:help|demo)"/);
  for (let i = 0; i < 5; i++) assert.ok(html.includes(`id="star${i}"`));
  assert.match(read('sitemap.xml'), /<loc>https:\/\/letterlab.cc\/numbers\/games\/rocket-fuel\/<\/loc>/);
  assert.match(html, /href="https:\/\/letterlab.cc\/numbers\/games\/rocket-fuel\/"/);
});

test('NumberLab has no drag or pointer handling', () => {
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(js|html|css)$/.test(file)) assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /pointerdown|pointermove|pointerup|setPointerCapture|touchstart|touchmove|touchend|dragstart|dragover|drop\b|draggable/i, file);
    }
  }
  walk(path.join(root, 'numbers'));
});

test('compare accents use shared theme tokens and an aria-hidden scale cue', () => {
  const js = read('numbers/games/shared/simple-game.js');
  const css = read('numbers/games/shared/simple-game.css');
  assert.match(js, /'compare-cue', '⚖'/);
  assert.match(js, /cue.setAttribute\('aria-hidden', 'true'\)/);
  for (const name of ['a','b']) assert.ok(css.includes(`.choice.compare-${name}`));
  for (const token of ['viridian-text','viridian-bg','present','present-txt']) assert.ok(css.includes(`var(--${token})`));
});
