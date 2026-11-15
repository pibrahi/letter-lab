const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function headerBlock(text) {
  const lines = text.split(/\r?\n/);
  const block = [];
  let on = false;
  for (const line of lines) {
    if (line.trim() === "/*") {
      on = true;
      continue;
    }
    if (!on) continue;
    if (line.trim() === "" || line.startsWith("#") || !line.startsWith(" ")) break;
    block.push(line.trim());
  }
  return block.join("\n");
}

test("Spelling Academy has no badge printing feature", () => {
  for (const file of walk(path.join(root, "public/spelling-academy"))) {
    const content = fs.readFileSync(file, "utf8");
    for (const needle of ["window.print", "printBadgeBtn", "@media print"]) {
      assert.equal(content.includes(needle), false, `${path.relative(root, file)} contains ${needle}`);
    }
  }
  assert.doesNotMatch(read("public/index.html"), /<span\b[^>]*class="card-mode-tag"[^>]*>\s*Hero Badge\s*<\/span>/);
});

test("security headers cover every path", () => {
  const headers = read("public/_headers");
  const block = headerBlock(headers);
  assert.ok(block.includes("Strict-Transport-Security: max-age=31536000; includeSubDomains"));
  assert.equal(block.includes("preload"), false);

  const required = [
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "X-Frame-Options: DENY",
    "Cross-Origin-Opener-Policy: same-origin",
    "Cross-Origin-Resource-Policy: same-origin",
    "Content-Type: text/html; charset=utf-8",
  ];
  for (const line of required) assert.ok(block.includes(line), line);

  const policy = block.match(/^Permissions-Policy: (.+)$/m);
  assert.ok(policy, "Permissions-Policy");
  for (const feature of [
    "camera",
    "microphone",
    "geolocation",
    "payment",
    "usb",
    "serial",
    "hid",
    "midi",
    "display-capture",
    "accelerometer",
    "gyroscope",
    "magnetometer",
    "browsing-topics",
  ]) {
    assert.ok(policy[1].includes(`${feature}=()`), feature);
  }
});

test("content security policy is strict", () => {
  const block = headerBlock(read("public/_headers"));
  const csp = block.match(/^Content-Security-Policy: (.+)$/m);
  assert.ok(csp, "Content-Security-Policy");
  const value = csp[1];
  for (const directive of [
    "default-src 'self'",
    "script-src 'self' https://static.cloudflareinsights.com",
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ]) {
    assert.ok(value.includes(directive), directive);
  }
  assert.equal(value.includes("unsafe-inline"), false);
  assert.equal(value.includes("unsafe-eval"), false);
});

test("html has no inline scripts, styles, or handlers", () => {
  const htmlFiles = walk(path.join(root, "public")).filter((file) => file.endsWith(".html"));
  assert.ok(htmlFiles.length >= 6);
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);
    assert.equal(/<style[\s>]/i.test(html), false, rel);
    assert.equal(/<[^>]*\sstyle\s*=/i.test(html), false, rel);
    assert.equal(/<[^>]*\son[a-z]+\s*=/i.test(html), false, rel);
    assert.equal(/<script(?![^>]*\bsrc\s*=)[^>]*>/i.test(html), false, rel);
  }
});

test("google font hosts are gone", () => {
  const needles = ["fonts.googleapis", "fonts.gstatic"];
  const skip = new Set([path.join(root, "package-lock.json")]);
  for (const file of walk(root)) {
    if (skip.has(file) || file.startsWith(path.join(root, "test") + path.sep)) continue;
    if (file.endsWith(".woff2")) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const needle of needles) {
      assert.equal(text.includes(needle), false, `${path.relative(root, file)} contains ${needle}`);
    }
  }
});

test("custom 404 page is wired up", () => {
  assert.equal(fs.existsSync(path.join(root, "public/404.html")), true);
  const config = read("wrangler.toml");
  assert.match(config, /not_found_handling\s*=\s*"404-page"/);
});

test("workers.dev is off and www is a custom domain", () => {
  const config = read("wrangler.toml");
  assert.match(config, /workers_dev\s*=\s*false/);
  assert.match(config, /preview_urls\s*=\s*true/);
  assert.match(config, /pattern\s*=\s*"www\.letterlab\.cc"/);
  assert.match(config, /pattern\s*=\s*"letterlab\.cc"/);
  assert.match(config, /custom_domain\s*=\s*true/);
});
