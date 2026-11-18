// node --test tests/      Keyword grader, scheduler and content pack checks. No dependencies.
const test = require("node:test");
const assert = require("node:assert");
const { loadGrader, loadScheduler } = require("./engine.js");
const { readPack, formatPack, PACK_FILE } = require("../tools/pack-io.js");
const { loadCases, score, line } = require("./cases.js");
const fs = require("fs");
const G = loadGrader(), P = readPack(PACK_FILE);
const toks = (s) => G.gnorm(s).split(" ").filter(Boolean);

test("every key point's own wording matches its accepted phrasings", () => {
  P.cards.forEach((c) => (c.kp || []).concat(c.dp || []).forEach((k) =>
    assert.ok(k[1].some((a) => G.altHit(a, toks(k[0]))), c.id + ": " + k[0])));
});

test("each card's model answer grades Got it", () => {
  P.cards.forEach((c) => assert.strictEqual(G.gradeAnswer(c.kp.map((k) => k[0]).join(". "), c.kp).grade, "got", c.id));
});

test("typos and near-words: a one-letter typo counts on long words, look-alike short words do not", () => {
  assert.ok(G.altHit("disengage", toks("we should disengege now")));
  assert.ok(!G.altHit("sight", toks("take the fight on the right")));
  assert.ok(!G.altHit("flight", toks("a fair fight")));
});

test("words of a phrasing must be close together", () => {
  assert.ok(G.altHit("back off", toks("i would back off and heal")));
  assert.ok(!G.altHit("back off", toks("get back to the team and then later on when the fight is done and everything is calm turn the music off")));
});

test("empty and one-word answers are a miss", () => {
  assert.strictEqual(G.gradeAnswer("", P.cards[0].kp).grade, "miss");
  assert.strictEqual(G.gradeAnswer("cover", P.cards[0].kp).grade, "miss");
});

test("test answers: right answers in other words are credited (floor, raise it as the grader improves)", () => {
  const s = score(loadCases(P), (c) => G.gradeAnswer(c.answer, c.card.kp).hits);
  console.log("  keyword grader on tests/grader-cases.txt: " + line(s));
  assert.ok(s.R.ok / s.R.n >= 0.9, "right answers fully credited fell below 90%: " + line(s));
  assert.ok(s.points.ok / s.points.n >= 0.8, "point accuracy fell below 80%: " + line(s));
});

test("scheduler: a miss comes back tomorrow, Shaky within 3 days, better grades space further out", () => {
  const F = loadScheduler(0.9), t = "2026-11-01";
  let rev = F.schedule(null, "got", t, false);
  for (let i = 0; i < 2; i++) rev = F.schedule(rev, "got", rev.due, false);
  const day = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
  const miss = F.schedule(rev, "miss", rev.due, false), shaky = F.schedule(rev, "shaky", rev.due, false);
  const got = F.schedule(rev, "got", rev.due, false), full = F.schedule(rev, "got", rev.due, true);
  assert.strictEqual(day(rev.due, miss.due), 1);
  assert.ok(day(rev.due, shaky.due) <= 3);
  assert.ok(day(rev.due, got.due) > 3);
  assert.ok(day(rev.due, full.due) > day(rev.due, got.due));
  assert.ok(day(rev.due, got.due) <= 365, "gaps are capped at a year");
  assert.ok(shaky.s <= rev.s, "Shaky must not raise memory strength");
});

test("content pack: ids are unique and every reference points at a real card", () => {
  const ids = P.cards.map((c) => c.id), set = new Set(ids);
  assert.strictEqual(set.size, ids.length, "duplicate card id");
  P.cards.forEach((c) => {
    assert.ok(c.title && c.concept && c.recall && c.drill, c.id + " is missing a field");
    assert.ok(Array.isArray(c.kp) && c.kp.length >= 1, c.id + " has no must-have points");
    c.kp.concat(c.dp || []).forEach((k) => assert.ok(typeof k[0] === "string" && Array.isArray(k[1]) && k[1].length, c.id + " has a malformed point"));
  });
  (P.newOrder || []).forEach((id) => assert.ok(set.has(id), "newOrder lists unknown card " + id));
  (P.themes || []).forEach((t) => t.cards.forEach((id) => assert.ok(set.has(id), "theme " + t.id + " lists unknown card " + id)));
});

test("content pack file is in the readable layout (run: node tools/pack-io.js)", () => {
  assert.strictEqual(fs.readFileSync(PACK_FILE, "utf8").replace(/\r\n/g, "\n"), formatPack(P));
});

test("the Claude grader has an up-to-date copy of the cards (run: node tools/build-grade-cards.js)", () => {
  const { build, OUT } = require("../tools/build-grade-cards.js");
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(OUT, "utf8")), JSON.parse(build()));
});
