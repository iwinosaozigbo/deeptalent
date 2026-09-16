import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { LESSONS } from "@/lib/nysc/course-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireUser() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  return userData.user;
}

// GET /api/nysc/assignments — the signed-in corps member's own submissions
export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = serviceClient();
  const { data, error } = await sb
    .from("nysc_assignment_submissions")
    .select("id, lesson_code, lesson_title, content, link_url, status, admin_note, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

// POST /api/nysc/assignments — submit (or resubmit) an assignment for a lesson
export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const lessonCode = typeof body?.lessonCode === "string" ? body.lessonCode.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const linkUrl = typeof body?.linkUrl === "string" ? body.linkUrl.trim() : "";

  const lesson = LESSONS.find((l) => l.code === lessonCode);
  if (!lesson || !lesson.assignmentPrompt) {
    return NextResponse.json({ error: "This module does not accept assignment submissions." }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "Please write your submission before sending it." }, { status: 400 });
  }
  if (linkUrl) {
    try {
      new URL(linkUrl);
    } catch {
      return NextResponse.json({ error: "That link doesn't look valid." }, { status: 400 });
    }
  }

  const sb = serviceClient();
  const { data, error } = await sb
    .from("nysc_assignment_submissions")
    .insert({
      user_id: user.id,
      lesson_code: lesson.code,
      lesson_title: lesson.title,
      content,
      link_url: linkUrl || null,
      status: "submitted",
    })
    .select("id, lesson_code, lesson_title, content, link_url, status, admin_note, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ row: data });
}
