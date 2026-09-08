import { NextRequest, NextResponse } from "next/server";
import { confirmCreditPurchase } from "@/lib/credits/purchase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Browser-facing redirect target after a Flutterwave credit-pack checkout.
 * We only trust `transaction_id` and re-verify it server-side, never the
 * client-controlled `status` param. On success we bounce back to the AI tools
 * with a flag the CreditsBadge uses to refresh the balance.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const transactionId = searchParams.get("transaction_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

  if (!transactionId) {
    return NextResponse.redirect(`${appUrl}/dashboard?tab=coverLetter&credits_purchased=0`);
  }

  const result = await confirmCreditPurchase(transactionId);
  return NextResponse.redirect(
    `${appUrl}/dashboard?tab=coverLetter&credits_purchased=${result.success ? "1" : "0"}`
  );
}
