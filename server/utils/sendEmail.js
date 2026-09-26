const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, EMAIL_FROM } = process.env;
  // Google displays App Passwords with spaces; remove copied formatting spaces.
  const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s/g, '');
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    const error = new Error('Email service is not configured. Add SMTP settings to server/.env.');
    error.statusCode = 503;
    error.isOperational = true;
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
