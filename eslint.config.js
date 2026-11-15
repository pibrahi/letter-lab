const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { files: ['public/numbers/engine/*.js'], languageOptions: { globals: { module: 'readonly', require: 'readonly' } } },
  { files: ['public/numbers/numbers.js'], languageOptions: { globals: { NumberLab: 'readonly' } } },
  { ignores: ['node_modules/**', '.wrangler/**', 'public/fonts/**'] },
  js.configs.recommended,
  {
    files: ['public/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['public/**/*.js'],
    ignores: ['public/_shared/lab.js', 'public/_shared/words.js'],
    languageOptions: {
      globals: {
        showToast: 'readonly',
        launchConfetti: 'readonly',
        applyGrownup: 'readonly',
        closeGate: 'readonly',
        openGate: 'readonly',
        syncGrownupBtn: 'readonly',
        renderStars: 'readonly',
        LAB_WORDS: 'readonly',
      },
    },
  },
  {
    files: ['public/_shared/lab.js', 'public/_shared/words.js'],
    rules: { 'no-unused-vars': ['error', { vars: 'local' }] },
  },
  {
    files: ['public/memory-match/game.js', 'public/_shared/words.js', 'public/_shared/lab.js'],
    languageOptions: { globals: { module: 'readonly', require: 'readonly' } },
  },
  {
    files: ['test/**/*.js', 'eslint.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
];
