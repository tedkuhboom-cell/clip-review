// Compare Claude models as the answer grader, on the hand-written answers in tests/grader-cases.txt.
// Uses the exact prompt and checks the Edge Function uses (supabase/functions/grade/core.mjs).
//
//   npm install                      (once: installs the Anthropic SDK)
//   set ANTHROPIC_API_KEY=sk-ant-... (PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-...")
//   node tests/eval-claude.mjs                       Haiku only (cheapest; under $0.10 for the whole file)
//   node tests/eval-claude.mjs haiku sonnet opus     all three (a few dollars at most)
//
// This spends real money on your API account. Results are also written to tests/eval-results/<model>.json.
import Anthropic from "@anthropic-ai/sdk";
import { createRequire } from "node:module";
import fs from "node:fs";
import { finalize, parseResponse, requestBody } from "../supabase/functions/grade/core.mjs";

const require = createRequire(import.meta.url);
const { readPack, PACK_FILE } = require("../tools/pack-io.js");
const { loadCases, score, line } = require("./cases.js");
const { loadGrader } = require("./engine.js");

const MODELS = { haiku: "claude-haiku-5-5", sonnet: "claude-sonnet-5-5", opus: "claude-opus-5-5" };
const PRICE = { "claude-haiku-5-5": [0.1, 0.5], "claude-sonnet-5-5": [2, 10], "claude-opus-5-5": [4, 20] }; // $ per million tokens in / out
const want = process.argv.slice(2).length ? process.argv.slice(2) : ["haiku"];
const P = readPack(PACK_FILE), cases = loadCases(P);
const cardFor = (c) => ({ id: c.card.id, title: c.card.title, recall: c.card.recall, concept: c.card.concept, kp: c.card.kp.map((k) => k[0]), dp: (c.card.dp || []).map((k) => k[0]) });
const client = new Anthropic({ maxRetries: 3 });

const G = loadGrader();
console.log("keyword grader: " + line(score(cases, (c) => G.gradeAnswer(c.answer, c.card.kp).hits)));

for (const name of want) {
  const model = MODELS[name] || name, out = new Array(cases.length);
  let next = 0, tin = 0, tout = 0, failed = 0, unverified = 0;
  async function worker() {
    while (next < cases.length) {
      const i = next++, c = cases[i], t0 = Date.now();
      try {
        const res = await client.messages.create(requestBody(cardFor(c), c.answer, model));
        tin += res.usage.input_tokens; tout += res.usage.output_tokens;
        const parsed = parseResponse(res);
        if (!parsed) { failed++; out[i] = { ms: Date.now() - t0, result: null, stop: res.stop_reason }; continue; }
        const result = finalize(cardFor(c), c.answer, parsed);
        unverified += result.kp.filter((p) => p.unverified).length;
        out[i] = { ms: Date.now() - t0, result };
      } catch (e) {
        if (e instanceof Anthropic.AuthenticationError) { console.error("The API key was rejected. Check ANTHROPIC_API_KEY."); process.exit(1); }
        failed++; out[i] = { ms: Date.now() - t0, result: null, error: e instanceof Anthropic.APIError ? e.status + " " + e.message : String(e) };
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  const s = score(cases, (c, i) => (out[i].result ? out[i].result.kp.map((p) => p.hit) : c.card.kp.map(() => false)));
  const ms = out.map((o) => o.ms).sort((a, b) => a - b), price = PRICE[model];
  console.log("\n" + model + ": " + line(s));
  console.log("  median " + ms[Math.floor(ms.length / 2)] + " ms, slowest 10% over " + ms[Math.floor(ms.length * 0.9)] + " ms" +
    (price ? ", about $" + ((tin * price[0] + tout * price[1]) / 1e6 / cases.length).toFixed(5) + " per answer ($" + ((tin * price[0] + tout * price[1]) / 1e6).toFixed(2) + " for this run)" : "") +
    ", failed calls " + failed + ", credited points dropped for a quote that is not in the answer " + unverified);
  s.wrong.forEach((w) => console.log("  " + w));
  fs.mkdirSync(new URL("./eval-results/", import.meta.url), { recursive: true });
  fs.writeFileSync(new URL("./eval-results/" + model + ".json", import.meta.url), JSON.stringify(cases.map((c, i) => ({ id: c.id, kind: c.kind, expect: c.expect, answer: c.answer, ...out[i] })), null, 1));
}
