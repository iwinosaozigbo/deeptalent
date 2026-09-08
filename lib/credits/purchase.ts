import { createClient } from "@supabase/supabase-js";
import { initializeFlutterwavePayment, verifyFlutterwaveTransaction } from "@/lib/flutterwave";
import { getPackage, packageTotalCredits, type CreditPackage } from "@/lib/credits/packages";

/**
 * AI-credit purchases via Flutterwave (NGN). Mirrors the proven post-NYSC
 * course payment flow in lib/nysc/payment.ts: a pending row is recorded keyed
 * by tx_ref so the callback verifies against the amount/credits/user we
 * actually issued — never whatever a client-controlled redirect claims.
 */

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function generateTxRef(userId: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `dt-credits-${userId.slice(0, 8)}-${Date.now()}-${random}`;
}

export interface StartPurchaseResult {
  success: boolean;
  link?: string;
  error?: string;
}

/** Starts a Flutterwave checkout for a credit pack. */
export async function startCreditPurchase(
  userId: string,
  email: string,
  fullName: string,
  packageId: string,
  redirectOrigin: string
): Promise<StartPurchaseResult> {
  const pkg: CreditPackage | undefined = getPackage(packageId);
  if (!pkg) return { success: false, error: "Invalid package" };

  const totalCredits = packageTotalCredits(pkg);
  const sb = serviceClient();
  const txRef = generateTxRef(userId);

  const { error: insertError } = await sb.from("ai_credit_payments").insert({
    tx_ref: txRef,
    user_id: userId,
    package_id: pkg.id,
    credits: totalCredits,
    amount_ngn: pkg.priceNgn,
    status: "pending",
  });

  if (insertError) {
    return { success: false, error: "Could not start payment. Please try again." };
  }

  const result = await initializeFlutterwavePayment({
    txRef,
    amount: pkg.priceNgn,
    redirectUrl: `${redirectOrigin}/api/credits/payment/callback`,
    customer: { email, name: fullName },
    title: "DeepTalent — AI Credits",
    description: `${pkg.label} pack · ${totalCredits} AI credits`,
  });

  if (!result.success || !result.link) {
    return { success: false, error: result.error || "Failed to start payment" };
  }

  return { success: true, link: result.link };
}

export interface ConfirmPurchaseResult {
  success: boolean;
  alreadyProcessed?: boolean;
  userId?: string;
  credits?: number;
  error?: string;
}

/**
 * Verifies a transaction against Flutterwave's own servers, then grants the
 * credits and logs the ledger row exactly once. Idempotent — safe to call
 * from both the browser redirect callback and any webhook.
 */
export async function confirmCreditPurchase(transactionId: string): Promise<ConfirmPurchaseResult> {
  const verified = await verifyFlutterwaveTransaction(transactionId);
  if (!verified.success || !verified.txRef) {
    return { success: false, error: verified.error || "Verification failed" };
  }

  const sb = serviceClient();
  const { data: payment } = await sb
    .from("ai_credit_payments")
    .select("tx_ref, user_id, package_id, credits, amount_ngn, status")
    .eq("tx_ref", verified.txRef)
    .maybeSingle();

  if (!payment) {
    return { success: false, error: "No matching payment record" };
  }

  if (payment.status === "successful") {
    return { success: true, alreadyProcessed: true, userId: payment.user_id };
  }

  const isValid =
    verified.status === "successful" &&
    verified.currency === "NGN" &&
    (verified.amount ?? 0) >= payment.amount_ngn;

  if (!isValid) {
    await sb.from("ai_credit_payments").update({ status: "failed" }).eq("tx_ref", verified.txRef);
    return { success: false, error: "Payment could not be verified as successful" };
  }

  const now = new Date().toISOString();

  await sb
    .from("ai_credit_payments")
    .update({ status: "successful", flutterwave_transaction_id: transactionId, verified_at: now })
    .eq("tx_ref", verified.txRef);

  // Log the grant first; the unique partial index on flw_tx_ref makes this the
  // dedupe gate so a concurrent callback + webhook can never double-grant.
  const { error: insertErr } = await sb.from("ai_credit_transactions").insert({
    user_id: payment.user_id,
    delta: payment.credits,
    tool: null,
    description: `Purchased ${payment.credits} credits (${payment.package_id})`,
    flw_tx_ref: verified.txRef,
  });

  // Someone already granted for this tx_ref — return the current balance.
  if (insertErr) {
    const { data: p } = await sb
      .from("profiles")
      .select("ai_credits")
      .eq("id", payment.user_id)
      .single();
    return { success: true, alreadyProcessed: true, userId: payment.user_id, credits: p?.ai_credits ?? 0 };
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("ai_credits")
    .eq("id", payment.user_id)
    .single();
  const newBalance = (profile?.ai_credits ?? 0) + payment.credits;

  await sb.from("profiles").update({ ai_credits: newBalance }).eq("id", payment.user_id);

  return { success: true, userId: payment.user_id, credits: newBalance };
}
