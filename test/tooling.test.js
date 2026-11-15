const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('CI uses read-only contents permissions and pins every action to a full SHA', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8');
  assert.match(workflow, /^permissions:\s*\n\s+contents: read\s*$/m);
  const uses = workflow.split('\n').filter(line => /\buses:/.test(line));
  assert.ok(uses.length > 0);
  for (const line of uses) {
    assert.match(line, /^\s*-?\s*uses:\s+[^\s@]+@[a-f0-9]{40}(?:\s+#.*)?$/);
  }
});

test('pre-push hook exists and is executable', () => {
  const hook = path.join(root, '.githooks/pre-push');
  assert.ok(fs.statSync(hook).isFile());
  fs.accessSync(hook, fs.constants.X_OK);
});

test('package scripts run lint and all test files through check', () => {
  const { scripts } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(scripts.lint, 'eslint . && stylelint "public/**/*.css"');
  assert.equal(scripts.test, 'node --test test/*.test.js');
  assert.equal(scripts.check, 'npm run lint && npm test');
});
