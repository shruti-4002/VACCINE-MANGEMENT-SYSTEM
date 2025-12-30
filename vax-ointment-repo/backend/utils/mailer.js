const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendMail = async ({ to, subject, text, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("⚠️ SMTP not configured — skipping email to", to);
    return { skipped: true };
  }

  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || `"Vax System" <no-reply@example.com>`,
    to,
    subject,
    text,
    html
  });

  return info;
};

module.exports = { sendMail };
