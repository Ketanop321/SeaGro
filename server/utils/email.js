import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Email templates
const templates = {
  emailVerification: (data) => ({
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Welcome to SeaGro, ${data.name}!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/verify-email?token=${data.verificationToken}" 
             style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">
          ${process.env.CLIENT_URL}/verify-email?token=${data.verificationToken}
        </p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with SeaGro, you can safely ignore this email.
        </p>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Password Reset Request</h2>
        <p>Hello ${data.name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/reset-password?token=${data.resetToken}" 
             style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">
          ${process.env.CLIENT_URL}/reset-password?token=${data.resetToken}
        </p>
        <p>This link will expire in 10 minutes for security reasons.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
      </div>
    `
  }),

  welcome: (data) => ({
    subject: 'Welcome to SeaGro!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Welcome to SeaGro, ${data.name}!</h2>
        <p>Your email has been verified successfully. You're now ready to explore all the features SeaGro has to offer:</p>
        <ul style="line-height: 1.6;">
          <li>🚀 Find remote job opportunities</li>
          <li>📚 Access learning resources</li>
          <li>🚲 Discover bike sharing options</li>
          <li>💬 Connect with the community</li>
          <li>📰 Stay updated with tech news</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}" 
             style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Get Started
          </a>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Happy exploring!</p>
        <p>The SeaGro Team</p>
      </div>
    `
  })
};

// Create transporter
let transporter = null;

const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // Use Ethereal for development
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal.pass'
      }
    });
  } else {
    // Use real SMTP service for production
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
};

// Initialize transporter
const initializeTransporter = async () => {
  try {
    transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();
    logger.info('Email transporter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize email transporter:', error);
    transporter = null;
  }
};

// Initialize on module load
initializeTransporter();

// Send email function
export const sendEmail = async ({ to, subject, template, data, html, text }) => {
  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  try {
    let emailContent = {};

    if (template && templates[template]) {
      emailContent = templates[template](data);
    } else if (html || text) {
      emailContent = { subject, html, text };
    } else {
      throw new Error('No email content provided');
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@seagro.com',
      to,
      subject: emailContent.subject || subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully to ${to}`, {
      messageId: result.messageId,
      template: template || 'custom'
    });

    return result;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ success: true, email: email.to, messageId: result.messageId });
    } catch (error) {
      results.push({ success: false, email: email.to, error: error.message });
    }
  }
  
  return results;
};

// Email queue for better performance (simple in-memory queue)
class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  add(emailData) {
    this.queue.push(emailData);
    this.process();
  }

  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const emailData = this.queue.shift();
      
      try {
        await sendEmail(emailData);
      } catch (error) {
        logger.error('Failed to send queued email:', error);
      }

      // Small delay to prevent overwhelming the SMTP server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }
}

export const emailQueue = new EmailQueue();