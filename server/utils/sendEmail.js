// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = 465,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM, // optional: tên hiển thị/from
} = process.env;

/**
 * Gửi email đơn giản (text + optional html)
 * @param {string} to - địa chỉ người nhận
 * @param {string} subject - tiêu đề
 * @param {string} text - nội dung text
 * @param {string} [html] - nội dung html (tùy chọn)
 */
async function sendEmail(to, subject, text, html) {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('Thiếu SMTP_USER/SMTP_PASS trong .env');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // 465 dùng TLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const fromAddress = SMTP_FROM || `MyMaid <${SMTP_USER}>`;

  const mail = {
    from: fromAddress,
    to,
    subject,
    text,
  };

  if (html) mail.html = html;

  await transporter.sendMail(mail);
}

module.exports = sendEmail; // <-- export mặc định là HÀM
