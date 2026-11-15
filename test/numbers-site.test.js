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
  assert.equal([...html.matchAll(/<div class="game-card is-soon[^"]*" aria-disabled="true">/g)].length, 4);
  for (const title of ['Dino Egg Rescue','Rocket Fuel','Monster Munch','Number Train','Who Has More?']) assert.ok(html.includes(title));
  assert.equal([...html.matchAll(/⏳ Coming soon/g)].length, 4);
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
  assert.equal([...home.matchAll(/<a class="game-card /g)].length, 1);
  assert.match(home, /▶ Play/);
  const html = read('numbers/games/dino-egg-rescue/index.html');
  assert.doesNotMatch(html, /<style[\s>]|\sstyle\s*=|\son\w+\s*=|<script(?![^>]*\bsrc=)/i);
  assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]), ['../../../_shared/lab.js','../../engine/levels.js','../../engine/adapt.js','../../engine/store.js','../../engine/counting.js','game.js']);
  for (let i = 0; i < 5; i++) assert.ok(html.includes(`id="star${i}"`));
  assert.match(read('sitemap.xml'), /<loc>https:\/\/letterlab.cc\/numbers\/games\/dino-egg-rescue\/<\/loc>/);
});
test('NumberLab home shows the start setting and each playable game its own level', () => {
  const {SKILLS, levelLabel, TIERS} = require('../public/numbers/engine/levels.js');
  const html = read('numbers/index.html');
  const chips = [...html.matchAll(/data-skill-level="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(chips, ['counting']);
  chips.forEach(key => assert.ok(SKILLS.some(s => s.key === key)));
  const playable = [...html.matchAll(/<a class="game-card[\s\S]*?<\/a>/g)].map(m => m[0]);
  assert.equal(playable.length, 1); assert.match(playable[0], /data-skill-level="counting"/);
  assert.doesNotMatch(html.replace(playable[0], ''), /level-chip/);
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
