
const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const sendMail = async (opts) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  };
  return transporter.sendMail(mailOptions);
};
module.exports = { sendMail };
