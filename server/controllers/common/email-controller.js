// server/controllers/common/email-controller.js
const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email template for payment verification pending
const getPendingVerificationEmail = (orderDetails) => {
  const { orderId, totalAmount, customerName, orderItems } = orderDetails;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .total { font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Received!</h1>
          <p>Thank you for your order at Kenya Magic Toy Shop</p>
        </div>
        <div class="content">
          <h2>Hello ${customerName || 'Valued Customer'},</h2>
          <p>We've received your order and are processing it. Your order details are below:</p>
          
          <div class="order-box">
            <h3>Order #${orderId}</h3>
            <p><strong>Status:</strong> Awaiting Payment Verification</p>
            <div class="total">Total: KSh ${totalAmount.toFixed(2)}</div>
          </div>

          <div class="alert">
            <strong>⏳ Payment Verification in Progress</strong>
            <p>We're currently verifying your M-Pesa payment. This usually takes 1-2 hours during business hours.</p>
            <p>You'll receive a confirmation email once your payment is verified.</p>
          </div>

          <div style="margin: 30px 0;">
            <p><strong>Need Faster Processing?</strong></p>
            <p>For urgent orders or if you've already paid, please call us at:</p>
            <p style="font-size: 20px; color: #667eea;"><strong>📞 0799 654 321</strong></p>
          </div>

          <div class="footer">
            <p>Kenya Magic Toy Shop</p>
            <p>Making playtime magical! 🎈</p>
            <p>
              <a href="mailto:support@kenyamagictoyshop.com">support@kenyamagictoyshop.com</a> | 
              <a href="tel:+254799654321">0799 654 321</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for payment verified
const getPaymentVerifiedEmail = (orderDetails) => {
  const { orderId, totalAmount, customerName, orderItems, estimatedDelivery } = orderDetails;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .order-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 24px; font-weight: bold; color: #11998e; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Verified!</h1>
          <p>Your order is being prepared</p>
        </div>
        <div class="content">
          <div class="success-box">
            <h2 style="color: #155724; margin: 0;">🎉 Great News!</h2>
            <p style="margin: 10px 0 0 0;">Your payment has been verified and your order is now being processed.</p>
          </div>

          <h2>Hello ${customerName || 'Valued Customer'},</h2>
          <p>Thank you for your payment! We're excited to prepare your order.</p>
          
          <div class="order-box">
            <h3>Order #${orderId}</h3>
            <p><strong>Status:</strong> ✅ Payment Verified - Processing</p>
            <p><strong>Estimated Delivery:</strong> ${estimatedDelivery || '3-5 business days'}</p>
            <div class="total">Total Paid: KSh ${totalAmount.toFixed(2)}</div>
          </div>

          <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 8px;">
            <h3>What Happens Next?</h3>
            <ol>
              <li>📦 We're preparing your items for shipping</li>
              <li>🚚 Your order will be dispatched within 24 hours</li>
              <li>📲 You'll receive tracking information once shipped</li>
              <li>🎁 Delivery to your doorstep!</li>
            </ol>
          </div>

          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>📞 Questions or Special Requests?</strong>
            <p>Contact us at <strong>0799 654 321</strong> or reply to this email.</p>
          </div>

          <div class="footer">
            <p>Kenya Magic Toy Shop</p>
            <p>Making playtime magical! 🎈</p>
            <p>
              <a href="mailto:support@kenyamagictoyshop.com">support@kenyamagictoyshop.com</a> | 
              <a href="tel:+254799654321">0799 654 321</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send pending verification email
const sendPendingVerificationEmail = async (userEmail, orderDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Kenya Magic Toy Shop" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Received - Payment Verification in Progress #${orderDetails.orderId}`,
      html: getPendingVerificationEmail(orderDetails)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Pending verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending pending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send payment verified email
const sendPaymentVerifiedEmail = async (userEmail, orderDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Kenya Magic Toy Shop" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Payment Verified! Order #${orderDetails.orderId} is Being Prepared 🎉`,
      html: getPaymentVerifiedEmail(orderDetails)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Payment verified email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending payment verified email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPendingVerificationEmail,
  sendPaymentVerifiedEmail
};