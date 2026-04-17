export const runtime = "nodejs";

export async function GET() {
  // Safe-to-expose values only (anon key is meant for browsers).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";

  return Response.json({
    supabaseUrl,
    supabaseAnonKey,
    adminEmails,
  });
}

