import nodemailer from "nodemailer";
import { getSiteUrl } from "@/lib/siteUrl";

function getAuthTransporter() {
  const user = process.env.SMTP_EMAIL;
  const pass = (process.env.SMTP_APP_PASSWORD ?? process.env.SMTP_PASSWORD)?.replace(/\s/g, "");
  if (!user || !pass) throw new Error("SMTP_EMAIL and SMTP_APP_PASSWORD must be set.");
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

export function getNotifyEmails(): string[] {
  const raw = process.env.NOTIFY_EMAIL?.trim() || process.env.SMTP_EMAIL?.trim();
  if (!raw) return [];
  return raw.split(/[,;\s]+/).map((e) => e.trim()).filter(Boolean);
}

export function getNotifyEmail(): string | null {
  const emails = getNotifyEmails();
  return emails.length ? emails.join(", ") : null;
}

export function notifyAdminInBackground(send: (to: string) => Promise<void>): void {
  const to = getNotifyEmail();
  if (!to) return;
  void send(to).catch((err) => console.error("[notify]", err));
}

export async function notifyAdminEmail(send: (to: string) => Promise<void>): Promise<void> {
  const to = getNotifyEmail();
  if (!to) return;
  try {
    await send(to);
  } catch (err) {
    console.error("[notify]", err);
  }
}

export function toMailUserError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (lower.includes("smtp_email")) return "Email is not configured. Please try again later.";
  if (lower.includes("535") || lower.includes("badcredentials") || lower.includes("invalid login")) {
    return "We could not send the email right now. Please try again later.";
  }
  return "We could not send the email. Please try again later.";
}

function emailShell(title: string, bodyHtml: string) {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#e8e0ff">
      <div style="background:linear-gradient(135deg,#7c3aed,#2e1a47);color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
        <strong style="font-size:18px;letter-spacing:0.1em">${title}</strong>
      </div>
      <div style="background:#1f1230;border:1px solid rgba(124,58,237,0.25);border-top:none;padding:28px 24px;border-radius:0 0 12px 12px">
        ${bodyHtml}
      </div>
    </div>
  `;
}

const FROM_NAME = "QRZ";

export async function sendRegistrationOtpEmail({
  to,
  displayName,
  code,
}: {
  to: string;
  displayName: string;
  code: string;
}) {
  const from = process.env.SMTP_EMAIL!.trim();
  const transporter = getAuthTransporter();
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${from}>`,
    to,
    subject: "Verify your QRZ account",
    text: `Hi ${displayName},\n\nYour QRZ verification code is: ${code}\n\nExpires in 10 minutes.\n\n73!`,
    html: emailShell(
      "QRZ",
      `<p>Hi <strong>${displayName}</strong>,</p>
       <p style="color:rgba(232,224,255,0.75)">Enter this code to verify your email:</p>
       <p style="font-size:32px;font-weight:700;letter-spacing:0.3em;font-family:monospace;color:#a78bfa">${code}</p>
       <p style="font-size:13px;color:rgba(232,224,255,0.45)">Expires in 10 minutes.</p>`
    ),
  });
}

export async function sendPasswordResetOtpEmail({ to, code }: { to: string; code: string }) {
  const from = process.env.SMTP_EMAIL!.trim();
  const transporter = getAuthTransporter();
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${from}>`,
    to,
    subject: "Your QRZ password reset code",
    text: `Your password reset code is: ${code}\n\nExpires in 10 minutes.`,
    html: emailShell(
      "QRZ",
      `<p>Password reset requested.</p>
       <p style="color:rgba(232,224,255,0.75)">Enter this code:</p>
       <p style="font-size:32px;font-weight:700;letter-spacing:0.3em;font-family:monospace;color:#a78bfa">${code}</p>`
    ),
  });
}

export async function sendAdminSupportNotificationEmail({
  to,
  userName,
  email,
  subject,
  message,
}: {
  to: string;
  userName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const from = process.env.SMTP_EMAIL!.trim();
  const transporter = getAuthTransporter();
  const adminHref = `${getSiteUrl()}/admin/support`;
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${from}>`,
    to,
    subject: `Support: ${subject}`,
    html: emailShell(
      "QRZ Support",
      `<p><strong>${userName}</strong> ${email ? `(${email})` : ""}</p>
       <p style="color:rgba(232,224,255,0.75)">${subject}</p>
       <p style="white-space:pre-wrap">${message}</p>
       <a href="${adminHref}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">Open inbox</a>`
    ),
  });
}

export async function sendAdminRegistrationNotificationEmail({
  to,
  displayName,
  email,
}: {
  to: string;
  displayName: string;
  email: string;
}) {
  const from = process.env.SMTP_EMAIL!.trim();
  const transporter = getAuthTransporter();
  const adminHref = `${getSiteUrl()}/admin/users`;
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${from}>`,
    to,
    subject: `New QRZ user: ${displayName}`,
    html: emailShell(
      "QRZ: New user",
      `<p><strong>${displayName}</strong></p><p>${email}</p>
       <a href="${adminHref}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">View users</a>`
    ),
  });
}
