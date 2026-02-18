// server/controllers/common/email-controller.js

const nodemailer = require("nodemailer");

const SHOP_NAME = "Kenya Magic Toy Shop";
const SHOP_PHONE = "0799 654 321";
const SHOP_EMAIL = process.env.EMAIL_USER || "info@kenyamagictoyshop.com";
const SHOP_LOCATION = "Nairobi CBD, Kenya";
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "254799654321";
const SHOP_HOURS = "Mon–Sat 8 AM – 7 PM, Sun 10 AM – 5 PM";

// Updated transporter for cPanel email hosting
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       // mail.kenyamagictoyshop.com
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === "true",  // true for port 465
    auth: {
      user: process.env.EMAIL_USER,     // info@kenyamagictoyshop.com
      pass: process.env.EMAIL_PASSWORD, // cPanel email password
    },
    tls: {
      rejectUnauthorized: false, // Avoids self-signed cert errors on shared hosting
    },
  });
};

// ─── Shared styles ────────────────────────────────────────────────────────────
const baseStyles = `
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;color:#333}
  .wrap{max-width:600px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.1)}
  .header{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);color:#fff;padding:32px 24px;text-align:center}
  .header h1{margin:0 0 6px;font-size:26px;letter-spacing:.5px}
  .header p{margin:0;opacity:.8;font-size:14px}
  .logo-badge{display:inline-block;background:rgba(255,193,7,.15);border:2px solid #ffc107;color:#ffc107;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:12px;text-transform:uppercase}
  .body{padding:28px 24px}
  .greeting{font-size:17px;font-weight:600;margin-bottom:6px}
  .order-card{background:#f8f9fa;border:1px solid #e9ecef;border-radius:10px;padding:20px;margin:20px 0}
  .order-card h3{margin:0 0 14px;font-size:15px;color:#555;text-transform:uppercase;letter-spacing:.5px}
  .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e9ecef;font-size:14px}
  .row:last-child{border-bottom:none}
  .label{color:#666}
  .value{font-weight:600;color:#333}
  .total-row{background:#e8f5e9;border-radius:8px;padding:12px 16px;margin-top:14px;display:flex;justify-content:space-between;align-items:center}
  .total-row .label{font-size:16px;font-weight:700;color:#2e7d32}
  .total-row .value{font-size:22px;font-weight:800;color:#2e7d32}
  .items-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:14px}
  .items-table th{background:#1a1a2e;color:#fff;padding:9px 12px;text-align:left}
  .items-table td{padding:9px 12px;border-bottom:1px solid #eee}
  .items-table tr:last-child td{border-bottom:none}
  .status-badge{display:inline-block;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:700}
  .badge-pending{background:#fff3cd;color:#856404}
  .badge-confirmed{background:#d4edda;color:#155724}
  .badge-dispatched{background:#cce5ff;color:#004085}
  .badge-delivered{background:#d4edda;color:#155724}
  .info-box{background:#e3f2fd;border-left:4px solid #1976d2;padding:14px 18px;border-radius:0 8px 8px 0;margin:18px 0;font-size:14px}
  .success-box{background:#e8f5e9;border-left:4px solid #43a047;padding:14px 18px;border-radius:0 8px 8px 0;margin:18px 0;font-size:14px}
  .warning-box{background:#fff8e1;border-left:4px solid #ffa000;padding:14px 18px;border-radius:0 8px 8px 0;margin:18px 0;font-size:14px}
  .btn{display:inline-block;padding:13px 28px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;margin:6px 4px}
  .btn-dark{background:#1a1a2e}
  .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
  .contact-item{background:#f8f9fa;border-radius:8px;padding:12px;text-align:center;font-size:13px}
  .contact-item .icon{font-size:22px;margin-bottom:4px}
  .contact-item strong{display:block;font-size:13px;color:#333}
  .contact-item span{color:#666;font-size:12px}
  .steps{counter-reset:step;margin:16px 0}
  .step{display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;font-size:14px}
  .step-num{background:#1a1a2e;color:#ffc107;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}
  .footer{background:#1a1a2e;color:rgba(255,255,255,.7);text-align:center;padding:20px 24px;font-size:13px}
  .footer a{color:#ffc107;text-decoration:none}
  .footer .social{margin:10px 0}
  .divider{height:1px;background:#eee;margin:20px 0}
`;

