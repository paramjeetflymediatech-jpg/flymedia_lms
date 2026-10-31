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

const defaultFromEmail = process.env.SMTP_USER || 'learnwithflymedia@gmail.com';
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
      uniqueEmails.push('learnwithflymedia@gmail.com');
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

// ── Partnership Emails ──────────────────────────────────────────

export async function sendPartnerApplicationAdminNotification(application: {
  id: string;
  type: 'COLLEGE' | 'CHARITY';
  organizationName: string;
  category?: string | null;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone?: string | null;
  city: string;
  state: string;
  studentCount: string;
  interestAreas?: string | null;
  registrationNumber?: string | null;
  message?: string | null;
}) {
  const isCollege = application.type === 'COLLEGE';
  const typeLabel = isCollege ? 'College / University Partnership' : 'Trust / NGO Free Education Initiative';
  const receivers = getEmailReceivers();

  if (receivers.length === 0) return;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Partnership Application</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <tr>
            <td style="background:${isCollege ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : 'linear-gradient(135deg, #065f46, #10b981)'};padding:28px 32px;color:#ffffff;">
              <span style="display:inline-block;padding:4px 12px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                ${typeLabel}
              </span>
              <h1 style="margin:0;font-size:22px;font-weight:800;">New Partnership Request Received</h1>
              <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">${application.organizationName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <h3 style="margin:0 0 16px;font-size:16px;color:#0f172a;border-bottom:2px solid #f1f5f9;padding-bottom:8px;">Organization & Representative Details</h3>
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#334155;">
                <tr><td width="35%" style="color:#64748b;font-weight:600;">Organization Name:</td><td style="font-weight:700;color:#0f172a;">${application.organizationName}</td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Partnership Type:</td><td><strong>${typeLabel}</strong></td></tr>
                ${application.category ? `<tr><td style="color:#64748b;font-weight:600;">Category / Domain:</td><td>${application.category}</td></tr>` : ''}
                <tr><td style="color:#64748b;font-weight:600;">Contact Person:</td><td>${application.contactPerson} (${application.designation})</td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Official Email:</td><td><a href="mailto:${application.email}" style="color:#2563eb;text-decoration:none;">${application.email}</a></td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Phone / WhatsApp:</td><td><a href="tel:${application.phone}" style="color:#0f172a;text-decoration:none;">${application.phone}</a> ${application.alternatePhone ? ` / ${application.alternatePhone}` : ''}</td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Location:</td><td>${application.city}, ${application.state}</td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Student Count:</td><td><strong>${application.studentCount} students</strong></td></tr>
                ${application.registrationNumber ? `<tr><td style="color:#64748b;font-weight:600;">Registration / Code:</td><td>${application.registrationNumber}</td></tr>` : ''}
                ${application.interestAreas ? `<tr><td style="color:#64748b;font-weight:600;">Interest Areas:</td><td>${application.interestAreas}</td></tr>` : ''}
              </table>

              ${application.message ? `
              <div style="margin-top:20px;padding:16px;background:#f8fafc;border-left:4px solid ${isCollege ? '#3b82f6' : '#10b981'};border-radius:6px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Message / Proposal:</p>
                <p style="margin:0;font-size:14px;color:#1e293b;white-space:pre-wrap;line-height:1.5;">${application.message}</p>
              </div>
              ` : ''}

              <div style="margin-top:28px;text-align:center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://learnwithflymedia.com'}/admin/partnerships" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;">
                  Open Partnerships in Admin Panel &rarr;
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: FROM,
    to: receivers,
    subject: `[Partnership Application] ${typeLabel} - ${application.organizationName}`,
    html,
  });
}

