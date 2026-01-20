import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: u, error } = await supabase.auth.getUser(token);
  if (error || !u.user) return NextResponse.json({ error: "invalid_token" }, { status: 401 });

  // Use the token as the auth context for RLS-protected queries:
  const authed = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: users, error: qErr } = await authed.from("profiles").select("user_id, role, enabled");
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 403 });

  return NextResponse.json({ ok: true, users });
}
