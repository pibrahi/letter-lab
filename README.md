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

Earn a printable Hero Badge after five correct answers in a row.

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
- **Grownup gate** — settings panels are locked behind a simple maths check (2×5=?) to keep kids out of the admin area
- **Printable badges** — the Spelling Academy hero badge prints cleanly via CSS `@media print`

---

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Static HTML/CSS/JS — no build step |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com/) (static assets) |
| Fonts | Space Mono and DM Sans, self-hosted latin WOFF2 in `public/fonts/` |
| Storage | Browser `localStorage` only |
| Deployment | Cloudflare Worker `letter-lab` (`wrangler versions upload`, then `wrangler deploy`) |

Everything is vanilla. No frameworks and no bundlers. The only devDependency is Wrangler, used to upload a preview version and to deploy.

---

## Project structure

```
letter-lab/
├── public/
│   ├── _shared/
│   │   ├── lab.css          # Design system (CSS variables, shared components)
│   │   └── lab.js           # Shared utilities (toast, confetti, grownup gate)
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
├── test/                    # node:test checks (no test dependencies)
├── wrangler.toml            # Cloudflare Workers config
└── package.json
```

---

## Setup

```bash
npm install
```

That installs the pinned Wrangler CLI. The site itself is still static files in `public/`.

## Testing

```bash
npm test
```

The checks are plain `node:test`. They read the headers file, the HTML, and `wrangler.toml`. They do not contact Cloudflare.

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