export async function sendPartnerApplicationApplicantConfirmation(application: {
  type: 'COLLEGE' | 'CHARITY';
  organizationName: string;
  contactPerson: string;
  email: string;
}) {
  const isCollege = application.type === 'COLLEGE';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Application Received - Flymedia Technology</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%);padding:32px 36px;color:#ffffff;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:800;">Thank You for Partnering With Us</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Flymedia Technology Institutional & Community Network</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <h2 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Dear ${application.contactPerson},</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                We have successfully received the partnership proposal on behalf of <strong>${application.organizationName}</strong>.
              </p>

              ${isCollege ? `
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px;margin-bottom:20px;">
                <h4 style="margin:0 0 8px;font-size:14px;color:#1e40af;font-weight:700;">What Happens Next for Your College:</h4>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#1e3a8a;line-height:1.6;">
                  <li>Our Institutional Partnerships Director will review your requirements.</li>
                  <li>We will customize exclusive student benefits, including subsidized batch pricing, campus workshops, and industrial certifications.</li>
                  <li>We'll schedule an introductory call to formalize the MoU / institutional tie-up.</li>
                </ul>
              </div>
              ` : `
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:18px;margin-bottom:20px;">
                <h4 style="margin:0 0 8px;font-size:14px;color:#065f46;font-weight:700;">Our Commitment to 100% Free Education:</h4>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#047857;line-height:1.6;">
                  <li>We salute <strong>${application.organizationName}</strong> for empowering underprivileged students!</li>
                  <li>Verified students from your trust will receive <strong>100% free enrollment</strong> across our industry-relevant skill tracks.</li>
                  <li>Our CSR coordinator will reach out within 24–48 hours to grant your institution free education access passes.</li>
                </ul>
              </div>
              `}

              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                If you have any urgent queries, you can reach out directly to our institutional desk at 
                <a href="tel:+919779324178" style="color:#ea580c;font-weight:700;text-decoration:none;">+91-97793-24178</a> or reply to this email.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px;"/>

              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
                Warm regards,<br/>
                <strong>Team Flymedia Technology</strong><br/>
                Ludhiana, Punjab | learnwithflymedia@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: FROM,
    to: application.email,
    subject: isCollege 
      ? `College Partnership Request Received - ${application.organizationName}`
      : `Free Education Partnership Request Received - ${application.organizationName}`,
    html,
  });
}

export async function sendPartnerApprovalEmail(application: {
  type: 'COLLEGE' | 'CHARITY';
  organizationName: string;
  contactPerson: string;
  email: string;
  adminNotes?: string | null;
}) {
  const isCollege = application.type === 'COLLEGE';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Partnership Approved - Flymedia Technology</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);padding:32px 36px;color:#ffffff;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:800;">🎉 Congratulations! Partnership Approved</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">${application.organizationName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <h2 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Dear ${application.contactPerson},</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                We are delighted to welcome <strong>${application.organizationName}</strong> to the Flymedia Technology educational ecosystem!
              </p>

              ${isCollege ? `
              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                Your institution's partnership has been approved. Your students can now avail specialized benefits including subsidized tuition, prioritized live batches, industrial certification, and placement drive access.
              </p>
              ` : `
              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                Your charity / trust partnership has been approved for <strong>100% Free Education</strong>! Your sponsored students will receive complete zero-cost access to our technical training, live mentor sessions, and recognized certificates.
              </p>
              `}

              ${application.adminNotes ? `
              <div style="background:#f8fafc;border:1px dashed #cbd5e1;padding:16px;border-radius:10px;margin:20px 0;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;">Note from Admissions & Partnership Coordinator:</p>
                <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.5;">${application.adminNotes}</p>
              </div>
              ` : ''}

              <p style="margin:20px 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                Our partnership manager will contact you directly to share your official institutional partner code and onboarding guidelines for your students.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px;"/>

              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
                Warm regards,<br/>
                <strong>Flymedia Technology Partner Network</strong><br/>
                Phone: +91-97793-24178 | Email: learnwithflymedia@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: FROM,
    to: application.email,
    subject: `Partnership Approved - Welcome ${application.organizationName} to Flymedia!`,
    html,
  });
}

