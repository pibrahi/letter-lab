# NumberLab games

Dino Egg Rescue (`public/numbers/games/dino-egg-rescue/`) and Rocket Fuel (`rocket-fuel/`) use the same simple pattern: one question, a big picture or equation, and two or three big tap answers. The slim top bar has a home link, the current level and five stars. Pictures use neat rows of five; larger numbers use numerals. Early-level answers include dot patterns.

Rounds contain five questions. Only the first answer is recorded. Correct answers turn green, earn a star and show an egg hatching or a rocket lifting off. Wrong answers fade while the correct answer pulses gently, then the game advances automatically. The end screen shows baby dinos or a rocket and planets, confetti, replay and home buttons. Reduced motion disables animations and confetti. Focus moves only after keyboard clicks; status updates use a polite live region.

`games/shared/simple-game.js` exposes `NumberLab.simpleGame.start({skill, engine, item, theme})`. It owns storage, adaptation, challenge generation (including previous type and Builder kind avoidance), question rendering, answer buttons, stars, rewards, rounds and replay. `simple-game.css` provides the shared layout, themed token colours, focus rings and reduced-motion rules. Each game keeps `index.html`, a configuration-only `game.js`, and small theme-only `game.css`.

Scripts load in order: shared lab helpers, levels, adaptation, store, counting, addition for Rocket only, shared runner, game configuration. Styles load lab.css, shared runner CSS, then theme CSS. All are external to preserve the strict CSP.

The pure deterministic counting engine offers count, more and four-number missing sequences. The addition engine offers two-addend sums and missing addends, keeping five Builder fact kinds with no consecutive kind repeats. Every challenge has distinct bounded number choices. Both games adapt independently using the validated `nl_v1` record. No audio, names or accounts are used. The remaining three games stay coming soon.

Compare questions link the first group and answer in viridian and the second in gold, including numeral groups. A small, aria-hidden scale cues comparison. Paired pictures use up to three columns with items sized to the available group width; the header, sequences and equations also fit narrow phones.

`test/numbers-layout.test.js` uses puppeteer-core and Chrome (`CHROME_PATH` or `/usr/bin/google-chrome`) with a local static server. It checks all six tiers in both games at 320, 375, 390, 430 and 1280px, in both colour themes, using fixed worst cases and 20 seeded real challenges per tier. It checks every visible element’s bounds and picture descendants’ internal overflow, including clipping hidden by body overflow. Missing Chrome skips locally and fails in CI.
