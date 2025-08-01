import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendEmail = async (emailData: EmailData): Promise<void> => {
  const transporter = createTransporter();

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('📧 Email server is ready to take our messages');

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });

    console.log('✅ Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const emailData: EmailData = {
    to: email,
    subject: 'Password Reset Request - HabitWise',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HabitWise</h1>
              <h2>Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested a password reset for your HabitWise account. Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p><strong>This link will expire in 10 minutes.</strong></p>
              <p>If you didn't request this reset, please ignore this email. Your password will remain unchanged.</p>
              <p>For security reasons, please do not share this link with anyone.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The HabitWise Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - HabitWise
      
      You requested a password reset for your HabitWise account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 10 minutes.
      
      If you didn't request this reset, please ignore this email.
      Your password will remain unchanged.
      
      Best regards,
      The HabitWise Team
    `,
  };

  await sendEmail(emailData);
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const emailData: EmailData = {
    to: email,
    subject: 'Welcome to HabitWise! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to HabitWise</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to HabitWise!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Welcome to HabitWise! We're excited to help you build better habits and achieve your goals.</p>
              <p>Here's what you can do to get started:</p>
              <ul>
                <li>📝 Create your first habit</li>
                <li>📅 Set up your habit schedule</li>
                <li>📊 Track your progress</li>
                <li>🏆 Celebrate your achievements</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/habits" class="button">Get Started</a>
              </div>
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>Happy habit building!<br>The HabitWise Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to HabitWise! 🎉
      
      Hi ${name},
      
      Welcome to HabitWise! We're excited to help you build better habits and achieve your goals.
      
      Here's what you can do to get started:
      - Create your first habit
      - Set up your habit schedule
      - Track your progress
      - Celebrate your achievements
      
      Visit ${process.env.NEXTAUTH_URL}/habits to get started.
      
      If you have any questions, feel free to reach out to our support team.
      
      Happy habit building!
      The HabitWise Team
    `,
  };

  await sendEmail(emailData);
};
