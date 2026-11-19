import AppError from "../errors/AppError.js";
import { transporter, baseEmailLayout } from "../../config/mail.config.js";

const getSenderEmail = () => process.env.MAIL_USER || process.env.EMAIL_USER;

export const sendRegisterRequestOtpMail = async (
  email: string,
  otp: string,
) => {
  const html = baseEmailLayout(
    "Verify Your Email",
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>Thank you for creating an account with <strong>SOUT</strong>. Please enter the verification code below to confirm your email and get started:</p>
      <div style="background-color: #2b2d31; border: 1px dashed #4e5058; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #5865f2; font-family: 'Consolas', 'Courier New', monospace;">
          ${otp}
        </span>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="margin-bottom: 0; color: #949ba4;">If you did not request this registration, please ignore this email.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: `"SOUT" <${getSenderEmail()}>`,
      to: email,
      subject: "SOUT - Verify your email",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send OTP email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendForgotPasswordOtpMail = async (email: string, otp: string) => {
  const html = baseEmailLayout(
    "Reset Your Password",
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>We received a request to reset the password for your <strong>SOUT</strong> account. Please use the following verification code to proceed:</p>
      <div style="background-color: #2b2d31; border: 1px dashed #4e5058; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #5865f2; font-family: 'Consolas', 'Courier New', monospace;">
          ${otp}
        </span>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="margin-bottom: 0; color: #949ba4;">If you did not request a password reset, you can safely ignore this email.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: `"SOUT" <${getSenderEmail()}>`,
      to: email,
      subject: "SOUT - Reset your password",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send OTP email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendWelcomeMail = async (
  email: string,
  name: string,
  role: "CUSTOMER" | "ADMIN" = "CUSTOMER",
) => {
  const accountDescription =
    role === "ADMIN"
      ? "You have administrative access to manage users, channels, and platform operations."
      : "Your account is all set. You can now connect, chat, and collaborate seamlessly on SOUT.";

  const html = baseEmailLayout(
    "Welcome to SOUT",
    `
      <p style="margin-top: 0;">Hello ${name},</p>
      <p>Welcome to <strong>SOUT</strong>! We are thrilled to have you with us.</p>
      <div style="background-color: #2b2d31; border: 1px solid #383a40; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 18px; font-weight: 600; color: #f2f3f5;">
          Your account is ready!
        </span>
        <p style="margin-top: 10px; margin-bottom: 0; color: #949ba4; font-size: 14px;">
          ${accountDescription}
        </p>
      </div>
      <p style="margin-bottom: 0; color: #949ba4;">If you ever have any questions or need assistance, feel free to contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: `"SOUT" <${getSenderEmail()}>`,
      to: email,
      subject: "Welcome to SOUT",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send welcome email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendPasswordChangedMail = async (email: string, name: string) => {
  const html = baseEmailLayout(
    "Password Changed",
    `
      <p style="margin-top: 0;">Hello ${name},</p>
      <p>Your password for your <strong>SOUT</strong> account was successfully updated.</p>
      <div style="background-color: #2b2d31; border: 1px solid #383a40; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 16px; font-weight: 600; color: #f2f3f5;">
          Security Alert
        </span>
        <p style="margin-top: 8px; margin-bottom: 0; color: #949ba4; font-size: 14px;">
          If you made this change, no further action is needed.
        </p>
      </div>
      <p style="margin-bottom: 0; color: #f38688;">If you did <strong>not</strong> make this change, please contact our support team immediately to secure your account.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: `"SOUT" <${getSenderEmail()}>`,
      to: email,
      subject: "SOUT - Your password has been changed",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send password changed email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendChangeEmailCurrentOtpMail = async (
  email: string,
  otp: string,
) => {
  const html = baseEmailLayout(
    "Verify Email Change Request",
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>We received a request to change the email address for your <strong>SOUT</strong> account. Please use the verification code below to authorize this request:</p>
      <div style="background-color: #2b2d31; border: 1px dashed #4e5058; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #5865f2; font-family: 'Consolas', 'Courier New', monospace;">
          ${otp}
        </span>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="margin-bottom: 0; color: #f38688;">If you did not request this change, please contact our support team immediately.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: `"SOUT" <${getSenderEmail()}>`,
      to: email,
      subject: "SOUT - Authorize Email Change",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send OTP email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendChangeEmailNewOtpMail = async (email: string, otp: string) => {
  const html = baseEmailLayout(
    "Confirm Your New Email",
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>You requested to set this email address as your new primary email for your <strong>SOUT</strong> account. Please enter the verification code below to complete the change:</p>
      <div style="background-color: #2b2d31; border: 1px dashed #4e5058; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #5865f2; font-family: 'Consolas', 'Courier New', monospace;">
          ${otp}
        </span>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="margin-bottom: 0; color: #949ba4;">If you did not request this, please ignore this email.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: `"SOUT" <${getSenderEmail()}>`,
      to: email,
      subject: "SOUT - Confirm your new email address",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send OTP email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendEmailChangedMail = async (
  oldEmail: string,
  newEmail: string,
  name: string,
) => {
  const html = baseEmailLayout(
    "Account Email Changed",
    `
      <p style="margin-top: 0;">Hello ${name},</p>
      <p>Your primary email address for your <strong>SOUT</strong> account was successfully updated to <strong>${newEmail}</strong>.</p>
      <div style="background-color: #2b2d31; border: 1px solid #383a40; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 16px; font-weight: 600; color: #f2f3f5;">
          Security Alert
        </span>
        <p style="margin-top: 8px; margin-bottom: 0; color: #949ba4; font-size: 14px;">
          If you made this change, no further action is needed.
        </p>
      </div>
      <p style="margin-bottom: 0; color: #f38688;">If you did <strong>not</strong> make this change, please contact our support team immediately to protect your account.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: `"SOUT" <${getSenderEmail()}>`,
      to: oldEmail,
      subject: "SOUT - Your email address has been changed",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send email changed notification",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};