// ─── Welcome email ────────────────────────────────────────────────────────────
const getWelcomeEmail = ({ customerName }) => `
<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrap">
  <div class="header">
    <div class="logo-badge">🎉 Welcome</div>
    <h1>Welcome to ${SHOP_NAME}!</h1>
    <p>We're so glad you're here!</p>
  </div>
  <div class="body">
    <p class="greeting">Hi ${customerName || "there"},</p>
    <p>Thank you for joining the ${SHOP_NAME} family! 🎈 We're dedicated to bringing joy to children and families across Kenya with our wonderful range of toys, games, and educational materials.</p>

    <div class="success-box">
      <strong>✅ Your account is ready!</strong><br>
      You can now browse our collection, add items to your wishlist, and place orders with ease.
    </div>

    <div class="order-card">
      <h3>How We Work</h3>
      <div class="steps">
        <div class="step"><span class="step-num">1</span><span>Browse our wide selection of toys and pick your favourites.</span></div>
        <div class="step"><span class="step-num">2</span><span>Add items to your cart and head to checkout.</span></div>
        <div class="step"><span class="step-num">3</span><span>Enter your delivery address — we deliver across Nairobi and beyond.</span></div>
        <div class="step"><span class="step-num">4</span><span>Confirm your order. <strong>We operate on Cash on Delivery</strong> — pay when your order arrives!</span></div>
        <div class="step"><span class="step-num">5</span><span>We'll keep you updated via email at every step.</span></div>
      </div>
    </div>

    <div class="order-card">
      <h3>📍 Visit Us</h3>
      <p style="margin:0;font-size:14px">${SHOP_LOCATION}<br>
      <strong>Hours:</strong> ${SHOP_HOURS}</p>
    </div>

    <div class="contact-grid">
      <div class="contact-item"><div class="icon">📞</div><strong>${SHOP_PHONE}</strong><span>Call / SMS</span></div>
      <div class="contact-item"><div class="icon">💬</div><strong>WhatsApp</strong><span>${SHOP_PHONE}</span></div>
      <div class="contact-item"><div class="icon">📧</div><strong>Email Us</strong><span>${SHOP_EMAIL}</span></div>
      <div class="contact-item"><div class="icon">🕐</div><strong>Response Time</strong><span>Within 2 hours</span></div>
    </div>

    <div style="text-align:center;margin-top:24px">
      <a href="https://kenyamagictoyshop.com/shop/home" class="btn btn-dark">🛍️ Start Shopping</a>
    </div>
  </div>
  <div class="footer">
    <p>${SHOP_NAME} | ${SHOP_LOCATION}</p>
    <p><a href="mailto:${SHOP_EMAIL}">${SHOP_EMAIL}</a> | <a href="tel:${SHOP_PHONE}">${SHOP_PHONE}</a></p>
    <p style="opacity:.6;font-size:11px;margin-top:8px">Making playtime magical across Kenya 🎈</p>
  </div>
</div>
</body></html>`;

