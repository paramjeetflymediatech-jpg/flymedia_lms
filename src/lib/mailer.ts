import nodemailer from 'nodemailer';

// ── Transporter ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST === 'smtp.gmail.com' ? '74.125.200.109' : (process.env.SMTP_HOST || 'smtp.gmail.com'),
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    servername: process.env.SMTP_HOST || 'smtp.gmail.com',
  }
});

const defaultFromEmail = process.env.SMTP_USER || 'anujguptaflymedia@gmail.com';
const FROM = process.env.SMTP_FROM || `"Flymedia Technology" <${defaultFromEmail}>`;

// ── Receivers & Utility Helpers ────────────────────────────────
/**
 * Parse comma, semicolon, space, or newline separated email addresses.
 */
export function parseEmailList(value?: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return Array.from(new Set(value.flatMap(v => parseEmailList(v))));
  }
  return Array.from(
    new Set(
      value
        .split(/[,;\n\r\s]+/)
        .map(e => e.trim().replace(/^['"]|['"]$/g, ''))
        .filter(e => Boolean(e) && e.includes('@'))
    )
  );
}

/**
 * Retrieves recipient email addresses from environment variables.
 *
 * Supports:
 * 1. Specific role lookup:
 *    - e.g. getEmailReceivers('admin') checks ADMIN_EMAIL, ADMIN_EMAILS, ADMIN_RECEIVERS, etc.
 *    - e.g. getEmailReceivers('superadmin') checks SUPERADMIN_EMAIL, SUPERADMIN_EMAILS, etc.
 *
 * 2. Combined receivers for general admin alerts (default):
 *    - SMTP_RECEIVERS (comma/semicolon/newline separated list)
 *    - EMAIL_RECEIVERS, NOTIFICATION_RECEIVERS
 *    - ADMIN_RECEIVERS, ADMIN_EMAILS, ADMIN_EMAIL
 *    - SUPERADMIN_RECEIVERS, SUPERADMIN_EMAILS, SUPERADMIN_EMAIL
 *    - Any env var ending in _RECEIVERS, _RECEIVER, etc.
 *    - Fallback: SMTP_USER or default email
 */
export function getEmailReceivers(role?: string): string[] {
  const emails: string[] = [];

  if (role) {
    const normalized = role.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const specificKeys = [
      `${normalized}_EMAIL`,
      `${normalized}_EMAILS`,
      `${normalized}_RECEIVER`,
      `${normalized}_RECEIVERS`,
      `RECEIVER_${normalized}`,
      `RECEIVERS_${normalized}`,
      `SMTP_${normalized}_RECEIVER`,
      `SMTP_${normalized}_RECEIVERS`,
    ];

    for (const key of specificKeys) {
      if (process.env[key]) {
        emails.push(...parseEmailList(process.env[key]));
      }
    }

    if (emails.length > 0) {
      return Array.from(new Set(emails));
    }
  }

  // Combined receivers for general admin alerts & inquiries
  const standardKeys = [
    'SMTP_RECEIVERS',
    'EMAIL_RECEIVERS',
    'NOTIFICATION_RECEIVERS',
    'ADMIN_RECEIVERS',
    'ADMIN_EMAILS',
    'ADMIN_EMAIL',
    'SUPERADMIN_RECEIVERS',
    'SUPERADMIN_EMAILS',
    'SUPERADMIN_EMAIL',
  ];

  for (const key of standardKeys) {
    if (process.env[key]) {
      emails.push(...parseEmailList(process.env[key]));
    }
  }

  // Discover any other custom receiver env vars (e.g. MANAGER_RECEIVERS, PRINCIPAL_EMAIL, etc.)
  for (const [key, val] of Object.entries(process.env)) {
    if (!val || standardKeys.includes(key)) continue;
    const upper = key.toUpperCase();
    if (
      upper.endsWith('_RECEIVER') ||
      upper.endsWith('_RECEIVERS') ||
      upper.startsWith('RECEIVER_') ||
      upper.startsWith('RECEIVERS_') ||
      upper.includes('ADMIN_EMAIL') ||
      upper.includes('SUPERADMIN_EMAIL')
    ) {
      emails.push(...parseEmailList(val));
    }
  }

  const uniqueEmails = Array.from(new Set(emails));

  if (uniqueEmails.length === 0) {
    if (process.env.SMTP_USER && process.env.SMTP_USER.includes('@')) {
      uniqueEmails.push(process.env.SMTP_USER.trim());
    } else {
      uniqueEmails.push('anujguptaflymedia@gmail.com');
    }
  }

  return uniqueEmails;
}

export const getAdminReceivers = (role?: string) => getEmailReceivers(role);

// ── Generic Send Mail ──────────────────────────────────────────
export interface SendMailOptions {
  to?: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
}

export async function sendMail(options: SendMailOptions) {
  let toList: string[] = [];

  if (!options.to) {
    toList = getAdminReceivers();
  } else if (typeof options.to === 'string') {
    const trimmed = options.to.trim();
    if (trimmed.toLowerCase() === 'admin' || trimmed.toLowerCase() === 'superadmin') {
      toList = getEmailReceivers(trimmed);
    } else {
      toList = parseEmailList(trimmed);
    }
  } else if (Array.isArray(options.to)) {
    toList = parseEmailList(options.to);
  }

  if (toList.length === 0) {
    console.warn('[mailer] No valid recipients found for email:', options.subject);
    return;
  }

  const mailOptions: any = {
    from: options.from || FROM,
    to: toList.join(', '),
    subject: options.subject,
    html: options.html,
  };

  if (options.text) {
    mailOptions.text = options.text;
  }
  if (options.cc) {
    const cc = parseEmailList(options.cc);
    if (cc.length > 0) mailOptions.cc = cc.join(', ');
  }
  if (options.bcc) {
    const bcc = parseEmailList(options.bcc);
    if (bcc.length > 0) mailOptions.bcc = bcc.join(', ');
  }

  await transporter.sendMail(mailOptions);
}

// ── Send password-reset email ──────────────────────────────────
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                🔐 Flymedia Technology
              </h1>
              <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;font-weight:500;">Learning Management System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#0f172a;">Reset your password</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Hi <strong>${name}</strong>,<br/><br/>
                We received a request to reset the password for your Flymedia LMS account.
                Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="background:#2563eb;border-radius:12px;padding:0;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:16px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 28px;font-size:12px;color:#3b82f6;word-break:break-all;">
                <a href="${resetUrl}" style="color:#3b82f6;">${resetUrl}</a>
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.<br/><br/>
                For security, this link will expire in <strong>1 hour</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © ${new Date().getFullYear()} Flymedia Technology · First Floor, Plot 20, Vishal Nagar Ext, opposite Kashish Cafe, Vishal Nagar, Jawaddi Taksal, Ludhiana, Punjab 141013, India
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Reset your Flymedia LMS password',
    html,
  });
}

