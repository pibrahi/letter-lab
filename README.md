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
| Fonts | [Space Mono](https://fonts.google.com/specimen/Space+Mono) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) via Google Fonts |
| Storage | Browser `localStorage` only |
| Deployment | `wrangler deploy` |

Everything is vanilla. No frameworks, no bundlers, no dependencies beyond the two Google Fonts.

---

## Project structure

```
letter-lab/
├── public/
│   ├── _shared/
│   │   ├── lab.css          # Design system (CSS variables, shared components)
│   │   └── lab.js           # Shared utilities (toast, confetti, grownup gate)
│   ├── letter-lab/
│   │   └── index.html       # Letter Lab activity (self-contained)
│   ├── spelling-academy/
│   │   └── index.html       # Superhero Spelling Academy
│   ├── word-safari/
│   │   └── index.html       # Word Safari
│   ├── puzzle-words/
│   │   └── index.html       # Puzzle Words
│   ├── privacy/
│   │   └── index.html       # Privacy policy
│   ├── index.html           # Hub / Learning Centre
│   ├── robots.txt
│   └── sitemap.xml
└── wrangler.toml            # Cloudflare Workers config
```

---

## Local development

No install needed. Just open any HTML file directly in a browser, or serve the `public/` folder with any static server:

```bash
# Python
python3 -m http.server 8080 --directory public

# Node (npx)
npx serve public
```

---

## Deployment

```bash
# Authenticate (first time only)
wrangler login

# Deploy to Cloudflare Workers
wrangler deploy
```

The `wrangler.toml` points at `./public` as the static assets directory. All files are served as-is with no server-side logic.

---

## Word banks

Each activity ships with a built-in word bank:

| Activity | Words |
|---|---|
| Letter Lab | 130+ words (4 and 5 letters), each with 3-level progressive hints |
| Spelling Academy | 50+ words (3–5 letters) with emojis |
| Word Safari | 32 animals with emojis |
| Puzzle Words | 32 tile words · 15 sentences · 15 rhyme pairs |

Letter Lab includes a full **word editor** (accessible via the grownup gate) to add, edit, or remove words and their hints.

---

## Privacy

Letter Lab collects no personal data. See [letterlab.cc/privacy](https://letterlab.cc/privacy/) for the full policy.

---

*Made with 🩵 for L & G*
