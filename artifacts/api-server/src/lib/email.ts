import { logger } from "./logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL ?? "Pantry & Plate <noreply@pantryplate.app>";

export async function sendPasswordResetEmail(
  toEmail: string,
  displayName: string,
  resetUrl: string,
): Promise<void> {
  if (!RESEND_API_KEY) {
    logger.info({ resetUrl }, "RESEND_API_KEY not set — password reset link logged for dev");
    return;
  }

  const body = {
    from: FROM_EMAIL,
    to: [toEmail],
    subject: "Reset your Pantry & Plate password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#e07b12;margin-bottom:8px">Pantry &amp; Plate</h2>
        <p>Hi ${escapeHtml(displayName)},</p>
        <p>We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}" style="background:#e07b12;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
        </p>
        <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
        <p style="color:#888;font-size:13px">Or copy this link: ${resetUrl}</p>
      </div>
    `,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text }, "Resend API error sending reset email");
    throw new Error("Failed to send password reset email");
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
