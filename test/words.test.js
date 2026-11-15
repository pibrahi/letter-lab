const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const words = require('../public/_shared/words.js');

for (const [name, list] of Object.entries(words.lists)) {
  test(`${name} has unique words with emojis and ordered {w,e} picks`, () => {
    assert.equal(new Set(list).size, list.length);
    for (const word of list) assert.ok(Object.hasOwn(words.emojis, word), word);
    assert.deepEqual(words.pick(name), list.map(w => ({w, e: words.emojis[w]})));
    assert.notEqual(words.pick(name), words.pick(name));
  });
}

for (const game of ['memory-match', 'word-safari', 'spelling-academy', 'puzzle-words']) {
  test(`${game} loads shared words before game.js`, () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'public', game, 'index.html'), 'utf8');
    const library = html.indexOf('<script src="../_shared/words.js"></script>');
    assert.ok(library >= 0);
    assert.ok(library < html.indexOf('<script src="game.js"></script>'));
  });
}
