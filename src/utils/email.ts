import nodemailer from "nodemailer";
import { logger } from "./logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter
const createTransporter = () => {
  // Mailtrap sandbox configuration
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "b50a02ac848043",
      pass: "8d6b2d9a6f9dc2",
    },
  });
};

// Send email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info("Email sent successfully", {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });
  } catch (error) {
    logger.error("Failed to send email", {
      error: error instanceof Error ? error.message : "Unknown error",
      to: options.to,
      subject: options.subject,
    });
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name: string, verificationUrl: string) => ({
    subject: "Welcome to Listro!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Listro!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining Listro! We're excited to have you on board.</p>
        <p>To get started, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The Listro Team
        </p>
      </div>
    `,
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The Listro Team
        </p>
      </div>
    `,
  }),

  bookingConfirmation: (name: string, bookingDetails: any) => ({
    subject: "Booking Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Booking Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details</h3>
          <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
          <p><strong>Date:</strong> ${new Date(
            bookingDetails.scheduledAt
          ).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(
            bookingDetails.scheduledAt
          ).toLocaleTimeString()}</p>
          <p><strong>Amount:</strong> $${bookingDetails.amount}</p>
          <p><strong>Status:</strong> ${bookingDetails.status}</p>
        </div>
        <p>We'll send you a reminder before your appointment.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The Listro Team
        </p>
      </div>
    `,
  }),

  vendorApproval: (name: string, businessName: string) => ({
    subject: "Vendor Application Approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Congratulations!</h1>
        <p>Hi ${name},</p>
        <p>Great news! Your vendor application for <strong>${businessName}</strong> has been approved.</p>
        <p>You can now start adding your services and accepting bookings from customers.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/vendor/dashboard" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The Listro Team
        </p>
      </div>
    `,
  }),

  otpVerification: (name: string, otpCode: string) => ({
    subject: "Verify Your Email - Listro",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verify Your Email</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering with Listro! To complete your registration, please verify your email address using the OTP code below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f3f4f6; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; display: inline-block;">
            <h2 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 4px; font-family: 'Courier New', monospace;">${otpCode}</h2>
          </div>
        </div>
        
        <p style="text-align: center; color: #6b7280; font-size: 14px;">
          Enter this code in the app to verify your email address.
        </p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>Important:</strong> This OTP will expire in 15 minutes. If you don't verify within this time, you'll need to request a new OTP.
          </p>
        </div>
        
        <p>If you didn't create an account with Listro, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The Listro Team
        </p>
      </div>
    `,
  }),

  otpResend: (name: string, otpCode: string) => ({
    subject: "New OTP Code - Listro",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New OTP Code</h1>
        <p>Hi ${name},</p>
        <p>You requested a new OTP code for email verification. Here's your new verification code:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f3f4f6; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; display: inline-block;">
            <h2 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 4px; font-family: 'Courier New', monospace;">${otpCode}</h2>
          </div>
        </div>
        
        <p style="text-align: center; color: #6b7280; font-size: 14px;">
          Enter this code in the app to verify your email address.
        </p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>Important:</strong> This OTP will expire in 15 minutes. If you don't verify within this time, you'll need to request a new OTP.
          </p>
        </div>
        
        <p>If you didn't request a new OTP, please contact our support team.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The Listro Team
        </p>
      </div>
    `,
  }),
};
