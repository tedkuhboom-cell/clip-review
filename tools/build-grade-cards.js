// Builds supabase/functions/grade/cards.json from pack-apex.js: the card text and key-point labels the
// Claude grader needs. Run after any card change, before deploying the function:  node tools/build-grade-cards.js
const fs = require("fs");
const path = require("path");
const { readPack, PACK_FILE } = require("./pack-io.js");
const OUT = path.join(__dirname, "..", "supabase", "functions", "grade", "cards.json");

function build() {
  const P = readPack(PACK_FILE);
  const cards = P.cards.map((c) => ({ id: c.id, title: c.title, recall: c.recall, concept: c.concept, kp: c.kp.map((k) => k[0]), dp: (c.dp || []).map((k) => k[0]) }));
  return JSON.stringify({ pack: P.id + " " + P.version, cards }, null, 1) + "\n";
}

module.exports = { build, OUT };
if (require.main === module) { fs.writeFileSync(OUT, build()); console.log("wrote", path.relative(process.cwd(), OUT)); }
