// Drives the real app in headless Chrome (phone-sized) with the two Edge Functions faked.
//   npm install && npm run smoke
// Checks: Claude grading shows per-point notes, a failed call falls back to keywords, the typed answer is saved,
// the weekly goal and Settings panels render, online backup saves and restores, and nothing throws.
const http = require("http");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { chromium } = require("playwright-core");

const ROOT = path.join(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\/$/, "/index.html"));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" }); res.end(fs.readFileSync(file));
});

const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const yesterday = ymd(new Date(Date.now() - 864e5));
const seed = {
  apex_profile_v1: { setup: true, rank: "Silver I", mains: ["Conduit"], newPerDay: 1, aiGrade: true, sendErrors: false },
  apex_manual_v1: { reviews: { "4.1": { box: 1, s: 1, d: 5, due: yesterday, last: yesterday, learned: yesterday, n: 1 }, "3.1": { box: 1, s: 1, d: 5, due: yesterday, last: yesterday, learned: yesterday, n: 1 } }, recall: [], snap: {}, appeals: [], bestStreak: 0 },
};

(async () => {
  await new Promise((r) => server.listen(0, r));
  const url = "http://localhost:" + server.address().port + "/";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.addInitScript((s) => { if (!localStorage.getItem("apex_profile_v1")) for (const k in s) localStorage.setItem(k, JSON.stringify(s[k])); }, seed);

  let gradeMode = "ok", saved = null, gradeBodies = [];
  await page.route("**/functions/v1/grade", async (route) => {
    const body = JSON.parse(route.request().postData()); gradeBodies.push(body);
    if (gradeMode === "down") return route.abort();
    const pts = (n, f) => Array.from({ length: n }, (_, i) => f(i));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      model: "fake", kp: pts(body.card_id === "4.1" ? 3 : 2, (i) => i === 0 ? { status: "covered", hit: true, quote: "x", note: "" } : i === 1 ? { status: "partial", hit: false, quote: "", note: "You named it but didn't say what it does." } : { status: "contradicted", hit: false, quote: "", note: "You said the reverse." }),
      dp: pts(2, (i) => i === 0 ? { status: "contradicted", hit: false, quote: "", note: "You said the reverse here." } : { status: "missing", hit: false, quote: "", note: "Not mentioned." }) }) });
  });
  await page.route("**/functions/v1/backup", async (route) => {
    const body = JSON.parse(route.request().postData());
    if (body.action === "save") { saved = body; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ saved: new Date().toISOString(), bytes: 1 }) }); }
    if (saved && body.install_id === saved.install_id && body.key === saved.key) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: saved.data, saved: new Date().toISOString() }) });
    return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: "not_found" }) });
  });

  await page.goto(url);
  await page.waitForSelector("text=This week");
  assert.ok(await page.locator(".weekdots span").count() === 7, "weekly goal shows seven days");

  // --- a Manual session: one new card to read, then two reviews ---
  await page.click("button:has-text('Start')");
  await page.click("button:has-text('Got it, next')");
  const GOOD = { "4.1": "cover limits how much of me they see, sightlines are what i can see versus them, spacing is distance", "3.1": "fall back and reset, then get info with a scan" };
  const cardId = async () => (await page.locator(".tagrow .tag").nth(1).textContent()).split(" ")[0];
  const first = await cardId();
  await page.fill("#recall-input", GOOD[first]);
  await page.click("button:has-text('Check my answer')");
  await page.waitForSelector("text=Graded on meaning by Claude.");
  assert.ok(await page.locator(".ainote").count() >= 2, "notes shown for the points that weren't covered");
  assert.ok(await page.locator("text=Partly there.").count() >= 1 && await page.locator("text=Opposite.").count() >= 1);
  assert.strictEqual(gradeBodies[0].answer, GOOD[first]);
  assert.strictEqual(gradeBodies[0].card_id, first);
  assert.ok(/^[0-9a-f-]{36}$/.test(gradeBodies[0].install_id) && gradeBodies[0].card_id, "request carries install id and card id only");
  assert.deepStrictEqual(Object.keys(gradeBodies[0]).sort(), ["answer", "card_id", "install_id"]);
  await page.click("button:has-text('Next card')");

  gradeMode = "down";   // Claude unreachable: the keyword grade is used and the app says so
  const second = await cardId();
  await page.fill("#recall-input", GOOD[second]);
  await page.click("button:has-text('Check my answer')");
  await page.waitForSelector("text=Claude couldn't be reached");
  assert.ok(await page.locator(".verdictbar.got").count() === 1, "keyword fallback graded the answer");
  await page.click("button:has-text('Next card')");

  const recall = await page.evaluate(() => JSON.parse(localStorage.getItem("apex_manual_v1")).recall);
  assert.strictEqual(recall.length, 2);
  assert.ok(recall[0].a === GOOD[first] && recall[0].by === "c", "answer text saved, graded by Claude");
  assert.ok(recall[1].a === GOOD[second] && recall[1].by === "k", "answer text saved, graded by keywords");

  // --- Library shows the last answer ---
  await page.click("button:has-text('End')").catch(() => {});
  await page.click("button:has-text('Library')");
  await page.waitForSelector("text=Your last answer");

  // --- Settings: grading, weekly goal, online backup ---
  await page.click("#gear");
  await page.waitForSelector("text=Answer grading");
  await page.waitForSelector("text=Practice days per week");
  await page.locator("section:has(h2:text('Online backup')) button:has-text('On')").click();
  await page.waitForSelector("text=Your restore code");
  await page.waitForFunction(() => document.body.textContent.includes("Last online backup: today"));
  assert.ok(saved && saved.data.app === "clip-review" && saved.data.manual.recall.length === 2, "backup sent with the saved answers");
  const code = await page.evaluate(() => { const c = JSON.parse(localStorage.getItem("apex_cloud")); return JSON.parse(localStorage.getItem("apex_install_id")) + "." + c.key; });

  // --- a fresh phone restores from the code ---
  const ctx2 = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: "block" });
  const p2 = await ctx2.newPage();
  p2.on("pageerror", (e) => errors.push("phone 2: " + e));
  await p2.route("**/functions/v1/backup", async (route) => {
    const body = JSON.parse(route.request().postData());
    const ok = body.action === "restore" && body.install_id + "." + body.key === code;
    await route.fulfill({ status: ok ? 200 : 404, contentType: "application/json", body: JSON.stringify(ok ? { data: saved.data, saved: new Date().toISOString() } : { error: "not_found" }) });
  });
  await p2.goto(url);
  await p2.click("text=Or restore an online backup with a code");
  await p2.fill("#setup-code", code);
  await p2.click("button:has-text('Restore from code')");
  await p2.waitForSelector("text=This week");
  const r2 = await p2.evaluate(() => ({ recall: JSON.parse(localStorage.getItem("apex_manual_v1")).recall.length, install: JSON.parse(localStorage.getItem("apex_install_id")) }));
  assert.strictEqual(r2.recall, 2, "restored phone has the answers");
  assert.strictEqual(r2.install, code.split(".")[0], "restored phone keeps backing up to the same code");

  assert.deepStrictEqual(errors, [], "no page errors");
  await browser.close(); server.close();
  console.log("browser smoke test passed");
})().catch((e) => { console.error(e); process.exit(1); });
