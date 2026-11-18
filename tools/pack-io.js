// Read and write the content pack so that git diffs stay readable:
// one top-level key per block, one array item (card, reason, theme...) per line.
const fs = require("fs");
const path = require("path");
const HEADER = "/* Clip Review content pack: Apex Legends. The app engine reads window.PACK; a different game is a different pack file. */";

function readPack(file) {
  const src = fs.readFileSync(file, "utf8");
  const sandbox = {};
  new Function("window", src)(sandbox);
  if (!sandbox.PACK) throw new Error("No window.PACK in " + file);
  return sandbox.PACK;
}

function formatPack(P) {
  const out = [HEADER, "window.PACK = {"];
  const keys = Object.keys(P);
  keys.forEach((k, i) => {
    const v = P[k], comma = i < keys.length - 1 ? "," : "";
    const big = JSON.stringify(v).length > 400;
    if (Array.isArray(v) && big) {
      out.push(JSON.stringify(k) + ": [");
      v.forEach((item, j) => out.push("  " + JSON.stringify(item) + (j < v.length - 1 ? "," : "")));
      out.push("]" + comma);
    } else if (v && typeof v === "object" && !Array.isArray(v) && big) {
      out.push(JSON.stringify(k) + ": {");
      const sub = Object.keys(v);
      sub.forEach((s, j) => out.push("  " + JSON.stringify(s) + ": " + JSON.stringify(v[s]) + (j < sub.length - 1 ? "," : "")));
      out.push("}" + comma);
    } else out.push(JSON.stringify(k) + ": " + JSON.stringify(v) + comma);
  });
  out.push("};", "");
  return out.join("\n");
}

function writePack(file, P) { fs.writeFileSync(file, formatPack(P)); }

module.exports = { readPack, formatPack, writePack, PACK_FILE: path.join(__dirname, "..", "pack-apex.js") };

if (require.main === module) {   // node tools/pack-io.js  -> rewrites pack-apex.js in the readable layout
  const P = readPack(module.exports.PACK_FILE);
  writePack(module.exports.PACK_FILE, P);
  const again = readPack(module.exports.PACK_FILE);
  if (JSON.stringify(again) !== JSON.stringify(P)) throw new Error("Pack changed while reformatting");
  console.log("pack-apex.js formatted:", P.cards.length, "cards, content unchanged");
}
