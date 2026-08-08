const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: "SendGrid",
        auth: {
            user: process.env.EMAIL_USER || "apikey",
            pass: process.env.EMAIL_PASS,
        },
    });

    // Support both parameter formats: { to, subject, text } or { email, subject, message }
    const to = options.to || options.email;
    const text = options.text || options.message;
    const subject = options.subject;

    // SendGrid requires a verified sender email for the 'from' field
    const from = process.env.EMAIL_FROM || `FILE MANAGEMENT SYSTEM <${process.env.EMAIL_USER}>`;

    const mailOptions = {
        from,
        to,
        subject,
        text,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