export async function sendPartnerRejectionEmail(application: {
  type: 'COLLEGE' | 'CHARITY';
  organizationName: string;
  contactPerson: string;
  email: string;
  adminNotes?: string | null;
}) {
  const isCollege = application.type === 'COLLEGE';
  const partnerLabel = isCollege ? 'College / Institutional Partnership' : 'Trust / NGO Free Education Partnership';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Partnership Application Status - Flymedia Technology</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg, #475569 0%, #1e293b 100%);padding:32px 36px;color:#ffffff;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:800;">Partnership Application Update</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">${application.organizationName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <h2 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Dear ${application.contactPerson},</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                Thank you for your interest in collaborating with Flymedia Technology and for submitting a proposal for our <strong>${partnerLabel}</strong>.
              </p>

              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                After a thorough review of your proposal and our current institutional scheduling capacity, we regret to inform you that we are unable to approve or move forward with this partnership application at this time.
              </p>

              ${application.adminNotes ? `
              <div style="background:#f8fafc;border:1px dashed #cbd5e1;padding:16px;border-radius:10px;margin:20px 0;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;">Note from Partnership Committee:</p>
                <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.5;">${application.adminNotes}</p>
              </div>
              ` : ''}

              <p style="margin:20px 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                We appreciate the educational initiatives undertaken by <strong>${application.organizationName}</strong> and welcome the opportunity to re-evaluate potential collaboration in future academic cycles.
              </p>

              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                If you have any questions or would like to share additional details, feel free to reply directly to this email or contact our partnerships desk.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px;"/>

              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
                Warm regards,<br/>
                <strong>Flymedia Technology Partner Network</strong><br/>
                Phone: +91-97793-24178 | Email: learnwithflymedia@gmail.com<br/>
                Campus: First Floor, Plot 20, Vishal Nagar Ext, Ludhiana, Punjab 141013
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: FROM,
    to: application.email,
    subject: `Update regarding your Partnership Application - ${application.organizationName}`,
    html,
  });
}

// ── Internship Program Emails ───────────────────────────────────

export async function sendInternshipApplicationAdminNotification(application: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  qualification: string;
  yearOfStudy: string;
  domain: string;
  duration: string;
  mode: string;
  startDate?: string | null;
  resumeUrl?: string | null;
  portfolioUrl?: string | null;
  city?: string | null;
  state?: string | null;
  message?: string | null;
}) {
  const receivers = getEmailReceivers();
  if (receivers.length === 0) return;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Internship Application</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg, #e11d48, #ea580c);padding:28px 32px;color:#ffffff;">
              <span style="display:inline-block;padding:4px 12px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                🎓 Internship & Training Desk
              </span>
              <h1 style="margin:0;font-size:22px;font-weight:800;">New Student Internship Application</h1>
              <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">${application.fullName} • ${application.domain}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <h3 style="margin:0 0 16px;font-size:16px;color:#0f172a;border-bottom:2px solid #f1f5f9;padding-bottom:8px;">Applicant Details</h3>
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#334155;">
                <tr><td width="35%" style="color:#64748b;font-weight:600;">Student Name:</td><td style="font-weight:700;color:#0f172a;">${application.fullName}</td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Email Address:</td><td><a href="mailto:${application.email}" style="color:#ea580c;text-decoration:none;font-weight:600;">${application.email}</a></td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Phone / WhatsApp:</td><td><a href="tel:${application.phone}" style="color:#0f172a;text-decoration:none;font-weight:700;">${application.phone}</a></td></tr>
                <tr><td style="color:#64748b;font-weight:600;">College / University:</td><td><strong>${application.college}</strong></td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Degree & Year:</td><td>${application.qualification} (${application.yearOfStudy})</td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Domain:</td><td><span style="background:#fff1f2;color:#e11d48;padding:2px 8px;border-radius:6px;font-weight:700;">${application.domain}</span></td></tr>
                <tr><td style="color:#64748b;font-weight:600;">Duration & Mode:</td><td>${application.duration} • <strong>${application.mode}</strong></td></tr>
                ${application.startDate ? `<tr><td style="color:#64748b;font-weight:600;">Preferred Start:</td><td>${application.startDate}</td></tr>` : ''}
                ${application.city || application.state ? `<tr><td style="color:#64748b;font-weight:600;">Location:</td><td>${[application.city, application.state].filter(Boolean).join(', ')}</td></tr>` : ''}
                ${application.resumeUrl ? `<tr><td style="color:#64748b;font-weight:600;">Resume / Portfolio:</td><td><a href="${application.resumeUrl}" target="_blank" style="color:#2563eb;text-decoration:underline;">View Resume / Link</a></td></tr>` : ''}
                ${application.portfolioUrl ? `<tr><td style="color:#64748b;font-weight:600;">Portfolio / GitHub:</td><td><a href="${application.portfolioUrl}" target="_blank" style="color:#2563eb;text-decoration:underline;">View Portfolio</a></td></tr>` : ''}
              </table>

              ${application.message ? `
              <div style="background:#f8fafc;border-left:4px solid #ea580c;padding:14px;border-radius:0 8px 8px 0;margin:20px 0;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Applicant Message / Goals:</p>
                <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.5;">${application.message}</p>
              </div>
              ` : ''}

              <div style="text-align:center;margin-top:28px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/internships" style="display:inline-block;padding:12px 28px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
                  Open Internships Desk in Admin Panel &rarr;
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: FROM,
    to: receivers.join(', '),
    subject: `🎓 New Internship Application: ${application.fullName} (${application.domain})`,
    html,
  });
}

