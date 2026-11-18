// How loose is each accepted phrasing? For every key point, grade the model answers of all OTHER cards
// against it and report how often each phrasing hits. A phrasing that hits many unrelated answers is too generic.
//   node tools/grader-report.js           summary + the loosest phrasings
//   node tools/grader-report.js 4.1       every phrasing on one card
const { readPack, PACK_FILE } = require("./pack-io.js");
const { loadGrader } = require("../tests/engine.js");
const G = loadGrader(), P = readPack(PACK_FILE);
const toks = (s) => G.gnorm(s).split(" ").filter(Boolean);
const model = (c) => (c.kp || []).concat(c.dp || []).map((k) => k[0]).join(". ");
const foreign = P.cards.map((c) => ({ id: c.id, mod: c.mod, t: toks(model(c)) }));
const only = process.argv[2];
const rows = [];
let selfMiss = 0, points = 0, alts = 0;
P.cards.forEach((c) => {
  ["kp", "dp"].forEach((kind) => (c[kind] || []).forEach((k, i) => {
    points++;
    if (!k[1].some((a) => G.altHit(a, toks(k[0])))) { selfMiss++; if (!only) console.log("label does not match its own phrasings:", c.id, kind + i, k[0]); }
    k[1].forEach((a) => {
      alts++;
      const others = foreign.filter((f) => f.id !== c.id);
      const hit = others.filter((f) => G.altHit(a, f.t)).length;
      rows.push({ id: c.id, pt: kind + i, alt: a, rate: hit / others.length, must: kind === "kp" });
    });
  }));
});
if (only) rows.filter((r) => r.id === only).forEach((r) => console.log(r.pt, JSON.stringify(r.alt), Math.round(r.rate * 100) + "%"));
else {
  const loose = rows.filter((r) => r.rate >= 0.15).sort((a, b) => b.rate - a.rate);
  console.log(points + " points, " + alts + " phrasings, " + selfMiss + " labels that miss their own phrasings");
  console.log(loose.length + " phrasings hit 15%+ of other cards' model answers; " + loose.filter((r) => r.must).length + " of them on must-have points");
  loose.slice(0, +process.env.TOP || 40).forEach((r) => console.log(" ", r.id, r.pt, JSON.stringify(r.alt), Math.round(r.rate * 100) + "%"));
}
