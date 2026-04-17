import { supabase } from "@/lib/supabase-client";

export const runtime = "nodejs";

const noStore = { headers: { "Cache-Control": "no-store" } };

/**
 * Lightweight DB connectivity check for Supabase (anon key, RLS-safe).
 * Open in browser: /api/health
 */
export async function GET() {
  if (!supabase) {
    return Response.json(
      {
        ok: false,
        db: "not_configured",
        message: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
        checkedAt: new Date().toISOString(),
      },
      { status: 503, ...noStore },
    );
  }

  const { count, error: countErr } = await supabase
    .from("site_content")
    .select("*", { count: "exact", head: true });
  if (countErr) {
    return Response.json(
      {
        ok: false,
        db: "error",
        message: countErr.message,
        code: countErr.code,
        checkedAt: new Date().toISOString(),
      },
      { status: 503, ...noStore },
    );
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("section_key")
    .limit(1);

  if (error) {
    return Response.json(
      {
        ok: false,
        db: "error",
        message: error.message,
        code: error.code,
        checkedAt: new Date().toISOString(),
      },
      { status: 503, ...noStore },
    );
  }

  return Response.json(
    {
      ok: true,
      db: "connected",
      siteContentRows: count ?? 0,
      sample: data?.[0] ?? null,
      checkedAt: new Date().toISOString(),
    },
    noStore,
  );
}
