// Recoil: pattern data and the drawing score.  node --test "tests/*.test.js"
const test = require("node:test");
const assert = require("node:assert");
const { loadRecoil } = require("./engine.js");
const { readPack, PACK_FILE } = require("../tools/pack-io.js");
const R = loadRecoil(), P = readPack(PACK_FILE);
const GUNS = P.recoilGuns;

// draw a pull the way a finger would: scaled up, moved, optional change to the side pulls
const draw = (pull, f) => R.rcResample(pull, 60).map((q) => (f || ((p) => p))([q[0] * 2.7 + 50, q[1] * 2.7 + 20]));

test("recoil guns: unique ids, known groups, a pull that starts at 0,0 and goes down, a fire rate", () => {
  const ids = new Set();
  GUNS.forEach((g) => {
    assert.ok(!ids.has(g.id), "duplicate " + g.id); ids.add(g.id);
    assert.ok(P.recoilGroups[g.group], g.id + " has an unknown group");
    assert.ok(g.pull.length >= 8, g.id + " has too few shots");
    assert.deepStrictEqual(g.pull[0], [0, 0], g.id + " should start at 0,0");
    assert.ok(g.pull[g.pull.length - 1][1] > 30, g.id + " should pull down");
    assert.ok(g.rps > 0 && g.rps < 30, g.id + " fire rate");
  });
});

test("drawing score: the real pull scores Got it, a mirror image and a straight line don't", () => {
  GUNS.forEach((g) => {
    assert.strictEqual(R.rcGrade(R.rcScore(g.pull, draw(g.pull)).score), "got", g.id + " exact");
    assert.strictEqual(R.rcScore(g.pull, draw(g.pull, (p) => [100 - p[0], p[1]])).score, 0, g.id + " mirrored");
    const H = Math.max(...g.pull.map((q) => q[1]));
    const straight = Array.from({ length: 30 }, (_, i) => [50, 20 + (i * H * 2.7) / 29]);
    assert.notStrictEqual(R.rcGrade(R.rcScore(g.pull, straight).score), "got", g.id + " straight line");
  });
});

test("drawing score: size doesn't matter, side-pull proportions do", () => {
  const g = GUNS.find((x) => x.id === "r301");
  const tiny = R.rcResample(g.pull, 60).map((q) => [q[0] * 0.8 + 10, q[1] * 0.8 + 10]);
  assert.ok(R.rcScore(g.pull, tiny).score > 0.85, "a small but accurate drawing still matches");
  const wide = draw(g.pull, (p) => [50 + (p[0] - 50) * 2.2, p[1]]);
  assert.notStrictEqual(R.rcGrade(R.rcScore(g.pull, wide).score), "got", "side pulls twice too big is not Got it");
});

test("drawing hint names the first part that goes the wrong way", () => {
  const g = GUNS.find((x) => x.id === "re45");
  const res = R.rcScore(g.pull, draw(g.pull, (p) => [100 - p[0], p[1]]));
  assert.match(R.rcHint(res), /^Start: the gun needs you to pull down and left\. You pulled down and right\.$/);
  assert.strictEqual(R.rcHint(R.rcScore(g.pull, draw(g.pull))), "That's the shape.");
  assert.match(R.rcHint(R.rcScore(g.pull, [[1, 1]])), /^Draw one stroke/);
});

test("spray timing: bursts pause, the Devotion winds up", () => {
  const prowler = GUNS.find((x) => x.id === "prowler"), dev = GUNS.find((x) => x.id === "devotion");
  assert.ok(R.rcInterval(prowler, 5) > R.rcInterval(prowler, 4) + 200, "pause after a 5-round burst");
  assert.ok(R.rcInterval(dev, 1) > R.rcInterval(dev, 12) * 2, "Devotion starts slow and speeds up");
});

test("stick recipe: a few steps that cover every shot in order, each at least 3 shots", () => {
  GUNS.forEach((g) => {
    const plan = R.rcPlan(g);
    assert.ok(plan.length >= 1 && plan.length <= 5, g.id + " has " + plan.length + " steps");
    assert.strictEqual(plan[0].from, 1, g.id);
    assert.strictEqual(plan[plan.length - 1].to, g.pull.length, g.id);
    plan.forEach((x, i) => {
      assert.ok(x.text, g.id + " step text");
      if (i) assert.strictEqual(x.from, plan[i - 1].to + 1, g.id + " steps are contiguous");
      if (plan.length > 1) assert.ok(x.to - x.from + 1 >= 3, g.id + " step " + (i + 1) + " is too short to remember");
    });
    assert.strictEqual(R.rcStepOf(plan, 1), 0);
    assert.strictEqual(R.rcStepOf(plan, g.pull.length), plan.length - 1);
  });
});

test("stick recipe matches the shape: RE-45 leans left throughout, Spitfire swings right, left, right, left", () => {
  const dirs = (id) => R.rcPlan(GUNS.find((x) => x.id === id)).map((x) => Math.sign(x.h));
  assert.ok(dirs("re45").every((d) => d === -1));
  assert.deepStrictEqual(dirs("spitfire"), [1, -1, 1, -1]);
  assert.deepStrictEqual(dirs("3030"), [0]);
});
