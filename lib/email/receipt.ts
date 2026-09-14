import { Resend } from "resend";
import { resolveSender, renderCampaignHtml } from "@/lib/email/mass";

export type ReceiptItem = { label: string; value: string };

export type ReceiptInput = {
  to: string;
  name?: string | null;
  /** Human title for the thing purchased, e.g. "Get Global Workforce Ready course". */
  item: string;
  amountNgn: number;
  /** Flutterwave tx_ref — doubles as the receipt number. */
  reference: string;
  /** ISO string of when the payment was verified. Defaults to now. */
  paidAt?: string | null;
  /** Optional extra rows (e.g. credits granted). */
  extras?: ReceiptItem[];
};

export type SendReceiptResult = { ok: boolean; id?: string | null; error?: string };

function ngn(value: number) {
  return `₦${(value || 0).toLocaleString("en-NG")}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function receiptBody(input: ReceiptInput): string {
  const paid = input.paidAt ? new Date(input.paidAt) : new Date();
  const dateStr = Number.isNaN(paid.getTime())
    ? new Date().toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : paid.toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const rows: ReceiptItem[] = [
    { label: "Receipt no.", value: escapeHtml(input.reference) },
    { label: "Date", value: dateStr },
    { label: "Item", value: escapeHtml(input.item) },
    ...(input.extras ?? []).map((e) => ({ label: escapeHtml(e.label), value: escapeHtml(e.value) })),
    { label: "Payment method", value: "Flutterwave" },
  ];

  const rowsHtml = rows
    .map(
      (r) =>
        `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">${r.label}</td><td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${r.value}</td></tr>`
    )
    .join("");

  const greeting = input.name ? `Hi ${escapeHtml(input.name.split(" ")[0])},` : "Hi there,";

  return `
<p style="margin:0 0 16px;">${greeting}</p>
<p style="margin:0 0 20px;">Thank you for your payment. This email is your receipt — a confirmation that we&apos;ve received your payment in full. Please keep it for your records.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
<tr><td style="background:#3B5BDB;padding:16px 20px;">
<span style="color:#ffffff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Amount paid</span>
<div style="color:#ffffff;font-size:28px;font-weight:800;margin-top:2px;">${ngn(input.amountNgn)}</div>
</td></tr>
<tr><td style="padding:16px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
</td></tr>
</table>

<p style="margin:0 0 8px;font-size:13px;color:#6b7280;">If you have any questions about this payment, just reply to this email and our team will help.</p>
<p style="margin:0;font-size:13px;color:#6b7280;">— The DeepTalent Team</p>`;
}

/**
 * Sends a branded payment receipt via Resend. Best-effort: never throws, so a
 * transient email failure can never roll back or block a verified payment.
 * Callers should fire this only after a payment is confirmed successful.
 */
export async function sendPaymentReceipt(input: ReceiptInput): Promise<SendReceiptResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { ok: false, error: "RESEND_API_KEY not configured" };
    }
    const email = (input.to || "").trim();
    if (!email || !email.includes("@")) {
      return { ok: false, error: "No valid recipient email" };
    }

    const sender = resolveSender("noreply");
    const subject = `Your DeepTalent receipt — ${ngn(input.amountNgn)}`;
    const html = renderCampaignHtml({
      subject,
      bodyHtml: receiptBody(input),
      replyTo: sender.replyTo,
      previewText: `Receipt for ${input.item} — ${ngn(input.amountNgn)}`,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: sender.from,
      to: email,
      replyTo: sender.replyTo,
      subject,
      html,
      headers: { "X-Entity-Ref-ID": input.reference },
      tags: [{ name: "type", value: "receipt" }],
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true, id: (data as any)?.id ?? null };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to send receipt" };
  }
}
