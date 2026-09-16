import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") return null;
  return userData.user;
}

// GET /api/admin/assignments — every submission, with the submitter's profile
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = serviceClient();
  const { data, error } = await sb
    .from("nysc_assignment_submissions")
    .select(
      "id, user_id, lesson_code, lesson_title, content, link_url, status, admin_note, created_at, updated_at, profiles(full_name, email, nysc_state_code)"
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

// PATCH /api/admin/assignments — mark a submission reviewed, with an optional note
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const status = body?.status === "reviewed" ? "reviewed" : body?.status === "submitted" ? "submitted" : null;
  const adminNote = typeof body?.adminNote === "string" ? body.adminNote.trim() : undefined;

  if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

  const sb = serviceClient();
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (adminNote !== undefined) update.admin_note = adminNote || null;

  const { data, error } = await sb
    .from("nysc_assignment_submissions")
    .update(update)
    .eq("id", id)
    .select("id, status, admin_note")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ row: data });
}