// ─── Order confirmed email ─────────────────────────────────────────────────────
const getOrderConfirmedEmail = ({ customerName, orderId, cartItems, subtotalAmount, deliveryFee, totalAmount, addressInfo }) => {
  const itemsRows = (cartItems || []).map(item => `
    <tr>
      <td>${item.title}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">KSh ${Number(item.price).toFixed(2)}</td>
      <td style="text-align:right">KSh ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join("");

  const whatsappMsg = encodeURIComponent(`Hi Kenya Magic Toy Shop! I just placed order #${orderId}. Please confirm it's been received. Thank you!`);

  return `
<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrap">
  <div class="header">
    <div class="logo-badge">✅ Order Placed</div>
    <h1>Order Confirmed!</h1>
    <p>We've received your order and are getting it ready.</p>
  </div>
  <div class="body">
    <p class="greeting">Hi ${customerName || "there"},</p>
    <p>Great news — your order has been placed successfully! 🎉 Our team will prepare your items and arrange delivery to your location.</p>

    <div class="order-card">
      <h3>Order Summary</h3>
      <div class="row"><span class="label">Order ID</span><span class="value">#${orderId}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="status-badge badge-confirmed">Confirmed</span></span></div>
      <div class="row"><span class="label">Payment</span><span class="value">💵 Cash on Delivery</span></div>
    </div>

    <table class="items-table">
      <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div class="row"><span class="label">Items Subtotal</span><span class="value">KSh ${Number(subtotalAmount || 0).toFixed(2)}</span></div>
    <div class="row"><span class="label">Delivery Fee</span><span class="value">${Number(deliveryFee) === 0 ? "🎉 FREE" : "KSh " + Number(deliveryFee).toFixed(2)}</span></div>
    <div class="total-row"><span class="label">Total (Pay on Delivery)</span><span class="value">KSh ${Number(totalAmount).toFixed(2)}</span></div>

    <div class="order-card" style="margin-top:20px">
      <h3>📦 Delivery Address</h3>
      <p style="margin:0;font-size:14px;line-height:1.7">
        ${addressInfo?.specificAddress ? addressInfo.specificAddress + "<br>" : ""}
        ${addressInfo?.location || ""}, ${addressInfo?.subCounty || ""}<br>
        ${addressInfo?.county || ""}<br>
        📞 ${addressInfo?.phone || ""}
        ${addressInfo?.notes ? "<br><em>Note: " + addressInfo.notes + "</em>" : ""}
      </p>
    </div>

    <div class="info-box">
      <strong>💡 What happens next?</strong><br>
      Our team will review your order and contact you to arrange delivery. Please keep your phone on — our delivery team may call you!
    </div>

    <div style="text-align:center;margin-top:24px">
      <p style="font-size:15px;font-weight:600;margin-bottom:12px">Want to chat with us directly?</p>
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}" class="btn">💬 Message Us on WhatsApp</a>
    </div>
  </div>
  <div class="footer">
    <p>${SHOP_NAME} | ${SHOP_LOCATION} | ${SHOP_PHONE}</p>
    <p><a href="mailto:${SHOP_EMAIL}">${SHOP_EMAIL}</a></p>
  </div>
</div>
</body></html>`;
};

// ─── Order dispatched email ───────────────────────────────────────────────────
const getOrderDispatchedEmail = ({ customerName, orderId, totalAmount, addressInfo, estimatedDelivery }) => {
  const whatsappMsg = encodeURIComponent(`Hi! I'm reaching out about my order #${orderId} which has been dispatched. Can you give me an ETA?`);
  return `
<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrap">
  <div class="header" style="background:linear-gradient(135deg,#1565c0,#1976d2)">
    <div class="logo-badge" style="border-color:#90caf9;color:#90caf9">🚚 On the Way</div>
    <h1>Your Order is Enroute!</h1>
    <p>Your package is heading your way.</p>
  </div>
  <div class="body">
    <p class="greeting">Hi ${customerName || "there"},</p>
    <p>Exciting news! 🚚 Your order has been dispatched and is on its way to you. Get ready to receive your items!</p>

    <div class="order-card">
      <h3>Delivery Details</h3>
      <div class="row"><span class="label">Order ID</span><span class="value">#${orderId}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="status-badge badge-dispatched">Dispatched</span></span></div>
      <div class="row"><span class="label">Amount to Pay</span><span class="value" style="color:#c62828;font-size:18px">KSh ${Number(totalAmount).toFixed(2)}</span></div>
      ${estimatedDelivery ? `<div class="row"><span class="label">Estimated Arrival</span><span class="value">${estimatedDelivery}</span></div>` : ""}
    </div>

    <div class="order-card">
      <h3>📍 Delivery To</h3>
      <p style="margin:0;font-size:14px;line-height:1.7">
        ${addressInfo?.specificAddress ? addressInfo.specificAddress + "<br>" : ""}
        ${addressInfo?.location || ""}, ${addressInfo?.subCounty || ""}<br>
        ${addressInfo?.county || ""}<br>
        📞 ${addressInfo?.phone || ""}
      </p>
    </div>

    <div class="warning-box">
      <strong>💵 Please have KSh ${Number(totalAmount).toFixed(2)} ready in cash</strong> for payment on delivery.<br>
      Our delivery agent will collect payment when they hand over your package.
    </div>

    <div class="steps">
      <div class="step"><span class="step-num">✓</span><span>Order confirmed</span></div>
      <div class="step"><span class="step-num">✓</span><span>Items packaged</span></div>
      <div class="step"><span class="step-num">🔵</span><span><strong>Dispatched — on the way to you!</strong></span></div>
      <div class="step"><span class="step-num">4</span><span>Delivery &amp; payment</span></div>
    </div>

    <div style="text-align:center;margin-top:24px">
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}" class="btn">💬 Contact Delivery Agent</a>
    </div>
  </div>
  <div class="footer">
    <p>${SHOP_NAME} | ${SHOP_PHONE} | <a href="mailto:${SHOP_EMAIL}">${SHOP_EMAIL}</a></p>
  </div>
</div>
</body></html>`;
};

// ─── Order delivered / thank-you email ───────────────────────────────────────
const getOrderDeliveredEmail = ({ customerName, orderId, totalAmount, cartItems }) => {
  const reviewLink = `https://kenyamagictoyshop.com/shop/account`;
  return `
<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrap">
  <div class="header" style="background:linear-gradient(135deg,#1b5e20,#2e7d32)">
    <div class="logo-badge" style="border-color:#a5d6a7;color:#a5d6a7">🎉 Delivered</div>
    <h1>Order Delivered!</h1>
    <p>Thank you for shopping with us.</p>
  </div>
  <div class="body">
    <p class="greeting">Hi ${customerName || "there"},</p>
    <p>Your order has been delivered successfully! 🎁 We hope you and your little ones absolutely love the items. Thank you for choosing <strong>${SHOP_NAME}</strong>!</p>

    <div class="success-box">
      <strong>✅ Order #${orderId} — Delivered!</strong><br>
      Total paid: <strong>KSh ${Number(totalAmount).toFixed(2)}</strong>
    </div>

    <div class="order-card">
      <h3>What Was Delivered</h3>
      ${(cartItems || []).map(i => `<div class="row"><span class="label">${i.title}</span><span class="value">x${i.quantity}</span></div>`).join("")}
    </div>

    <div class="info-box">
      <strong>⭐ Enjoyed your order?</strong><br>
      We'd love to hear from you! Leave a review for the products you purchased — it helps other parents find the best toys for their kids.
    </div>

    <div style="text-align:center;margin-top:24px">
      <a href="${reviewLink}" class="btn btn-dark">⭐ Leave a Review</a>
      <a href="https://kenyamagictoyshop.com/shop/home" class="btn">🛍️ Shop Again</a>
    </div>

    <div class="divider"></div>
    <p style="font-size:13px;color:#666;text-align:center">Something not right? Contact us within 24 hours and we'll sort it out. Your satisfaction is our priority.</p>
  </div>
  <div class="footer">
    <p>${SHOP_NAME} | ${SHOP_PHONE} | <a href="mailto:${SHOP_EMAIL}">${SHOP_EMAIL}</a></p>
    <p style="opacity:.6;font-size:11px;margin-top:8px">Making playtime magical across Kenya 🎈</p>
  </div>
</div>
</body></html>`;
};

// ─── Senders ──────────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.EMAIL_HOST) {
    console.warn("⚠️  Email credentials not fully configured — skipping email to:", to);
    console.warn("Required env vars: EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST");
    return { success: false, error: "Email credentials not fully configured" };
  }
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${SHOP_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to} — messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = (email, { customerName }) =>
  sendEmail({
    to: email,
    subject: `Welcome to ${SHOP_NAME}! 🎉`,
    html: getWelcomeEmail({ customerName }),
  });

const sendOrderConfirmedEmail = (email, details) =>
  sendEmail({
    to: email,
    subject: `Order Confirmed! #${details.orderId} — ${SHOP_NAME}`,
    html: getOrderConfirmedEmail(details),
  });

const sendOrderDispatchedEmail = (email, details) =>
  sendEmail({
    to: email,
    subject: `🚚 Your Order is On the Way! #${details.orderId}`,
    html: getOrderDispatchedEmail(details),
  });

const sendOrderDeliveredEmail = (email, details) =>
  sendEmail({
    to: email,
    subject: `✅ Delivered! Thank you for shopping with us — Order #${details.orderId}`,
    html: getOrderDeliveredEmail(details),
  });

// Legacy aliases (kept for backward compatibility)
const sendPendingVerificationEmail = sendOrderConfirmedEmail;
const sendPaymentVerifiedEmail = (email, details) =>
  sendEmail({
    to: email,
    subject: `Order Confirmed! #${details.orderId}`,
    html: getOrderConfirmedEmail(details),
  });

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmedEmail,
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
  // Legacy
  sendPendingVerificationEmail,
  sendPaymentVerifiedEmail,
};