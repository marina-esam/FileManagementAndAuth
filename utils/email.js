const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer.
 * Configure via .env:
 *   EMAIL_HOST=sandbox.smtp.mailtrap.io
 *   EMAIL_PORT=2525
 *   EMAIL_USER=<your_mailtrap_user>
 *   EMAIL_PASS=<your_mailtrap_pass>
 *   EMAIL_FROM=noreply@filemanager.com
 */
const sendEmail = async ({ to, subject, text }) => {
    // 1) Create a transporter (Mailtrap for dev, swap for Gmail/SES in production)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'File Manager <noreply@filemanager.com>',
        to,
        subject,
        text,
    };

    // 3) Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
