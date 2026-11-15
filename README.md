# 🔤 Letter Lab

**Word learning activities for kids aged 2–6.**
Free, no ads, no accounts, no tracking. Built by a parent, for their own kids.

🌐 **[letterlab.cc](https://letterlab.cc)**

---

## Activities

### 🔤 Letter Lab `2+`
A Wordle-style word guessing activity. Kids guess a hidden 4 or 5-letter word one letter at a time using an on-screen keyboard. Progressive hints unlock after each round of guesses.

**Guided Mode (G)** — designed for 2-year-olds. Shows the answer as a large emoji from the very start, so the child can focus on finding the letters rather than guessing the word.

---

### ⚡ Superhero Spelling Academy `4+`
Kids save broken words from the villain. Two modes:
- **Fix the Word** — one letter is missing from a word; tap the correct one from four choices
- **Villain Mix-Up** — letters are scrambled; tap them in the right order to unscramble

Earn an on-screen Hero Badge after five correct answers in a row.

---

### 🦁 Word Safari `3+`
Match animals to words and spell them out. Three modes:
- **Match the Animal** — tap the word that matches the emoji shown
- **First Letter** — tap the correct starting letter for the animal's name
- **Spell It Out** — tap all the letters in order to spell the full word

---

### 🧩 Puzzle Words `3+`
Tile-based word puzzles. Three modes:
- **Tile Drop** — drag tiles into the correct blanks to complete a word
- **Finish the Sentence** — choose the word that correctly completes a picture sentence
- **Rhyme Time** — find the word that rhymes with the one shown

---

### 🃏 Memory Match `2+`
Flip cards and find pairs with no timer or losing. Three modes:
- **Picture Pairs (2+)** — match identical animal pictures
- **Picture & Word (3+)** — match animal pictures to uppercase words
- **Big & Little (3+)** — match uppercase and lowercase letters

Grownup settings offer 3, 4 or 6 pairs. Earn up to three stars per board; lifetime pairs and boards cleared stay on this device.

---

## Design principles

- **No audio** — fully visual; works anywhere without headphones
- **No accounts** — nothing to sign up for, nothing to log in to
- **No data collection** — progress is stored in browser localStorage only, never transmitted
- **No ads** — ever
- **Mobile-first** — designed for tablets and phones; double-tap zoom disabled
- **Dark mode** — toggled from the hub; preference syncs across all activities
- **Grownup gate** — settings panels are locked behind a fresh addition or multiplication question with five shuffled answers; consecutive questions never repeat to keep kids out of the admin area

---

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Static HTML/CSS/JS — no build step |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com/) (static assets) |
| Fonts | Space Mono and DM Sans, self-hosted latin WOFF2 in `public/fonts/` |
| Storage | Browser `localStorage` only |
| Deployment | Cloudflare Worker `letter-lab` (`wrangler versions upload`, then `wrangler deploy`) |

Everything is vanilla. No frameworks and no bundlers. Development dependencies provide Wrangler for previews and deployment, ESLint for JavaScript, and Stylelint for CSS.

---

## Project structure

