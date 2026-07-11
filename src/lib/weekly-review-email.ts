import { formatINR } from "@/lib/format";
import type { WeeklyReview } from "@/lib/weekly-review";

/**
 * Plain, inline-styled HTML for the Monday digest. Deliberately simple:
 * email clients punish clever CSS, and the numbers are the product.
 */
export function renderWeeklyReviewEmail(review: WeeklyReview, displayName: string): {
  subject: string;
  html: string;
} {
  const { unit, recon, gstEvents } = review;

  const subject = unit
    ? `Your Monday numbers: ${formatINR(unit.netProfitPerOrder, { decimals: true })}/order at ${unit.rtoRatePercent}% RTO`
    : `Your Monday check-in — ${review.weekLabel}`;

  const unitBlock = unit
    ? `
      <p style="margin:0 0 4px;font-size:13px;color:#666;">Per-order profit at ${unit.rtoRatePercent}% RTO</p>
      <p style="margin:0;font-size:26px;font-weight:700;">${formatINR(unit.netProfitPerOrder, { decimals: true })}
        <span style="font-size:13px;font-weight:400;color:#666;">&nbsp;${unit.netMarginPercent.toFixed(1)}% margin · break-even ROAS ${unit.breakEvenRoas.toFixed(1)}x</span>
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;width:100%;">
        <tr>
          ${unit.projections
            .map(
              (p) => `<td style="padding:8px;border:1px solid #e5e5e5;border-radius:6px;text-align:center;">
                <div style="font-size:11px;color:#888;">${p.orders} orders/wk</div>
                <div style="font-size:15px;font-weight:600;">${formatINR(p.weeklyProfit)}</div>
              </td>`,
            )
            .join('<td style="width:8px;"></td>')}
        </tr>
      </table>`
    : `<p style="margin:0;font-size:14px;color:#444;">No saved unit economics yet — run the margin calculator once and next Monday this email opens with your real per-order profit.</p>`;

  const reconBlock = recon
    ? `<p style="margin:0;font-size:14px;color:#444;">Last payout check: <strong>${formatINR(recon.totalDelta)}</strong> unexplained deductions${recon.flaggedCount > 0 ? `, ${recon.flaggedCount} order${recon.flaggedCount > 1 ? "s" : ""} flagged` : ""} · <strong>${formatINR(recon.tcsEstimate)}</strong> TCS waiting to be claimed on the GST portal.</p>`
    : `<p style="margin:0;font-size:14px;color:#444;">No payout reconciled yet — upload last settlement's CSV and see what the marketplace actually kept.</p>`;

  const gstBlock =
    gstEvents.length > 0
      ? `<ul style="margin:0;padding-left:18px;font-size:14px;color:#444;">
          ${gstEvents
            .map(
              (e) =>
                `<li><strong>${e.filing.form}</strong> — ${e.daysUntilDue === 0 ? "due today" : `in ${e.daysUntilDue} day${e.daysUntilDue === 1 ? "" : "s"}`}</li>`,
            )
            .join("")}
        </ul>`
      : "";

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f6f6;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin:0 0 4px;">Navigator · ${review.weekLabel}</p>
    <h1 style="font-size:20px;margin:0 0 20px;">Monday check-in, ${displayName}.</h1>

    <div style="background:#fff;border:1px solid #e5e5e5;border-radius:10px;padding:18px;margin-bottom:12px;">
      ${unitBlock}
    </div>

    <div style="background:#fff;border:1px solid #e5e5e5;border-radius:10px;padding:18px;margin-bottom:12px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#888;">Payouts</p>
      ${reconBlock}
    </div>

    ${
      gstBlock
        ? `<div style="background:#fff;border:1px solid #e5e5e5;border-radius:10px;padding:18px;margin-bottom:12px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#888;">GST deadlines</p>
      ${gstBlock}
    </div>`
        : ""
    }

    <div style="background:#111;color:#eee;border-radius:10px;padding:18px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#999;">Mentor's read</p>
      <p style="margin:0;font-size:14px;font-style:italic;">&ldquo;${review.mentorLine}&rdquo;</p>
    </div>

    <p style="font-size:12px;color:#888;margin:0;">Route progress: ${review.progress.completedSubTasks}/${review.progress.totalSubTasks} steps · Reply STOP to any of these to switch the digest off.</p>
  </div>
</body></html>`;

  return { subject, html };
}

/** Send via Resend REST API. Returns false (never throws) when not configured. */
export async function sendWeeklyReviewEmail(
  to: string,
  review: WeeklyReview,
  displayName: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WEEKLY_DIGEST_FROM ?? "Navigator <digest@updates.example.com>";
  if (!apiKey) return false;

  const { subject, html } = renderWeeklyReviewEmail(review, displayName);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  return res.ok;
}
