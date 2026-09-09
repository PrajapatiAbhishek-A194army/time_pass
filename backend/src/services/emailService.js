const nodemailer = require('nodemailer');

/**
 * Brevo SMTP Transporter Configuration
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  const fromEmail = process.env.EMAIL_FROM || 'SoleSphere <support@solesphere.com>';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8faf9; margin: 0; padding: 30px; color: #1e293b; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(11,40,24,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #051b10 0%, #0b2e1b 50%, #15803d 100%); padding: 35px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: -0.5px; }
        .header p { color: #86efac; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
        .content { padding: 35px 30px; line-height: 1.6; }
        .btn { display: inline-block; background-color: #0b2e1b; color: #ffffff !important; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 20px; }
        .footer { padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>SoleSphere</h1>
          <p>Atelier & Sport</p>
        </div>
        <div class="content">
          <h2>Welcome to the Collective, ${user.name}</h2>
          <p>Your SoleSphere account has been successfully created. You now have privileged access to limited drop reservations, bespoke sneaker releases, and curated footwear engineering.</p>
          <p>Your membership code for 15% off your maiden acquisition: <strong>SOLEDROP15</strong></p>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Explore The Atelier</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SoleSphere Inc. Precision Footwear Atelier.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service Mock (Brevo SMTP not configured in .env)] Welcome email simulated for: ${user.email}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: user.email,
      subject: 'Welcome to SoleSphere — Elevate Every Step',
      html,
    });
    console.log(`[Email Service] Welcome email delivered to ${user.email} via Brevo SMTP: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Service Error - Welcome Email]:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Password Reset Email with Token Link
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const transporter = createTransporter();
  const fromEmail = process.env.EMAIL_FROM || 'SoleSphere <support@solesphere.com>';
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8faf9; margin: 0; padding: 30px; color: #1e293b; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(11,40,24,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #051b10 0%, #0b2e1b 50%, #15803d 100%); padding: 35px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; }
        .header p { color: #86efac; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
        .content { padding: 35px 30px; line-height: 1.6; }
        .btn { display: inline-block; background-color: #15803d; color: #ffffff !important; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 20px; }
        .token-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px; font-family: monospace; font-size: 13px; word-break: break-all; margin-top: 15px; }
        .footer { padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>SoleSphere</h1>
          <p>Security & Access</p>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your SoleSphere account password. Click the secure link below within 30 minutes to choose a new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">Reset My Password</a>
          </div>
          <p style="margin-top: 25px; font-size: 12px; color: #64748b;">If the button does not work, copy and paste this link into your browser:</p>
          <div class="token-box">${resetUrl}</div>
          <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">If you did not request this, please disregard this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SoleSphere Inc. Account Security.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service Mock (Brevo SMTP not configured in .env)] Password reset email simulated for: ${user.email}`);
    console.log(`[Password Reset Link]: ${resetUrl}`);
    return { success: true, simulated: true, resetUrl };
  }

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: user.email,
      subject: 'SoleSphere — Password Reset Instructions',
      html,
    });
    console.log(`[Email Service] Password reset email delivered to ${user.email} via Brevo SMTP: ${info.messageId}`);
    return { success: true, messageId: info.messageId, resetUrl };
  } catch (error) {
    console.error('[Email Service Error - Password Reset]:', error.message);
    return { success: false, error: error.message, resetUrl };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
