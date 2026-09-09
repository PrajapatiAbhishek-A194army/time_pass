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

/**
 * Send Order Confirmation Email via Brevo SMTP
 */
const sendOrderConfirmationEmail = async (order, userOrGuest) => {
  const transporter = createTransporter();
  const fromEmail = process.env.EMAIL_FROM || 'SoleSphere <orders@solesphere.com>';
  const recipientEmail = userOrGuest.email || order.shippingAddress?.email || order.email;
  const recipientName = userOrGuest.name || order.shippingAddress?.fullName || 'Collector';
  const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-confirmation/${order.orderNumber}`;

  const itemsHtml = (order.items || []).map((item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        ${item.image ? `<img src="${item.image}" alt="${item.name || item.productName}" width="56" height="56" style="border-radius: 8px; vertical-align: middle; margin-right: 12px; object-fit: cover; background: #f8fafc;" />` : ''}
        <strong style="color: #0f172a; font-size: 14px;">${item.name || item.productName}</strong>
        <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
          Size: ${item.size} &bull; Color: ${item.color} &bull; Qty: ${item.quantity}
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; vertical-align: middle; font-weight: 700; color: #0f172a; font-size: 14px;">
        $${(Number(item.price) * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf9; margin: 0; padding: 30px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(11,40,24,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #051b10 0%, #0b2e1b 50%, #15803d 100%); padding: 35px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: -0.5px; }
        .header p { color: #86efac; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
        .content { padding: 32px 30px; line-height: 1.6; }
        .badge { display: inline-block; background-color: #f0fdf4; color: #166534; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #bbf7d0; margin-bottom: 15px; }
        .order-meta { background: #f8faf9; border-radius: 14px; padding: 18px 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
        .order-meta table { width: 100%; font-size: 13px; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
        .summary-table td { padding: 6px 0; }
        .btn { display: inline-block; background-color: #0b2e1b; color: #ffffff !important; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; }
        .footer { padding: 25px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafbfc; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>SoleSphere</h1>
          <p>Atelier & Sport</p>
        </div>
        <div class="content">
          <div class="badge">&#10003; Order Confirmed & In Production</div>
          <h2 style="margin: 0 0 10px 0; font-size: 22px; color: #0f172a;">Thank you for your order, ${recipientName}</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">We have received your order and our master craftsmen are preparing your bespoke footwear for dispatch.</p>

          <div class="order-meta">
            <table>
              <tr>
                <td style="color: #64748b;">Order Number:</td>
                <td style="text-align: right; font-weight: 700; color: #0f172a;">${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Tracking ID:</td>
                <td style="text-align: right; font-family: monospace; font-weight: 700; color: #15803d;">${order.trackingNumber || 'Assigned on Dispatch'}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Estimated Delivery:</td>
                <td style="text-align: right; font-weight: 600; color: #0f172a;">3&ndash;5 Business Days</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Payment Method:</td>
                <td style="text-align: right; font-weight: 600; color: #0f172a;">${order.paymentMethod || 'Credit Card (Stripe)'}</td>
              </tr>
            </table>
          </div>

          <h3 style="font-size: 16px; margin: 24px 0 8px 0; color: #0f172a;">Acquisition Summary</h3>
          <table class="items-table">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="summary-table">
            <tr>
              <td style="color: #64748b;">Subtotal:</td>
              <td style="text-align: right; font-weight: 600; color: #0f172a;">$${Number(order.subtotal || 0).toFixed(2)}</td>
            </tr>
            ${order.discountAmount > 0 ? `
            <tr>
              <td style="color: #166534;">Promotional Discount:</td>
              <td style="text-align: right; font-weight: 600; color: #166534;">-$${Number(order.discountAmount).toFixed(2)}</td>
            </tr>` : ''}
            <tr>
              <td style="color: #64748b;">Shipping (Express Courier):</td>
              <td style="text-align: right; font-weight: 600; color: #0f172a;">${Number(order.shippingFee || 0) === 0 ? '<span style="color: #166534;">COMPLIMENTARY</span>' : '$' + Number(order.shippingFee).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Estimated Taxes:</td>
              <td style="text-align: right; font-weight: 600; color: #0f172a;">$${Number(order.tax || 0).toFixed(2)}</td>
            </tr>
            <tr style="border-top: 2px solid #0f172a;">
              <td style="padding-top: 12px; font-size: 16px; font-weight: 800; color: #0f172a;">Total Amount:</td>
              <td style="padding-top: 12px; text-align: right; font-size: 18px; font-weight: 900; color: #0b2e1b;">$${Number(order.totalAmount || 0).toFixed(2)}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 35px;">
            <a href="${orderUrl}" class="btn">Track Order & View Receipt</a>
          </div>
        </div>
        <div class="footer">
          Questions about your drop? Contact our concierge at <a href="mailto:support@solesphere.com" style="color: #15803d;">support@solesphere.com</a>.<br/>
          &copy; ${new Date().getFullYear()} SoleSphere Inc. Luxury Footwear Atelier. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service Mock (Brevo SMTP not configured in .env)] Order confirmation simulated for: ${recipientEmail} (Order #${order.orderNumber})`);
    console.log(`[Order Receipt URL]: ${orderUrl}`);
    return { success: true, simulated: true, orderUrl };
  }

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: recipientEmail,
      subject: `SoleSphere Order Confirmed — #${order.orderNumber}`,
      html,
    });
    console.log(`[Email Service] Order confirmation email delivered to ${recipientEmail} via Brevo SMTP: ${info.messageId}`);
    return { success: true, messageId: info.messageId, orderUrl };
  } catch (error) {
    console.error('[Email Service Error - Order Confirmation]:', error.message);
    return { success: false, error: error.message, orderUrl };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
};
