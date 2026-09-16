import type { SupabaseClient } from "@supabase/supabase-js";
import { createAndSendCampaign } from "@/lib/email/send";
import { resolveSegment } from "@/lib/email/mass";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.deeptalentplatform.com").replace(/\/$/, "");

/**
 * Branded reminder body for the "Get Global Workforce Ready" course. Kept in
 * one place so the cron trigger and any manual admin send stay identical.
 */
function reminderBodyHtml(): string {
  const trainingUrl = `${APP_URL}/nysc/training`;
  return `
<h1 style="margin:0 0 16px;font-size:22px;color:#111827;font-weight:800;">Your training is live 🎉</h1>
<p style="margin:0 0 14px;">
The <strong>Get Global Workforce Ready</strong> course is now live. Lesson 1 — <em>The Global Remote Market</em> — is unlocked, and new modules are ready for you to work through at your own pace.
</p>
<p style="margin:0 0 14px;">
Sign in to your DeepTalent dashboard to pick up where you left off. If you haven't completed your enrolment yet (NGN 5,000), you can finish it from the training page and jump straight into the recorded sessions.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;">
<tr><td style="border-radius:8px;background:#3B5BDB;">
<a href="${trainingUrl}" style="display:inline-block;padding:13px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">Watch the training now</a>
</td></tr>
</table>
<p style="margin:0 0 6px;color:#6b7280;font-size:13px;">What's inside:</p>
<ul style="margin:0 0 14px;padding-left:20px;color:#374151;font-size:14px;line-height:1.7;">
<li>13 modules across global work culture, AI tools and remote employability</li>
<li>A live practical session on Google Meet</li>
<li>Certificate of completion</li>
</ul>
<p style="margin:0;color:#6b7280;font-size:13px;">See you inside — the DeepTalent team.</p>`;
}

export type TrainingReminderResult = {
  ok: boolean;
  sent: number;
  failed: number;
  recipients: number;
  campaignId: string | null;
  error?: string;
};

/**
 * Sends the training-live reminder to everyone registered for the course
 * (training track picked at signup, or already paid). Reuses the shared
 * campaign sender so it is logged, batched and rate-limited like any other
 * mass email.
 */
export async function sendTrainingReminders(
  service: SupabaseClient,
  opts?: { subject?: string; createdByEmail?: string | null }
): Promise<TrainingReminderResult> {
  const recipients = await resolveSegment(service, "training_registrants");
  if (recipients.length === 0) {
    return { ok: true, sent: 0, failed: 0, recipients: 0, campaignId: null };
  }

  const result = await createAndSendCampaign({
    service,
    fromKey: "memo",
    subject: opts?.subject || "Your Global Workforce Ready training is live",
    bodyHtml: reminderBodyHtml(),
    previewText: "Lesson 1 is unlocked — jump into your training now.",
    recipients,
    segment: "training_registrants",
    createdByEmail: opts?.createdByEmail ?? null,
  });

  return {
    ok: result.ok,
    sent: result.sent,
    failed: result.failed,
    recipients: recipients.length,
    campaignId: result.campaignId,
    error: result.error,
  };
}
