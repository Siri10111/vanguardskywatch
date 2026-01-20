import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const secret = req.headers.get("x-bootstrap-secret");
  if (!secret || secret !== process.env.BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { orgName, email, password } = await req.json();
  if (!orgName || !email || !password) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const sb = supabaseServer();

  const { data: org, error: orgErr } = await sb
    .from("orgs")
    .insert({ name: orgName })
    .select()
    .single();

  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 400 });

  const { data: created, error: userErr } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userErr || !created.user) {
    return NextResponse.json({ error: userErr?.message || "createUser_failed" }, { status: 400 });
  }

  const { error: profErr } = await sb.from("profiles").insert({
    user_id: created.user.id,
    org_id: org.id,
    role: "admin",
    enabled: true,
  });

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, org_id: org.id, user_id: created.user.id });
}
