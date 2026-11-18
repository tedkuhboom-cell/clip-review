// POST /functions/v1/grade  {install_id, card_id, answer}
// Grades a typed recall answer with Claude and returns, per key point, whether it was covered and why not.
// The Claude API key lives here as a secret (ANTHROPIC_API_KEY), never in the app.
// The card's key points come from cards.json (built from pack-apex.js), not from the request.
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";
import cards from "./cards.json" with { type: "json" };
import { DEFAULT_MODEL, MAX_ANSWER, finalize, parseResponse, requestBody } from "./core.mjs";

const ALLOWED = ["https://tedkuhboom-cell.github.io", "http://localhost:8000", "http://localhost:8765", "http://127.0.0.1:8000"];
const PER_INSTALL = Number(Deno.env.get("GRADE_DAILY_PER_INSTALL") ?? 200); // answers per phone per day
const GLOBAL = Number(Deno.env.get("GRADE_DAILY_TOTAL") ?? 3000); // answers per day, all phones (cost guard)
const MODEL = Deno.env.get("GRADE_MODEL") ?? DEFAULT_MODEL;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
// deno-lint-ignore no-explicit-any
const pack = cards as any;
// deno-lint-ignore no-explicit-any
const byId = new Map<string, any>(pack.cards.map((c: any) => [c.id, c]));

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
const json = (req: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method" });

  let body: { install_id?: string; card_id?: string; answer?: string };
  try { body = await req.json(); } catch (_) { return json(req, 400, { error: "bad_json" }); }
  const install = String(body.install_id ?? ""), answer = String(body.answer ?? "").trim();
  const card = byId.get(String(body.card_id ?? ""));
  if (!UUID.test(install) || !card) return json(req, 400, { error: "bad_request" });
  if (answer.length < 2 || answer.length > MAX_ANSWER) return json(req, 400, { error: "answer_length" });

  // Daily limits, counted in the database so they hold across function instances.
  const { data: allowed, error: limitErr } = await db.rpc("grade_take", { p_install: install, p_per_install: PER_INSTALL, p_global: GLOBAL });
  if (limitErr) return json(req, 500, { error: "limit_check" });
  if (!allowed) return json(req, 429, { error: "daily_limit" });

  const started = Date.now();
  try {
    const response = await anthropic.messages.create(requestBody(card, answer, MODEL), { timeout: 20_000, maxRetries: 1 });
    const parsed = parseResponse(response);
    if (!parsed) return json(req, 502, { error: response.stop_reason === "refusal" ? "refused" : "no_result" });
    const result = finalize(card, answer, parsed);
    // Keep the graded answer so the grader can be checked and tuned later. A failed save never blocks the reply.
    db.from("grades").insert({
      install_id: install, pack: pack.pack, card_id: card.id, answer, result, model: response.model,
      input_tokens: response.usage?.input_tokens ?? null, output_tokens: response.usage?.output_tokens ?? null, ms: Date.now() - started,
    }).then(() => {}, () => {});
    return json(req, 200, { ...result, model: response.model });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json(req, 429, { error: "busy" });
    if (e instanceof Anthropic.APIConnectionError) return json(req, 504, { error: "timeout" });
    if (e instanceof Anthropic.APIError) return json(req, 502, { error: "claude_" + (e.status ?? "error") });
    return json(req, 500, { error: "server" });
  }
});
