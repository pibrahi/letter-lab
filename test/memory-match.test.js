const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {shuffle, buildDeck, isMatch, calculateStars} = require('../public/memory-match/game.js');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('Memory Match page files and external assets exist', () => {
  for (const file of ['index.html','game.css','game.js','favicon.svg']) {
    assert.ok(read(`public/memory-match/${file}`).length);
  }
  const html = read('public/memory-match/index.html');
  assert.doesNotMatch(html, /<style[\s>]|\sstyle\s*=|\son[a-z]+\s*=|<script(?![^>]*\bsrc\s*=)[^>]*>/i);
  for (const asset of ['../_shared/lab.js','../_shared/lab.css','game.js','game.css']) {
    assert.ok(html.includes(`"${asset}"`));
  }
  assert.ok(html.includes('https://letterlab.cc/memory-match/'));
  assert.match(html, /aria-live="polite"/);
  const winPanel = html.match(/<section\b[^>]*\bid="winPanel"[^>]*>/)[0];
  assert.match(winPanel, /role="dialog"/);
  assert.match(winPanel, /aria-modal="true"/);
  assert.match(read('public/memory-match/game.css'), /\.board\.pairs-4\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
});

test('hub and sitemap include Memory Match', () => {
  assert.match(read('public/index.html'), /href="memory-match\/"/);
  assert.match(read('public/index.html'), /id="statMM"/);
  const hub = read('public/hub.js');
  assert.match(hub, /localStorage.getItem\('mm_v1'\)/);
  assert.match(hub, /mm.pairsFound/);
  assert.match(hub, /'pw_v1','mm_v1'/);
  assert.match(hub, /"name": "Memory Match"/);
  assert.match(read('public/sitemap.xml'), /<loc>https:\/\/letterlab.cc\/memory-match\/<\/loc><priority>0.8<\/priority><changefreq>weekly<\/changefreq>/);
});

for (const mode of ['picture','word','letter']) {
  for (const pairs of [3,4,6]) {
    test(`${mode} deck with ${pairs} pairs`, () => {
      const deck = buildDeck(mode, pairs, () => 0.42);
      assert.equal(deck.length, pairs * 2);
      const groups = new Map();
      for (const card of deck) {
        assert.equal(typeof card.label, 'string');
        if (!groups.has(card.pairId)) groups.set(card.pairId, []);
        groups.get(card.pairId).push(card);
      }
      assert.equal(groups.size, pairs);
      for (const group of groups.values()) {
        assert.equal(group.length, 2);
        assert.ok(isMatch(...group));
        assert.equal(isMatch(group[0], group[0]), false);
        if (mode === 'picture') assert.equal(group[0].face, group[1].face);
        if (mode === 'word') {
          const words = group.filter(c => /^[A-Z]{1,5}$/.test(c.face));
          const pictures = group.filter(c => /\p{Extended_Pictographic}/u.test(c.face));
          assert.equal(words.length, 1);
          assert.equal(pictures.length, 1);
          assert.equal(words[0].face, words[0].pairId);
          assert.match(pictures[0].label, /^picture of an? /);
        }
        if (mode === 'letter') {
          assert.equal(group.filter(c => /^[A-Z]$/.test(c.face)).length, 1);
          assert.equal(group.filter(c => /^[a-z]$/.test(c.face)).length, 1);
          assert.equal(group[0].face.toLowerCase(), group[1].face.toLowerCase());
        }
      }
      assert.equal(isMatch(deck[0], deck.find(c => c.pairId !== deck[0].pairId)), false);
    });
  }
}

test('shuffle preserves multiset and input, with deterministic rng', () => {
  const items = [1,2,2,3,4];
  const result = shuffle(items, () => 0);
  assert.deepEqual([...result].sort(), [...items].sort());
  assert.deepEqual(items, [1,2,2,3,4]);
  assert.notDeepEqual(result, items);
  assert.deepEqual(result, shuffle(items, () => 0));
  assert.deepEqual(shuffle([]), []);
});

test('star thresholds for all board sizes', () => {
  for (const pairs of [3,4,6]) {
    assert.equal(calculateStars(pairs, pairs), 3);
    assert.equal(calculateStars(pairs * 2, pairs), 3);
    assert.equal(calculateStars(pairs * 2 + 1, pairs), 2);
    assert.equal(calculateStars(pairs * 3, pairs), 2);
    assert.equal(calculateStars(pairs * 3 + 1, pairs), 1);
  }
});
