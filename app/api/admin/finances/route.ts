import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SourceKey = "course" | "reprint" | "credits";

const SOURCE_LABELS: Record<SourceKey, string> = {
  course: "Course enrolment",
  reprint: "Certificate reprint",
  credits: "AI credits",
};

type Row = {
  source: SourceKey;
  user_id: string | null;
  amount_ngn: number;
  at: string;
  ref: string;
};

/**
 * Tallies every successful payment across the site. All revenue currently
 * flows through Flutterwave (NGN) via three tables: post-NYSC course
 * enrolment, certificate reprints, and AI credit purchases. Admin-gated and
 * served with the service role so it sees every user's payments.
 */
export async function GET() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceRoleKey)
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });

  const sb = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [courseRes, reprintRes, creditsRes] = await Promise.all([
    sb
      .from("nysc_course_payments")
      .select("tx_ref,user_id,amount_ngn,status,created_at,verified_at")
      .eq("status", "successful"),
    sb
      .from("nysc_certificate_reprint_payments")
      .select("tx_ref,user_id,amount_ngn,status,created_at,verified_at")
      .eq("status", "successful"),
    sb
      .from("ai_credit_payments")
      .select("tx_ref,user_id,amount_ngn,status,created_at,verified_at")
      .eq("status", "successful"),
  ]);

  const rows: Row[] = [];
  const collect = (source: SourceKey, data: any[] | null) => {
    for (const r of data ?? []) {
      rows.push({
        source,
        user_id: r.user_id ?? null,
        amount_ngn: Number(r.amount_ngn) || 0,
        at: r.verified_at || r.created_at,
        ref: r.tx_ref,
      });
    }
  };
  collect("course", courseRes.data);
  collect("reprint", reprintRes.data);
  collect("credits", creditsRes.data);

  // Resolve payer names/emails for the recent-transactions list.
  const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[];
  const nameMap = new Map<string, { full_name: string | null; email: string | null }>();
  if (userIds.length) {
    const { data: payers } = await sb
      .from("profiles")
      .select("id,full_name,email")
      .in("id", userIds);
    for (const p of payers ?? []) nameMap.set(p.id, { full_name: p.full_name, email: p.email });
  }

  // Per-source breakdown.
  const bySource = (Object.keys(SOURCE_LABELS) as SourceKey[]).map((key) => {
    const srcRows = rows.filter((r) => r.source === key);
    return {
      key,
      label: SOURCE_LABELS[key],
      count: srcRows.length,
      total_ngn: srcRows.reduce((s, r) => s + r.amount_ngn, 0),
    };
  });

  const totalNgn = rows.reduce((s, r) => s + r.amount_ngn, 0);
  const totalCount = rows.length;

  // Last-12-month trend, oldest → newest.
  const now = new Date();
  const months: { key: string; label: string; total_ngn: number; count: number }[] = [];
  const monthIdx = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthIdx.set(key, months.length);
    months.push({
      key,
      label: d.toLocaleString("en-US", { month: "short" }),
      total_ngn: 0,
      count: 0,
    });
  }
  for (const r of rows) {
    if (!r.at) continue;
    const d = new Date(r.at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const i = monthIdx.get(key);
    if (i != null) {
      months[i].total_ngn += r.amount_ngn;
      months[i].count += 1;
    }
  }

  // This-month vs last-month, for a growth indicator.
  const thisMonth = months[months.length - 1]?.total_ngn ?? 0;
  const lastMonth = months[months.length - 2]?.total_ngn ?? 0;

  const recent = [...rows]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 25)
    .map((r) => ({
      ref: r.ref,
      source: r.source,
      source_label: SOURCE_LABELS[r.source],
      amount_ngn: r.amount_ngn,
      at: r.at,
      payer_name: r.user_id ? nameMap.get(r.user_id)?.full_name ?? null : null,
      payer_email: r.user_id ? nameMap.get(r.user_id)?.email ?? null : null,
    }));

  return NextResponse.json({
    summary: {
      total_ngn: totalNgn,
      total_count: totalCount,
      this_month_ngn: thisMonth,
      last_month_ngn: lastMonth,
    },
    by_source: bySource,
    months,
    recent,
  });
}
