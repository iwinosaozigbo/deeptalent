import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { sendPaymentReceipt } from "@/lib/email/receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SourceKey = "course" | "reprint" | "credits";

const SOURCE_TABLE: Record<SourceKey, string> = {
  course: "nysc_course_payments",
  reprint: "nysc_certificate_reprint_payments",
  credits: "ai_credit_payments",
};

const SOURCE_ITEM: Record<SourceKey, string> = {
  course: "Get Global Workforce Ready — post-NYSC course enrolment",
  reprint: "NYSC certificate reprint",
  credits: "AI credits",
};

/**
 * Admin-triggered (re)send of a payment receipt. Looks the payment up by its
 * source table + tx_ref using the service role, resolves the payer, and emails
 * a branded receipt. Used from the Finances tab so an admin can re-issue a
 * receipt to anyone who has paid.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const source = body?.source as SourceKey | undefined;
  const ref = typeof body?.ref === "string" ? body.ref.trim() : "";
  if (!source || !SOURCE_TABLE[source] || !ref) {
    return NextResponse.json({ error: "Missing or invalid source/ref" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceRoleKey)
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });

  const sb = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: payment } = await sb
    .from(SOURCE_TABLE[source])
    .select("tx_ref, user_id, amount_ngn, status, created_at, verified_at, credits")
    .eq("tx_ref", ref)
    .maybeSingle();

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (payment.status !== "successful") {
    return NextResponse.json({ error: "Payment is not successful" }, { status: 400 });
  }

  const { data: payer } = await sb
    .from("profiles")
    .select("email, full_name")
    .eq("id", payment.user_id)
    .single();

  if (!payer?.email) {
    return NextResponse.json({ error: "No email on file for this payer" }, { status: 400 });
  }

  const extras =
    source === "credits" && payment.credits
      ? [{ label: "Credits added", value: `+${payment.credits}` }]
      : source === "reprint"
        ? [{ label: "Reprint credits", value: "+1" }]
        : undefined;

  const result = await sendPaymentReceipt({
    to: payer.email,
    name: payer.full_name,
    item: SOURCE_ITEM[source],
    amountNgn: Number(payment.amount_ngn) || 0,
    reference: payment.tx_ref,
    paidAt: payment.verified_at || payment.created_at,
    extras,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Failed to send receipt" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, email: payer.email });
}
