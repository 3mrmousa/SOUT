import { db } from "../../prisma/db.js";
import AppError from "../../utils/errors/AppError.js";

export const RevocationReason = {
  ROTATED: "ROTATED",
  LOGOUT: "LOGOUT",
  LOGOUT_ALL: "LOGOUT_ALL",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  EMAIL_CHANGE: "EMAIL_CHANGE",
  EXPIRED: "EXPIRED",
} as const;

import { hashPassword, comparePassword } from "../../utils/password/index.js";
import { generateRefreshToken, hashToken } from "../../utils/tokens/index.js";
import { generateOTP, hashOTP, verifyOTP } from "../../utils/otp/index.js";
import {
  setOTPSession,
  getOtpSession,
  deleteOtpSession,
} from "../../utils/redis/index.js";
import {
  sendRegisterRequestOtpMail,
  sendForgotPasswordOtpMail,
  sendPasswordChangedMail,
  sendWelcomeMail,
} from "../../utils/mail/index.js";
import type {
  RegisterInput,
  VerifyRegisterInput,
  LoginInput,
  ForgotPasswordInput,
  VerifyForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.schema.js";
import type { SafeUser } from "../../types/types.js";
import { forceLogoutAllSessions } from "../../socket.js";

export class AuthService {
  async requestRegister(input: RegisterInput): Promise<{ email: string }> {
    const { email, password, username, name } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const existingEmail = await db.orm.public.User.where({
      email: normalizedEmail,
    }).first();
    if (existingEmail) {
      throw new AppError("Email is already registered", 409);
    }

    const existingUsername = await db.orm.public.User.where({
      username: username.trim(),
    }).first();
    if (existingUsername) {
      throw new AppError("Username is already taken", 409);
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);

    await setOTPSession(
      `register:${normalizedEmail}`,
      {
        email: normalizedEmail,
        password: hashedPassword,
        username: username.trim(),
        name: name.trim(),
        hashedOtp,
      },
      600,
    );

    await sendRegisterRequestOtpMail(normalizedEmail, otp);

    return { email: normalizedEmail };
  }

  async verifyRegister(input: VerifyRegisterInput): Promise<SafeUser> {
    const { email, otp } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const session = await getOtpSession<{
      email: string;
      password: string;
      username: string;
      name: string;
      hashedOtp: string;
    }>(`register:${normalizedEmail}`);

    if (!session) {
      throw new AppError(
        "Verification code has expired or was not requested. Please register again.",
        400,
      );
    }

    const isValid = verifyOTP(otp.trim(), session.hashedOtp);
    if (!isValid) {
      throw new AppError("Invalid verification code", 400);
    }

    const existingEmail = await db.orm.public.User.where({
      email: session.email,
    }).first();
    if (existingEmail) {
      await deleteOtpSession(`register:${normalizedEmail}`);
      throw new AppError("Email is already registered", 409);
    }

    const existingUsername = await db.orm.public.User.where({
      username: session.username,
    }).first();
    if (existingUsername) {
      await deleteOtpSession(`register:${normalizedEmail}`);
      throw new AppError("Username is already taken", 409);
    }

    const newUser = await db.orm.public.User.create({
      email: session.email,
      password: session.password,
      username: session.username,
      name: session.name,
    });

    await deleteOtpSession(`register:${normalizedEmail}`);

    sendWelcomeMail(newUser.email, newUser.name).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    const { password: _p, ...safeUser } = newUser;
    return safeUser;
  }

  async login(input: LoginInput): Promise<SafeUser> {
    const { identifier, password } = input;
    const trimmedIdentifier = identifier.trim();
    const normalizedEmail = trimmedIdentifier.toLowerCase();

    let user = await db.orm.public.User.where({
      email: normalizedEmail,
    }).first();
    if (!user) {
      user = await db.orm.public.User.where({
        username: trimmedIdentifier,
      }).first();
    }

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.isLocked) {
      throw new AppError("Your account has been locked. Contact support.", 403);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const { password: _p, ...safeUser } = user;
    return safeUser;
  }

  async requestForgotPassword(
    input: ForgotPasswordInput,
  ): Promise<{ email: string }> {
    const { email } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.orm.public.User.where({
      email: normalizedEmail,
    }).first();
    if (!user) {
      throw new AppError("No account found with this email", 404);
    }

    if (user.isLocked) {
      throw new AppError("Your account has been locked. Contact support.", 403);
    }

    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);

    await setOTPSession(
      `forgot-password:${normalizedEmail}`,
      {
        email: normalizedEmail,
        hashedOtp,
        step1: true,
        step2: false,
      },
      600,
    );

    await sendForgotPasswordOtpMail(normalizedEmail, otp);

    return { email: normalizedEmail };
  }

  async verifyForgotPassword(
    input: VerifyForgotPasswordInput,
  ): Promise<{ email: string }> {
    const { email, otp } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const session = await getOtpSession<{
      email: string;
      hashedOtp: string;
      step1: boolean;
      step2: boolean;
    }>(`forgot-password:${normalizedEmail}`);

    if (!session || !session.step1) {
      throw new AppError(
        "Password reset session has expired or was not requested. Please request a new code.",
        400,
      );
    }

    const isValid = verifyOTP(otp.trim(), session.hashedOtp);
    if (!isValid) {
      throw new AppError("Invalid verification code", 400);
    }

    await setOTPSession(
      `forgot-password:${normalizedEmail}`,
      {
        ...session,
        step2: true,
      },
      600,
    );

    return { email: normalizedEmail };
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const normalizedEmail = input.email.toLowerCase().trim();
    const otpKey = `forgot-password:${normalizedEmail}`;

    const session = await getOtpSession<{
      email: string;
      hashedOtp: string;
      step1: boolean;
      step2: boolean;
    }>(otpKey);

    if (!session?.step1 || !session.step2) {
      throw new AppError(
        "Unauthorized password reset. Please request and verify your OTP first.",
        400,
      );
    }

    const user = await db.orm.public.User.where({
      email: normalizedEmail,
    }).first();
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (await comparePassword(input.password, user.password)) {
      throw new AppError(
        "New password must be different from current password",
        400,
      );
    }

    const hashedPassword = await hashPassword(input.password);

    await db.transaction(async (tx) => {
      const currentUser = await tx.orm.public.User.where({ id: user.id })
        .forNoKeyUpdate()
        .first();
      if (!currentUser) {
        throw new AppError("User not found", 404);
      }

      await tx.orm.public.User.where({ id: currentUser.id }).update({
        password: hashedPassword,
        tokenVersion: currentUser.tokenVersion + 1,
      });

      await tx.orm.public.RefreshToken.where((rt) =>
        rt.userId.eq(currentUser.id),
      )
        .where((rt) => rt.revokedAt.isNull())
        .updateAll({
          revokedAt: new Date().toISOString(),
          revokedReason: RevocationReason.PASSWORD_CHANGE,
        });
    });

    forceLogoutAllSessions(user.id);

    await deleteOtpSession(otpKey);

    sendPasswordChangedMail(user.email, user.name).catch((err) => {
      console.error("Failed to send password changed email:", err);
    });
  }

  async createRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: string,
    tx?: any,
  ): Promise<void> {
    const client = tx ?? db;
    await client.orm.public.RefreshToken.create({
      userId,
      tokenHash,
      expiresAt,
    });
  }

  async refreshToken(
    rawToken: string,
  ): Promise<{ safeUser: SafeUser; refreshToken: string }> {
    if (!rawToken) {
      throw new AppError("Refresh token is required", 401);
    }
    const tokenHash = hashToken(rawToken);

    return await db.transaction(async (tx) => {
      const candidate = await tx.orm.public.RefreshToken.where((rt) =>
        rt.tokenHash.eq(tokenHash),
      ).first();

      if (!candidate) {
        throw new AppError("Invalid refresh token", 401);
      }

      const currentUser = await tx.orm.public.User.where({
        id: candidate.userId,
      })
        .forNoKeyUpdate()
        .first();

      if (!currentUser || currentUser.isLocked) {
        throw new AppError("User not found or account locked", 401);
      }

      const storedToken = await tx.orm.public.RefreshToken.where((rt) =>
        rt.tokenHash.eq(tokenHash),
      ).first();

      if (!storedToken) {
        throw new AppError("Invalid refresh token", 401);
      }

      // Check if token is expired
      if (new Date(storedToken.expiresAt).getTime() < Date.now()) {
        if (!storedToken.revokedAt) {
          await tx.orm.public.RefreshToken.where({ id: storedToken.id }).update(
            {
              revokedAt: new Date().toISOString(),
              revokedReason: RevocationReason.EXPIRED,
            },
          );
        }
        throw new AppError("Refresh token has expired", 401);
      }

      // Check if token is already revoked
      if (storedToken.revokedAt) {
        if (storedToken.revokedReason === RevocationReason.ROTATED) {
          throw new AppError(
            "Refresh token has already been rotated",
            401,
            RevocationReason.ROTATED,
          );
        }
        throw new AppError("Refresh token has been revoked", 401);
      }

      // Atomic conditional update: only update if revokedAt is still null
      const updated = await tx.orm.public.RefreshToken.where({
        id: storedToken.id,
      })
        .where((rt) => rt.revokedAt.isNull())
        .update({
          revokedAt: new Date().toISOString(),
          revokedReason: RevocationReason.ROTATED,
        });

      if (!updated) {
        // Concurrently rotated by another request
        throw new AppError(
          "Refresh token has already been rotated",
          401,
          RevocationReason.ROTATED,
        );
      }

      const {
        token: refreshToken,
        hashedToken,
        expiresAt,
      } = generateRefreshToken();
      await this.createRefreshToken(currentUser.id, hashedToken, expiresAt, tx);

      const { password: _p, ...safeUser } = currentUser;
      return { safeUser, refreshToken };
    });
  }

  async logout(rawToken?: string): Promise<void> {
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await db.orm.public.RefreshToken.where((rt) => rt.tokenHash.eq(tokenHash))
        .where((rt) => rt.revokedAt.isNull())
        .update({
          revokedAt: new Date().toISOString(),
          revokedReason: RevocationReason.LOGOUT,
        });
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const currentUser = await tx.orm.public.User.where({ id: userId })
        .forNoKeyUpdate()
        .first();
      if (!currentUser) {
        throw new AppError("User not found", 404);
      }
      await tx.orm.public.RefreshToken.where((rt) => rt.userId.eq(userId))
        .where((rt) => rt.revokedAt.isNull())
        .updateAll({
          revokedAt: new Date().toISOString(),
          revokedReason: RevocationReason.LOGOUT_ALL,
        });
      await tx.orm.public.User.where({ id: userId }).update({
        tokenVersion: currentUser.tokenVersion + 1,
      });
    });
  }
}

export const authService = new AuthService();