```
letter-lab/
├── public/
│   ├── _shared/
│   │   ├── lab.css          # Design system (CSS variables, shared components)
│   │   ├── lab.js           # Shared utilities (toast, confetti, grownup gate)
│   │   └── words.js         # Shared emoji word bank and per-game lists
│   ├── letter-lab/
│   │   ├── index.html       # Letter Lab activity
│   │   ├── game.css
│   │   └── game.js
│   ├── spelling-academy/
│   │   └── index.html       # Superhero Spelling Academy
│   ├── word-safari/
│   │   └── index.html       # Word Safari
│   ├── puzzle-words/
│   │   └── index.html       # Puzzle Words
│   ├── memory-match/
│   │   ├── index.html       # Memory Match
│   │   ├── game.css
│   │   ├── game.js
│   │   └── favicon.svg
│   ├── numbers/
│   │   ├── index.html       # NumberLab home
│   │   ├── numbers.css
│   │   ├── numbers.js
│   │   ├── favicon.svg
│   │   ├── engine/          # levels.js, adapt.js, store.js, counting.js
│   │   └── games/README.md  # Game layout
│   ├── privacy/
│   │   └── index.html       # Privacy policy
│   ├── index.html           # Hub / Learning Centre
│   ├── hub.css
│   ├── hub.js
│   ├── 404.html             # Custom not-found page
│   ├── _headers             # Security headers for every path
│   ├── fonts/               # Self-hosted WOFF2 files and their OFL licenses
│   ├── robots.txt
│   └── sitemap.xml
├── .github/workflows/ci.yml # Lint, tests, and checksum-verified secret scan
├── .githooks/pre-push       # Local lint, tests, optional gitleaks scan
├── eslint.config.js         # Browser scripts and Node test lint settings
├── .stylelintrc.json         # CSS correctness checks; preserves compact style
├── test/                    # node:test checks (no test dependencies)
│   ├── site.test.js
│   ├── memory-match.test.js
│   ├── words.test.js
│   └── tooling.test.js
├── wrangler.toml            # Cloudflare Workers config
└── package.json
```

---

## Architecture

Classic browser scripts load shared helpers before each game's script. `public/_shared/lab.js` provides `showToast(message)` (an 1800 ms toast), `launchConfetti(grownup)` (smaller, slower, muted confetti when true), `applyGrownup(on)` (the theme class), `syncGrownupBtn(grownup)` (theme and toggle UI), and `renderStars(progress)` (the five-star progress bar). `openGate(onSuccess, options = {})` opens the maths gate and calls the callback on success; `options.wrongClass` supplies a temporary wrong-answer class, otherwise inline error colours are used. `closeGate()` closes it.

`public/_shared/lab.css` defines shared components and design tokens. Themed tokens such as `--bg`, `--surface`, `--text`, `--border`, `--viridian`, `--correct`, and `--present` change under `body.grownup`. Fixed tokens such as `--brand-viridian`, `--admin-accent`, `--on-accent`, and `--error` retain their colours for chrome and accents; typography, radii, and transition tokens are fixed too.

`public/_shared/words.js` exposes the frozen `LAB_WORDS` emoji bank and per-game word lists. `pick(listName)` returns fresh word/emoji objects: Memory Match uses `memoryAnimals`, Word Safari uses `safariAnimals`, Spelling Academy uses `spellingWords`, and Puzzle Words uses `tileWords`. Letter Lab keeps its own words and progressive hints; Puzzle Words keeps its sentence and rhyme data locally. Memory Match and the word bank also support CommonJS for tests.

## NumberLab

`/numbers/` offers Dino Egg Rescue, a silent visual counting game with five-challenge rounds, tap and drag egg rescue, place-value building, sequences, gentle explanations, and adaptive difficulty. Four more cards are coming soon. The home has grownup-gated difficulty and minimum-tier settings, progress rows, reset confirmation, and synced dark mode. Games will live in `public/numbers/games/<slug>/` with `index.html`, `game.css`, and `game.js`.

The classic scripts in `public/numbers/engine/` also support CommonJS. `NumberLab.levels` exposes `TIERS`, `SKILLS`, `paramsFor(skill, tier)`, `tierById(tier)`, and `clampTier(tier)`. The six tiers are G mode (0, internal key `gmode`), Explorer (1), Builder (2), Inventor (3), Master (4), and Genius Lab (5). Unknown skills throw; invalid tiers default to G mode, numeric tiers clamp to 0–5, and tier keys (plus the legacy key `little`) map to their ids.

