import nodemailer from 'nodemailer';

// ── Transporter ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || '"Flymedia Technology" <anujguptaflymedia@gmail.com>';

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
                © ${new Date().getFullYear()} Flymedia Technology · Plot no 20, Vishal Nagar Ext, Ludhiana, Punjab 141001
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

// ── Generic utility ────────────────────────────────────────────
export async function sendMail(options: { to: string; subject: string; html: string }) {
  await transporter.sendMail({ from: FROM, ...options });
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