// ── Send tutor approval email ──────────────────────────────────
export async function sendTutorApprovalEmail(to: string, name: string, setPasswordUrl: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Congratulations! You are now a Tutor</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          <tr>
            <td style="background:linear-gradient(135deg,#E60870 0%,#F8750E 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                🎉 Application Selected!
              </h1>
              <p style="margin:6px 0 0;color:#ffe4e6;font-size:13px;font-weight:500;">Flymedia Technology</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#0f172a;">Welcome to the Team, ${name}!</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                We are thrilled to inform you that your application has been selected. You are now officially a Tutor at Flymedia LMS!
                To get started, please create your password by clicking the button below.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="background:#E60870;border-radius:12px;padding:0;">
                    <a href="${setPasswordUrl}"
                       style="display:inline-block;padding:16px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">
                      Create Your Password →
                    </a>
                  </td>
                </tr>
              </table>

             

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                Once you create your password, you will be able to log in to the Tutor Dashboard.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © ${new Date().getFullYear()} Flymedia Technology
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Congratulations! You are now a Flymedia Tutor',
    html,
  });
}

// ── Send tutor rejection email ─────────────────────────────────
export async function sendTutorRejectionEmail(to: string, name: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Update on your Flymedia LMS Tutor Application</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          <tr>
            <td style="background:linear-gradient(135deg,#94a3b8 0%,#64748b 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                Application Update
              </h1>
              <p style="margin:6px 0 0;color:#f1f5f9;font-size:13px;font-weight:500;">Flymedia Technology</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#0f172a;">Hello, ${name}</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Thank you for taking the time to apply for a Tutor position at Flymedia LMS. We sincerely appreciate your interest in joining our team.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We receive many applications and unfortunately cannot accept everyone.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                We wish you the best of luck in your future endeavors and encourage you to apply again in the future as our needs evolve.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                If you have any questions, feel free to reply to this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © ${new Date().getFullYear()} Flymedia Technology
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Update on your Flymedia LMS Tutor Application',
    html,
  });
}
