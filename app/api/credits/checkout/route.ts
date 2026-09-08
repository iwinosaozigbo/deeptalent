import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startCreditPurchase } from "@/lib/credits/purchase";

/**
 * POST /api/credits/checkout
 * Body: { packageId: string }
 * Starts a Flutterwave (NGN) hosted checkout for a credit pack and returns its URL.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packageId } = await req.json();
  if (!packageId || typeof packageId !== "string") {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const email = user.email || "";
  const fullName = profile?.full_name || user.user_metadata?.full_name || email || "DeepTalent user";

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    new URL(req.url).origin;

  const result = await startCreditPurchase(user.id, email, fullName, packageId, origin);
  if (!result.success || !result.link) {
    return NextResponse.json({ error: result.error || "Could not start checkout" }, { status: 400 });
  }

  return NextResponse.json({ url: result.link });
}
