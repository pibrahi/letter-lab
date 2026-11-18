const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('shared motion respects reduced motion and persistent animations opt in', () => {
  const css = fs.readFileSync('public/_shared/lab.css', 'utf8');
  const js = fs.readFileSync('public/_shared/lab.js', 'utf8');
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(js, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches/);
  function check(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) check(file);
      else if (file.endsWith('.css')) {
        const source = fs.readFileSync(file, 'utf8');
        // Track nested blocks so each infinite animation must be inside the opt-in query.
        const blocks = [];
        for (const token of source.matchAll(/([^{}]+)\{|\}|\binfinite\b/g)) {
          if (token[0] === '}') blocks.pop();
          else if (token[0] === 'infinite') assert.ok(blocks.some(b => /@media\s*\(prefers-reduced-motion:\s*no-preference\)/.test(b)), `${file}: infinite animation without motion opt-in`);
          else blocks.push(token[1]);
        }
      }
    }
  }
  check('public');
});
