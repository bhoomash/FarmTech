// Email Service using Nodemailer
import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('Email credentials not configured. Emails will not be sent.');
}

// Create transporter
const transporter = EMAIL_USER && EMAIL_PASS ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
}) : null;

// Send OTP Email
export const sendOTPEmail = async (email, otp) => {
  if (!transporter) {
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    return { success: true, message: 'OTP logged to console (email not configured)' };
  }

  try {
    const mailOptions = {
      from: `"FarmTech" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your Login OTP - FarmTech',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; letter-spacing: 8px; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>� AgriMart</h1>
              <p>Farm Solutions</p>
            </div>
            <div class="content">
              <h2>Welcome! Here's Your Login OTP</h2>
              <p>Use this OTP to complete your login:</p>
              <div class="otp">${otp}</div>
              <p><strong>This OTP is valid for 5 minutes.</strong></p>
              <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} FarmTech. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent to your email' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Failed to send email' };
  }
};

// Send Order Confirmation Email
export const sendOrderConfirmationEmail = async (email, orderDetails) => {
  if (!transporter) {
    console.log(`[DEV MODE] Order confirmation for ${email}:`, orderDetails);
    return { success: true, message: 'Order confirmation logged (email not configured)' };
  }

  try {
    const { orderId, items, total } = orderDetails;

    const itemsList = items
      .map(
        (item) =>
          `<li>${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}</li>`
      )
      .join('');

    const mailOptions = {
      from: `"AgriMart" <${EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .total { font-size: 24px; font-weight: bold; color: #2563eb; text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 Order Confirmed!</h1>
              <p>Thank you for your order</p>
            </div>
            <div class="content">
              <h2>Order #${orderId}</h2>
              <div class="order-details">
                <h3>Items:</h3>
                <ul>${itemsList}</ul>
                <div class="total">Total: ₹${total.toFixed(2)}</div>
              </div>
              <p>We'll notify you when your order is shipped.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} FarmTech. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Order confirmation sent' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Failed to send email' };
  }
};
