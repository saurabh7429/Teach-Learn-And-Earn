/**
 * Email Service
 * Handles transactional emails such as password reset notifications.
 * Supports SMTP configuration in production and safe fallback in development.
 */

async function sendPasswordResetEmail({ to, resetUrl, name }) {
  const recipientName = name || 'User';
  const subject = 'Teach, Learn & Earn — Password Reset Request';
  
  const textContent = `Hello ${recipientName},

You recently requested to reset your password for your Teach, Learn & Earn account.
Click the link below or copy and paste it into your browser to reset your password:

${resetUrl}

This link is valid for 1 hour. If you did not request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
The Teach, Learn & Earn Team`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0F1117; color: #E2E8F0; border-radius: 12px; border: 1px solid #232734;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: #fff; font-weight: 800; font-size: 16px; padding: 6px 14px; border-radius: 8px; letter-spacing: 0.05em;">TL&amp;E</span>
        <h2 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 16px 0 6px;">Password Reset Request</h2>
        <p style="color: #94A3B8; font-size: 14px; margin: 0;">Teach, Learn &amp; Earn Account Recovery</p>
      </div>
      
      <div style="background-color: #171A24; padding: 20px; border-radius: 8px; border: 1px solid #2A2F40; margin-bottom: 20px;">
        <p style="margin: 0 0 14px; font-size: 15px; color: #F1F5F9;">Hello <strong>${recipientName}</strong>,</p>
        <p style="margin: 0 0 20px; font-size: 14px; color: #94A3B8; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new password. This link is single-use and will expire in <strong>1 hour</strong>.
        </p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);">
            Reset My Password 🔒
          </a>
        </div>
        
        <p style="margin: 16px 0 0; font-size: 12px; color: #64748B; word-break: break-all;">
          If the button above does not work, copy and paste this URL into your browser:<br/>
          <a href="${resetUrl}" style="color: #818CF8;">${resetUrl}</a>
        </p>
      </div>
      
      <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin: 0; text-align: center;">
        If you did not request a password reset, no further action is required. Your password remains safe.
      </p>
    </div>
  `;

  // If SMTP or an external email provider is configured:
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      // Lazy load nodemailer if available
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Teach, Learn & Earn" <noreply@teachlearnearn.com>',
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      return { success: true, delivered: true };
    } catch (err) {
      console.error('[EmailService] SMTP delivery failed:', err.message);
      // In production we log the error but don't crash
      return { success: false, error: err.message };
    }
  }

  // Development / Test fallback mode
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[EmailService:DEV] Password reset email prepared for ${to}`);
    console.log(`[EmailService:DEV] Reset URL: ${resetUrl}\n`);
  }

  return { success: true, delivered: false, simulated: true };
}

module.exports = { sendPasswordResetEmail };
