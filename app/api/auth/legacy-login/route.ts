import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/**
 * Recovery step that runs when a client-side `signInWithPassword` fails.
 *
 * Handles two cases so the retry that runs immediately after on the client can succeed:
 *   1. Legacy Better-Auth users: verify the scrypt hash `salt_hex:hash_hex`
 *      (16-byte salt, 64-byte key); if valid, rotate the Supabase Auth password to the
 *      same plaintext and clear the legacy hash so we never use it again.
 *   2. Unconfirmed users (e.g. corps members whose 6-digit confirmation email never
 *      arrived): mark the email confirmed so Supabase stops rejecting the login with
 *      "Email not confirmed". Confirmation is NOT authentication — the retried
 *      signInWithPassword still requires the correct password — so this is safe.
 */
export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (!email || !password) {
      return NextResponse.json({ ok: false, reason: "missing" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      return NextResponse.json({ ok: false, reason: "server" }, { status: 500 });
    }
    const sb = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedEmail = email.trim().toLowerCase();

    // Look up profile by email
    const { data: profile } = await sb
      .from("profiles")
      .select("id, email, legacy_password_hash")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (!profile?.legacy_password_hash) {
      // No legacy hash to migrate. Before giving up, handle the common case where the
      // account simply never got its email confirmed — confirm it so the client's retry
      // can proceed. The retry still needs the correct password, so this leaks nothing.
      if (profile?.id) {
        const { data: userData } = await sb.auth.admin.getUserById(profile.id);
        const confirmedAt = userData?.user?.email_confirmed_at;
        if (userData?.user && !confirmedAt) {
          const { error: confirmError } = await sb.auth.admin.updateUserById(profile.id, {
            email_confirm: true,
          });
          if (!confirmError) {
            return NextResponse.json({ ok: true, reason: "confirmed_email" });
          }
          return NextResponse.json(
            { ok: false, reason: "confirm_failed", error: confirmError.message },
            { status: 500 },
          );
        }
      }
      return NextResponse.json({ ok: false, reason: "no_legacy" });
    }

    const [saltHex, hashHex] = String(profile.legacy_password_hash).split(":");
    if (!saltHex || !hashHex) {
      return NextResponse.json({ ok: false, reason: "bad_hash" });
    }

    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    let derived: Buffer;
    try {
      derived = await scrypt(password, salt, expected.length);
    } catch {
      return NextResponse.json({ ok: false, reason: "scrypt_error" });
    }

    if (derived.length !== expected.length || !timingSafeEqual(derived, expected)) {
      return NextResponse.json({ ok: false, reason: "invalid" });
    }

    // Verified. Rotate Supabase Auth password to this plaintext so the next
    // signInWithPassword on the client succeeds, then clear the legacy hash.
    const { error: updateError } = await sb.auth.admin.updateUserById(profile.id, {
      password,
    });
    if (updateError) {
      return NextResponse.json({ ok: false, reason: "update_failed", error: updateError.message }, { status: 500 });
    }

    await sb
      .from("profiles")
      .update({ legacy_password_hash: null })
      .eq("id", profile.id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, reason: "exception", error: e?.message ?? String(e) }, { status: 500 });
  }
}
