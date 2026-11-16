/* global window, document, getComputedStyle, innerWidth, innerHeight */
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

const viewports = [[320,568], [375,667], [390,844], [430,932], [1280,800]];
const countingCases = [
  {type:'count', count:20, answer:20, choices:[19,20,18]},
  ...[[10,9], [4,2], [1,10], [99,98]].map(([left,right]) => ({type:'more', left, right, answer:Math.max(left,right), choices:[left,right]})),
  {type:'missing', sequence:[120,110,100,90,80], blankIndex:2, answer:100, choices:[99,100,101]},
  {type:'missing', sequence:[100,95,90,85], blankIndex:1, answer:95, choices:[94,95,96]},
];
const additionCases = [
  ...[[10,10], [9,9], [1,19], [78,19]].map(([a,b]) => ({type:'add', a, b, answer:a+b, choices:[a+b-1,a+b,a+b+1]})),
  ...[[10,20], [73,100]].map(([a,total]) => ({type:'missing', a, total, answer:total-a, choices:[total-a-1,total-a,total-a+1]})),
];

test('NumberLab pictures and controls fit every supported viewport and tier', {timeout:90000}, async t => {
  const executablePath = process.env.CHROME_PATH || '/usr/bin/google-chrome';
  if (!fs.existsSync(executablePath)) {
    assert.ok(!process.env.CI, `Chrome not found at ${executablePath}; set CHROME_PATH`);
    t.skip(`Chrome not found at ${executablePath}; set CHROME_PATH to run layout coverage`);
    return;
  }
  const root = path.resolve('public');
  const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.png':'image/png', '.ico':'image/x-icon'};
  const server = http.createServer(async (req,res) => {
    try {
      let file = path.resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
      if (!file.startsWith(`${root}${path.sep}`)) { res.writeHead(403).end(); return; }
      if ((await fs.promises.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await fs.promises.readFile(file);
      res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'}).end(body);
    } catch { res.writeHead(404).end(); }
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise((resolve,reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const browser = await puppeteer.launch({executablePath, headless:true, args:['--no-sandbox', '--disable-dev-shm-usage']});
  t.after(() => browser.close());
  for (const [game,skill,cases] of [['dino-egg-rescue','counting',countingCases], ['rocket-fuel','addition',additionCases]]) {
    for (const [width,height] of viewports) for (let tier = 0; tier <= 5; tier++) {
      const page = await browser.newPage();
      try {
        await page.setViewport({width,height,isMobile:width < 500,hasTouch:width < 500});
        await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
        await page.evaluateOnNewDocument(({tier,skill}) => {
          // Seed both the initial render and the subsequent real challenges.
          let seed = 12345 + tier;
          Math.random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
          const later = window.setTimeout.bind(window);
          window.setTimeout = (fn, _delay, ...args) => later(fn, 0, ...args);
          localStorage.clear();
          localStorage.setItem('nl_v1', JSON.stringify({version:1,startTier:tier,floorTier:tier,skills:{[skill]:{tier,streak:0,recent:[],hintLevel:0,answered:0,correct:0}},grownup:false}));
        }, {tier,skill});
        await page.goto(`http://127.0.0.1:${server.address().port}/numbers/games/${game}/`, {waitUntil:'load'});
        await page.evaluate(() => document.fonts.ready);
        const failures = await page.evaluate(async ({skill,tier,cases}) => {
          const engine = window.NumberLab[skill], real = engine.makeChallenge;
          const queue = [...cases.map(c => ({...c,tier})), ...Array.from({length:20}, () => real(tier, Math.random))];
          let index = -1;
          engine.makeChallenge = () => queue[++index];
          // Keep the tested tier stable while still exercising real answer/round behaviour.
          window.NumberLab.adapt.recordAnswer = state => ({state});
          document.getElementById('again').click();
          const failures = [];
          function inspect(c) {
            const selector = el => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${[...el.classList].map(v => `.${v}`).join('')}`;
            for (const el of document.querySelectorAll('main, main *')) {
              const r = el.getBoundingClientRect();
              if (!r.width || !r.height || getComputedStyle(el).visibility !== 'visible') continue;
              if (r.left < -0.5 || r.top < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5) failures.push({selector:selector(el),case:c,rect:r.toJSON()});
            }
            for (const el of document.querySelectorAll('.picture, .picture *')) {
              if (el.scrollWidth > el.clientWidth + 1) failures.push({selector:selector(el),case:c,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth});
            }
          }
          for (let n = 0; n < queue.length; n++) {
            if (index !== n) throw new Error(`Expected challenge ${n}, rendered ${index}`);
            // Check both token themes on the same rendered challenge.
            document.body.classList.remove('grownup'); inspect(queue[n]);
            document.body.classList.add('grownup'); inspect(queue[n]);
            if (n === queue.length - 1) break;
            document.querySelector('#actions button').click();
            await new Promise(resolve => setTimeout(resolve, 0));
            if (document.getElementById('play').hidden) document.getElementById('again').click();
          }
          return failures;
        }, {skill,tier,cases});
        assert.deepEqual(failures, [], `${game} tier ${tier} at ${width}x${height}: ${JSON.stringify(failures)}`);
      } finally { await page.close(); }
    }
  }
});
