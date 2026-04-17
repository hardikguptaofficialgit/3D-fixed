/**
 * Supabase DB migration helper (source -> destination).
 *
 * Loads env from project root: `.env` then `.env.local` (later overrides).
 *
 * Usage:
 *   npm run migrate:db
 * Or (PowerShell) with explicit env:
 *   $env:SRC_SUPABASE_URL="..."; ...
 *   node scripts/migrate-supabase.mjs
 *
 * Notes:
 * - Requires Service Role keys for full read/write.
 * - This migrates table rows only. Storage objects are not copied here.
 */

import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
loadEnv({ path: join(root, ".env") });
loadEnv({ path: join(root, ".env.local") });

const SRC_SUPABASE_URL = process.env.SRC_SUPABASE_URL;
const SRC_SUPABASE_SERVICE_KEY = process.env.SRC_SUPABASE_SERVICE_KEY;
const DST_SUPABASE_URL = process.env.DST_SUPABASE_URL;
const DST_SUPABASE_SERVICE_KEY = process.env.DST_SUPABASE_SERVICE_KEY;

if (!SRC_SUPABASE_URL || !SRC_SUPABASE_SERVICE_KEY || !DST_SUPABASE_URL || !DST_SUPABASE_SERVICE_KEY) {
  console.error("Missing env vars. Need SRC_SUPABASE_URL, SRC_SUPABASE_SERVICE_KEY, DST_SUPABASE_URL, DST_SUPABASE_SERVICE_KEY.");
  process.exit(1);
}

const src = createClient(SRC_SUPABASE_URL, SRC_SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
const dst = createClient(DST_SUPABASE_URL, DST_SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

const TABLES = [
  { name: "site_content", pk: "section_key" },
  { name: "design_settings", pk: "setting_key" },
  { name: "media_slots", pk: "id" },
  { name: "messages", pk: "id" },
  { name: "activity_log", pk: "id" },
  { name: "tickets", pk: "id" },
  { name: "ticket_messages", pk: "id" },
  { name: "bot_settings", pk: "setting_key" },
];

async function migrateTable({ name, pk }) {
  const { data, error } = await src.from(name).select("*");
  if (error) throw new Error(`[SRC] ${name}: ${error.message}`);

  if (!data || data.length === 0) {
    console.log(`[SKIP] ${name}: no rows`);
    return;
  }

  // Chunk upserts to avoid payload limits.
  const chunkSize = 500;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { error: upsertErr } = await dst.from(name).upsert(chunk, { onConflict: pk });
    if (upsertErr) throw new Error(`[DST] ${name}: ${upsertErr.message}`);
    console.log(`[OK] ${name}: upserted ${Math.min(i + chunkSize, data.length)}/${data.length}`);
  }
}

async function main() {
  for (const t of TABLES) {
    try {
      await migrateTable(t);
    } catch (e) {
      console.error(`[FAIL] ${t.name}:`, e.message || e);
      process.exitCode = 1;
      return;
    }
  }
  console.log("Done.");
}

main();

