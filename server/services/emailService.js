// emailService.js

const nodemailer = require('nodemailer');

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


/**
 * Send password reset email
 * @param {string} email     Recipient’s email address
 * @param {string} resetUrl  Password‐reset URL
 */
exports.sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const mailOptions = {
      from: `"NeuroBrief Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset</h2>
          <p>You requested a password reset for your NeuroBrief account.</p>
          <p>Click the button below to reset your password:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </p>
          
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="font-size: 0.9rem; color: #6b7280;">
            If you're having trouble with the button above, copy and paste the URL below into your web browser:
          </p>
          <p style="font-size: 0.9rem; color: #6b7280; word-break: break-all;">
            ${resetUrl}
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send password reset email');
  }

  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to send messages');
    }
  });
};


/**
 * Send email verification code
 * @param {string} email             Recipient’s email address
 * @param {string} verificationCode  6-digit numeric code
 */
exports.sendEmailVerification = async (email, verificationCode) => {
  try {
    const mailOptions = {
      from: `"NeuroBrief Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Verification</h2>
          <p>Thank you for signing up for NeuroBrief.</p>
          <p>Your verification code is:</p>
          <h1 style="font-size: 2rem; letter-spacing: 0.1rem; margin: 20px 0;">${verificationCode}</h1>
          <p>This code will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 0.9rem; color: #6b7280;">
            If you didn’t request this, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification code email sent to ${email}`);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send verification email');
  }
};
