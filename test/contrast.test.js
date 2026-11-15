const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const css = readFileSync('public/_shared/lab.css', 'utf8');
function tokens(selector) {
  const block = css.slice(css.indexOf(selector)).split('}')[0];
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
}
function rgb(color, bg = [255,255,255]) {
  if (color.startsWith('#')) return color.slice(1).match(/../g).map(v => parseInt(v, 16));
  const [r,g,b,a] = color.match(/[\d.]+/g).map(Number);
  return [r,g,b].map((v,i) => v * a + bg[i] * (1-a));
}
function contrast(fg, bg) {
  const luminance = c => c.map(v => v/255).map(v => v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4).reduce((s,v,i) => s+v*[0.2126,0.7152,0.0722][i],0);
  const b = rgb(bg), x = luminance(rgb(fg,b)), y = luminance(b);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
test('shared text tokens meet AA in both themes', () => {
  const root = tokens(':root {');
  for (const [name,t] of [['light',root],['dark',{...root,...tokens('body.grownup {')}]]) {
    const pairs = ['text','text2','text3'].flatMap(f => ['bg','surface'].map(b => [f,b]));
    pairs.push(['viridian-text','viridian-bg'],['button-text','viridian'],['button-text','viridian-lt'],['correct-txt','correct'],['on-accent','brand-viridian']);
    for (const f of ['admin-text','admin-muted','admin-accent','admin-highlight']) pairs.push([f,'admin-bg']);
    for (const [f,b] of pairs) {
      const background = t[b].startsWith('rgba') ? '#' + rgb(t[b],rgb(t.bg)).map(v => Math.round(v).toString(16).padStart(2,'0')).join('') : t[b];
      const ratio = contrast(t[f],background);
      assert.ok(ratio >= 4.5, `${name} ${f}/${b}: ${ratio.toFixed(2)}`);
    }
  }
});
module.exports = {contrast};