`NumberLab.adapt` provides `initialSkillState(tier)`, immutable `recordAnswer(state, correct, {floor})` returning `{state, event}`, and `suggestStartTier(answers)`. Counters are lifetime totals; recent answers reset when a tier changes. Assessment uses the last three answers per tier, requires two correct, and accepts passed tiers in ascending order only up to one tier beyond the last accepted pass (starting at G mode). `NumberLab.store` provides `load()`, `save(state)`, `setStartTier(state, tier)` (resets all skills), and `reset()` (all defaults). It validates the single `nl_v1` record and falls back to memory when storage is unavailable. The controller writes the shared `lab_dark` preference. The progress reset button keeps the chosen difficulty, floor, and theme.

NumberLab uses no audio, no profiles, and no names. Instructions are visual and all progress stays on this device.

## Development

```bash
npm install
```

That installs the pinned development tools and runs `prepare` to wire the pre-push hook. The site itself is still static files in `public/`.

```bash
npm run lint
npm test
npm run check
```

`lint` runs ESLint and Stylelint; `check` runs lint and tests together. The POSIX pre-push hook runs lint and tests, then scans Git history with gitleaks when installed; otherwise it prints a note and continues. To enable the hook manually in an existing checkout:

```bash
git config core.hooksPath .githooks
```

## CI

GitHub Actions runs on pull requests and pushes to `main`. The `check` job uses Node 24, installs with `npm ci --ignore-scripts`, runs lint and all tests, then scans Git history with gitleaks 8.30.1 after verifying the downloaded archive's SHA-256 checksum. Checkout and setup-node are pinned to full commit SHAs. The workflow grants only `contents: read`, disables persisted checkout credentials, and cancels older runs for the same ref.

## Branch protection

Configure `main` to require a pull request and the `check` status to pass before merging. Do not require approvals: this project has a single maintainer.

## Testing

```bash
npm test
```

The checks are plain `node:test`. They cover site configuration and assets, Memory Match logic, the shared word bank, and tooling safeguards. The shell expands `test/*.test.js` to all test files on Node 24. They do not contact Cloudflare.

To look at the site with those headers applied, serve it the way the Worker does:

```bash
npx wrangler dev
```

A plain static server will not send `public/_headers`.

## Preview, then deploy

Do this from a branch. Nothing here promotes a version to production until the last command.

1. Branch off `main` and commit the change.
2. Upload a version without promoting it:

   ```bash
   npm run preview
   ```

   That runs `wrangler versions upload`. It creates a new Worker version and prints a version URL. It does not move production traffic. `preview_urls` is on so that URL still exists after `workers_dev` is turned off. The URL is public.
3. Open the version URL and review the pull request.
4. Merge.
5. Deploy the merged commit:

   ```bash
   npx wrangler deploy
   ```

The next deploy also turns off the public `letter-lab.*.workers.dev` hostname and attaches `www.letterlab.cc` as a custom domain. See the pull request notes before running it.

## Rollback

Roll production back to the previous deployment:

```bash
npx wrangler rollback
```

Or deploy a specific earlier version again from the list in the Cloudflare dashboard (Workers → letter-lab → Deployments). Rollback restores the Worker version. It does not undo DNS records that a custom domain already created.

## Secrets

The repository has no secrets. Wrangler reads the Cloudflare API token from the `CLOUDFLARE_API_TOKEN` environment variable. Do not commit that token, and do not put it in `wrangler.toml`. A local `wrangler login` session is an alternative on a machine you control; CI should use the environment variable.

---

## Word banks

Each activity ships with a built-in word bank:

| Activity | Words |
|---|---|
| Letter Lab | 130+ words (4 and 5 letters), each with 3-level progressive hints |
| Spelling Academy | 50+ words (3–5 letters) with emojis |
| Word Safari | 32 animals with emojis |
| Memory Match | Short-word subset of Safari animals + alphabet |
| Puzzle Words | 32 tile words · 15 sentences · 15 rhyme pairs |

Letter Lab includes a full **word editor** (accessible via the grownup gate) to add, edit, or remove words and their hints.

---

## Privacy

Letter Lab collects no personal data. See [letterlab.cc/privacy](https://letterlab.cc/privacy/) for the full policy.

---

*Made with 🩵 for L & G*
