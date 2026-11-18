// Reads tests/grader-cases.txt into [{id, kind, expect:[bool per must-have point], answer}].
const fs = require("fs");
const path = require("path");
function loadCases(P) {
  const byId = Object.fromEntries(P.cards.map((c) => [c.id, c]));
  return fs.readFileSync(path.join(__dirname, "grader-cases.txt"), "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && l[0] !== "#").map((l) => {
    const parts = l.split("|"), id = parts[0].trim(), tag = parts[1].trim(), answer = parts.slice(2).join("|").trim(), card = byId[id];
    if (!card) throw new Error("Unknown card in grader-cases.txt: " + id);
    const n = card.kp.length, kind = tag[0];
    const expect = kind === "R" ? card.kp.map(() => true) : kind === "W" ? card.kp.map(() => false) : tag.slice(1).trim().split("").map((d) => d === "1");
    if (expect.length !== n) throw new Error("Card " + id + " has " + n + " must-have points but the case lists " + expect.length);
    return { id, kind, expect, answer, card };
  });
}
// Score a grader: fn(case) -> array of booleans (one per must-have point)
function score(cases, hitsOf) {
  const out = { R: { ok: 0, n: 0 }, W: { ok: 0, n: 0 }, P: { ok: 0, n: 0 }, points: { ok: 0, n: 0 }, wrong: [] };
  cases.forEach((c, i) => {
    const hits = hitsOf(c, i), allOk = hits.every((h, j) => !!h === c.expect[j]);
    out[c.kind].n++; if (allOk) out[c.kind].ok++; else out.wrong.push(c.id + " " + c.kind + " expected " + c.expect.map(Number).join("") + " got " + hits.map(Number).join(""));
    hits.forEach((h, j) => { out.points.n++; if (!!h === c.expect[j]) out.points.ok++; });
  });
  return out;
}
const line = (s) => "right answers fully credited " + s.R.ok + "/" + s.R.n + " · wrong answers given no credit " + s.W.ok + "/" + s.W.n + " · partly right exact " + s.P.ok + "/" + s.P.n + " · points correct " + Math.round(1000 * s.points.ok / s.points.n) / 10 + "%";
module.exports = { loadCases, score, line };
