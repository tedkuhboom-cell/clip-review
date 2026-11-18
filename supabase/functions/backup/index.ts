// POST /functions/v1/backup
//   {action:"save",    install_id, key, data}   store this phone's backup (replaces the previous one)
//   {action:"restore", install_id, key}         return the stored backup
// There are no accounts. A phone's restore code is "<install_id>.<key>"; the key is a random secret made on the
// phone, and only its SHA-256 is stored here. Whoever has the restore code can read that one backup, nobody else can.
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED = ["https://tedkuhboom-cell.github.io", "http://localhost:8000", "http://localhost:8765", "http://127.0.0.1:8000"];
const MAX_BYTES = 3_000_000;
const MIN_GAP_MS = 60_000; // at most one save a minute per install
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KEY = /^[0-9a-f]{32}$/;

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

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

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method" });

  const raw = await req.text();
  if (raw.length > MAX_BYTES + 1000) return json(req, 413, { error: "too_big" });
  // deno-lint-ignore no-explicit-any
  let body: any;
  try { body = JSON.parse(raw); } catch (_) { return json(req, 400, { error: "bad_json" }); }
  const install = String(body.install_id ?? ""), key = String(body.key ?? "");
  if (!UUID.test(install) || !KEY.test(key)) return json(req, 400, { error: "bad_request" });
  const hash = await sha256(key);

  const { data: row, error } = await db.from("backups").select("key_hash, updated_at").eq("install_id", install).maybeSingle();
  if (error) return json(req, 500, { error: "server" });

  if (body.action === "save") {
    const data = body.data;
    if (!data || typeof data !== "object" || data.app !== "clip-review") return json(req, 400, { error: "bad_data" });
    const bytes = JSON.stringify(data).length;
    if (bytes > MAX_BYTES) return json(req, 413, { error: "too_big" });
    if (row && row.key_hash !== hash) return json(req, 403, { error: "wrong_key" });
    if (row && Date.now() - Date.parse(row.updated_at) < MIN_GAP_MS) return json(req, 429, { error: "too_soon" });
    const now = new Date().toISOString();
    const { error: saveErr } = await db.from("backups").upsert({ install_id: install, key_hash: hash, data, bytes, updated_at: now });
    if (saveErr) return json(req, 500, { error: "server" });
    return json(req, 200, { saved: now, bytes });
  }

  if (body.action === "restore") {
    // Same reply for "no such install" and "wrong key", so a code can't be probed.
    if (!row || row.key_hash !== hash) return json(req, 404, { error: "not_found" });
    const { data: full, error: readErr } = await db.from("backups").select("data, updated_at").eq("install_id", install).single();
    if (readErr) return json(req, 500, { error: "server" });
    return json(req, 200, { data: full.data, saved: full.updated_at });
  }

  return json(req, 400, { error: "bad_action" });
});