export async function sendInternshipStudentConfirmationEmail(application: {
  fullName: string;
  email: string;
  domain: string;
  duration: string;
  mode: string;
}) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Application Received - Flymedia Technology Internship</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%);padding:32px;color:#ffffff;text-align:center;">
              <span style="display:inline-block;padding:4px 14px;background:rgba(255,255,255,0.25);border-radius:20px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
                Flymedia Technology
              </span>
              <h1 style="margin:0;font-size:24px;font-weight:900;">Internship Application Received! 🎉</h1>
              <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.92);">Thank you for applying, ${application.fullName}!</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <h2 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Hi ${application.fullName},</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                We have successfully received your application for the <strong>${application.domain}</strong> Internship Program (<strong>${application.duration}</strong> • <strong>${application.mode}</strong>).
              </p>

              <div style="background:#fff7ed;border:1px solid #ffedd5;padding:18px;border-radius:12px;margin:20px 0;">
                <h4 style="margin:0 0 8px;font-size:14px;color:#9a3412;font-weight:800;">What happens next?</h4>
                <ul style="margin:0;padding-left:20px;font-size:13px;color:#431407;line-height:1.7;">
                  <li><strong>Profile Review:</strong> Our academic advisor & technical lead will review your background within 24-48 business hours.</li>
                  <li><strong>Quick Interaction:</strong> We will reach out via WhatsApp/Phone to schedule a brief interaction and discuss your batch timings.</li>
                  <li><strong>Offer & NOC:</strong> Once accepted, you will receive your official Internship Joining Letter / College NOC documentation.</li>
                  <li><strong>Hands-on Training:</strong> Kick off your live client project journey with 1-on-1 mentor guidance.</li>
                </ul>
              </div>

              <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:12px;margin:20px 0;">
                <h4 style="margin:0 0 6px;font-size:13px;color:#0f172a;font-weight:700;">Need immediate assistance?</h4>
                <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                  Direct Helpline: <a href="tel:+919779324178" style="color:#ea580c;font-weight:700;text-decoration:none;">+91-97793-24178</a><br/>
                  Email: <a href="mailto:learnwithflymedia@gmail.com" style="color:#ea580c;font-weight:600;text-decoration:none;">learnwithflymedia@gmail.com</a><br/>
                  Campus: First Floor, Plot 20, Vishal Nagar Ext, Ludhiana, Punjab 141013
                </p>
              </div>

              <p style="margin:20px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                Best regards,<br/>
                <strong>Flymedia Technology Training &amp; Placement Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: FROM,
    to: application.email,
    subject: `🎉 Application Received: Flymedia Internship Program (${application.domain})`,
    html,
  });
}


