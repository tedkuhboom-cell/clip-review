// Apply a phrasings file (see tools/phrasings-*.txt) to pack-apex.js.
//   node tools/apply-phrasings.js tools/phrasings-2026-11-17.txt          dry run: shows what would change
//   node tools/apply-phrasings.js tools/phrasings-2026-11-17.txt --write  writes pack-apex.js
// Guard: a new phrasing is rejected when it also matches the text of more than MAX_FOREIGN of the other cards
// (their explanation plus key points). That is what stops a generic word from handing out credit.
const fs = require("fs");
const { readPack, writePack, PACK_FILE } = require("./pack-io.js");
const { loadGrader } = require("../tests/engine.js");
const MAX_FOREIGN = +process.env.MAX_FOREIGN || 0.06;
const G = loadGrader(), P = readPack(PACK_FILE);
const toks = (s) => G.gnorm(s).split(" ").filter(Boolean);
const corpus = P.cards.map((c) => ({ id: c.id, t: toks(c.concept + ". " + (c.kp || []).concat(c.dp || []).map((k) => k[0]).join(". ")) }));
const byId = Object.fromEntries(P.cards.map((c) => [c.id, c]));
const foreignRate = (alt, id) => { const o = corpus.filter((f) => f.id !== id); return o.filter((f) => G.altHit(alt, f.t)).length / o.length; };

const file = process.argv[2], write = process.argv.includes("--write");
let added = 0, removed = 0, rejected = [], dup = 0;
fs.readFileSync(file, "utf8").split(/\r?\n/).forEach((line, n) => {
  line = line.trim(); if (!line || line[0] === "#") return;
  const m = line.match(/^(\S+) ([kd])(\d+) ([+-]) (.*)$/);
  if (!m) throw new Error("Line " + (n + 1) + " not understood: " + line);
  const card = byId[m[1]], pt = card && (m[2] === "k" ? card.kp : card.dp || [])[+m[3]];
  if (!pt) throw new Error("Line " + (n + 1) + ": no such point " + m[1] + " " + m[2] + m[3]);
  const list = m[5].split(";").map((x) => x.trim()).filter(Boolean);
  if (m[4] === "-") list.forEach((a) => { const i = pt[1].indexOf(a); if (i < 0) throw new Error("Line " + (n + 1) + ": phrasing to remove not found: " + a); pt[1].splice(i, 1); removed++; });
  else list.forEach((a) => {
    const norm = G.gnorm(a);
    if (pt[1].some((x) => G.gnorm(x) === norm)) { dup++; return; }
    const r = foreignRate(a, card.id);
    if (r > MAX_FOREIGN) { rejected.push(card.id + " " + m[2] + m[3] + " " + JSON.stringify(a) + " " + Math.round(r * 100) + "%"); return; }
    pt[1].push(a); added++;
  });
});
// every key point's own wording must still match
P.cards.forEach((c) => (c.kp || []).concat(c.dp || []).forEach((k) => { if (!k[1].some((a) => G.altHit(a, toks(k[0])))) throw new Error("After the change, the label no longer matches its own phrasings: " + c.id + " " + k[0]); }));
console.log("added " + added + ", removed " + removed + ", already there " + dup + ", rejected as too generic " + rejected.length);
if (process.argv.includes("--rejected")) rejected.forEach((r) => console.log("  " + r));
if (write) { writePack(PACK_FILE, P); console.log("pack-apex.js written"); }
