import { db } from "../../prisma/db.js";
import AppError from "../../utils/errors/AppError.js";
import { comparePassword, hashPassword } from "../../utils/password/index.js";
import { generateOTP, hashOTP, verifyOTP } from "../../utils/otp/index.js";
import {
  setOTPSession,
  getOtpSession,
  deleteOtpSession,
} from "../../utils/redis/index.js";
import {
  sendChangeEmailCurrentOtpMail,
  sendChangeEmailNewOtpMail,
  sendEmailChangedMail,
  sendPasswordChangedMail,
} from "../../utils/mail/index.js";
import type {
  SafeUser,
  ProfileImageJson,
  ChatMediaItem,
} from "../../types/types.js";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  ChangeEmailRequestInput,
  VerifyCurrentMailInput,
  ChangeEmailInput,
} from "./user.schema.js";
import {
  deleteFromR2,
  uploadProfileImageToR2,
} from "../../utils/r2/r2.util.js";
import { RevocationReason } from "../auth/auth.service.js";

interface ChangeEmailSession {
  currentEmail: string;
  newEmail: string;
  currentHashedOTP: string;
  newHashedOTP?: string | null;
  step2: boolean;
}

export class UserService {
  async searchUsers(query: string, currentUserId: string): Promise<SafeUser[]> {
    const term = `%${query.trim()}%`;

    const users = await db.orm.public.User.where((u) => u.username.ilike(term))
      .where((u) => u.id.neq(currentUserId))
      .limit(20)
      .all();

    return users.map(({ password: _p, ...safe }) => safe);
  }

  async getUserById(id: string): Promise<SafeUser> {
    const user = await db.orm.public.User.first({ id });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { password: _p, ...safe } = user;
    return safe;
  }

  async getUserByUsername(username: string): Promise<SafeUser> {
    const user = await db.orm.public.User.first({ username: username.trim() });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { password: _p, ...safe } = user;
    return safe;
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    const user = await db.orm.public.User.where({
      username: username.trim(),
    }).first();
    return Boolean(user);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<SafeUser> {
    const updateData: { name?: string; bio?: string } = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.bio !== undefined) updateData.bio = input.bio;

    if (Object.keys(updateData).length === 0) {
      const user = await db.orm.public.User.first({ id: userId });
      if (!user) throw new AppError("User not found", 404);
      const { password: _p, ...safe } = user;
      return safe;
    }

    const updated = await db.orm.public.User.where({ id: userId }).update(
      updateData,
    );
    if (!updated) {
      throw new AppError("User not found", 404);
    }

    const { password: _p, ...safe } = updated;
    return safe;
  }

  async changeUsername(userId: string, newUsername: string): Promise<SafeUser> {
    const user = await db.orm.public.User.first({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.username === newUsername) {
      const { password: _p, ...safe } = user;
      return safe;
    }

    const existing = await db.orm.public.User.where({
      username: newUsername,
    }).first();
    if (existing) {
      throw new AppError("Username is already taken", 409);
    }

    await db.orm.public.User.where({ id: userId }).update({
      username: newUsername,
    });

    const updated = await db.orm.public.User.first({ id: userId });
    if (!updated) {
      throw new AppError("Failed to update username", 500);
    }

    const { password: _p, ...safe } = updated;
    return safe;
  }

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
  ): Promise<void> {
    const user = await db.orm.public.User.first({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await comparePassword(input.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError("Current password does not match", 400);
    }

    if (input.oldPassword === input.newPassword) {
      throw new AppError(
        "New password must be different from current password",
        400,
      );
    }

    const hashedPassword = await hashPassword(input.newPassword);

    await db.transaction(async (tx) => {
      const currentUser = await tx.orm.public.User.where({ id: userId })
        .forNoKeyUpdate()
        .first();
      if (!currentUser) {
        throw new AppError("User not found", 404);
      }
      await tx.orm.public.User.where({ id: userId }).update({
        password: hashedPassword,
        tokenVersion: currentUser.tokenVersion + 1,
      });

      await tx.orm.public.RefreshToken.where((rt) => rt.userId.eq(userId))
        .where((rt) => rt.revokedAt.isNull())
        .updateAll({
          revokedAt: new Date().toISOString(),
          revokedReason: RevocationReason.PASSWORD_CHANGE,
        });
    });

    sendPasswordChangedMail(user.email, user.name).catch((err) => {
      console.error("Failed to send password changed email:", err);
    });
  }

  async updateProfileImage(
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<SafeUser> {
    if (!file) {
      throw new AppError("No image file provided", 400);
    }

    const user = await db.orm.public.User.first({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const uploadResult = await uploadProfileImageToR2(
      file.buffer,
      file.mimetype,
      userId,
    );

    if (user.image) {
      const oldPublicId = (user.image as unknown as ProfileImageJson)
        ?.public_id;
      if (oldPublicId) {
        await deleteFromR2(oldPublicId).catch(() => {});
      }
    }

    await db.orm.public.User.where({ id: userId }).update({
      image: uploadResult,
    });

    const updated = await db.orm.public.User.first({ id: userId });
    if (!updated) {
      throw new AppError("Failed to update profile image", 500);
    }

    const { password: _p, ...safe } = updated;
    return safe;
  }

  async removeProfileImage(userId: string): Promise<SafeUser> {
    const user = await db.orm.public.User.first({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.image) {
      const publicId = (user.image as unknown as ProfileImageJson)?.public_id;
      if (publicId) {
        await deleteFromR2(publicId).catch(() => {});
      }
    }

    await db.orm.public.User.where({ id: userId }).update({
      image: null,
    });

    const updated = await db.orm.public.User.first({ id: userId });
    if (!updated) {
      throw new AppError("Failed to remove profile image", 500);
    }

    const { password: _p, ...safe } = updated;
    return safe;
  }

  async changeEmailRequest(
    userId: string,
    input: ChangeEmailRequestInput,
  ): Promise<{ message: string; currentEmail: string; newEmail: string }> {
    const user = await db.orm.public.User.first({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const currentEmail = input.currentEmail.toLowerCase().trim();
    const newEmail = input.newEmail.toLowerCase().trim();

    if (user.email.toLowerCase() !== currentEmail) {
      throw new AppError(
        "Current email does not match your registered email",
        400,
      );
    }

    if (currentEmail === newEmail) {
      throw new AppError("New email must be different from current email", 400);
    }

    const existingUser = await db.orm.public.User.where({
      email: newEmail,
    }).first();
    if (existingUser) {
      throw new AppError("Email is already registered by another account", 409);
    }

    const otp = generateOTP();
    const currentHashedOTP = hashOTP(otp);

    const sessionData: ChangeEmailSession = {
      currentEmail,
      newEmail,
      currentHashedOTP,
      newHashedOTP: null,
      step2: false,
    };

    await setOTPSession(`change-email:${currentEmail}`, sessionData, 600);
    await sendChangeEmailCurrentOtpMail(currentEmail, otp);

    return {
      message: "Verification code sent to your current email address",
      currentEmail,
      newEmail,
    };
  }

  async verifyCurrentMail(
    userId: string,
    input: VerifyCurrentMailInput,
  ): Promise<{ message: string }> {
    const user = await db.orm.public.User.first({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const currentEmail = input.currentEmail.toLowerCase().trim();
    if (user.email.toLowerCase() !== currentEmail) {
      throw new AppError(
        "Current email does not match your registered email",
        400,
      );
    }

    const session = await getOtpSession<ChangeEmailSession>(
      `change-email:${currentEmail}`,
    );
    if (!session) {
      throw new AppError(
        "Email change session expired or not found. Please request again.",
        400,
      );
    }

    const isValid = verifyOTP(input.otp.trim(), session.currentHashedOTP);
    if (!isValid) {
      throw new AppError("Invalid or expired verification code", 400);
    }

    const newOTP = generateOTP();
    const newHashedOTP = hashOTP(newOTP);

    const updatedSession: ChangeEmailSession = {
      ...session,
      newHashedOTP,
      step2: true,
    };

    await setOTPSession(`change-email:${currentEmail}`, updatedSession, 600);
    await sendChangeEmailNewOtpMail(session.newEmail, newOTP);

    return {
      message:
        "Current email verified successfully. Verification code sent to your new email address.",
    };
  }

  async changeEmail(
    userId: string,
    input: ChangeEmailInput,
  ): Promise<SafeUser> {
    const user = await db.orm.public.User.first({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const currentEmail = input.currentEmail.toLowerCase().trim();
    if (user.email.toLowerCase() !== currentEmail) {
      throw new AppError(
        "Current email does not match your registered email",
        400,
      );
    }

    const session = await getOtpSession<ChangeEmailSession>(
      `change-email:${currentEmail}`,
    );
    if (!session) {
      throw new AppError(
        "Email change session expired or not found. Please request again.",
        400,
      );
    }

    if (!session.step2 || !session.newHashedOTP) {
      throw new AppError(
        "Current email has not been verified yet. Please verify your current email first.",
        400,
      );
    }

    const isValid = verifyOTP(input.otp.trim(), session.newHashedOTP);
    if (!isValid) {
      throw new AppError(
        "Invalid or expired verification code for new email",
        400,
      );
    }

    const existingUser = await db.orm.public.User.where({
      email: session.newEmail,
    }).first();
    if (existingUser && existingUser.id !== userId) {
      throw new AppError("Email is already registered by another account", 409);
    }

    await db.orm.public.User.where({ id: userId }).update({
      email: session.newEmail,
    });

    // Invalidate all existing sessions upon email change
    await db.orm.public.RefreshToken.where((rt) => rt.userId.eq(userId))
      .where((rt) => rt.revokedAt.isNull())
      .updateAll({
        revokedAt: new Date().toISOString(),
        revokedReason: "EMAIL_CHANGE",
      });

    await deleteOtpSession(`change-email:${currentEmail}`);
    await sendEmailChangedMail(
      session.currentEmail,
      session.newEmail,
      user.name,
    );

    const updated = await db.orm.public.User.first({ id: userId });
    if (!updated) {
      throw new AppError("Failed to update email", 500);
    }

    const { password: _p, ...safe } = updated;
    return safe;
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await db.orm.public.User.first({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Incorrect password", 401);
    }

    const r2KeysToDelete: string[] = [];
    const profilePublicId = (user.image as unknown as ProfileImageJson)
      ?.public_id;
    if (profilePublicId) {
      r2KeysToDelete.push(profilePublicId);
    }

    const participations = await db.orm.public.ConversationParticipant.where({
      userId,
    }).all();
    const convIds = participations.map((p) => p.conversationId);

    for (const convId of convIds) {
      const msgs = await db.orm.public.Message.where({
        conversationId: convId,
      }).all();

      for (const msg of msgs) {
        const mediaList = msg.media as unknown as ChatMediaItem[] | null;

        if (Array.isArray(mediaList)) {
          for (const item of mediaList) {
            if (item?.key) r2KeysToDelete.push(item.key);
          }
        }
      }
    }

    await db.transaction(async (tx) => {
      for (const convId of convIds) {
        await tx.orm.public.Message.where({
          conversationId: convId,
        }).deleteAll();
        await tx.orm.public.ConversationParticipant.where({
          conversationId: convId,
        }).deleteAll();
        await tx.orm.public.Conversation.where({ id: convId }).deleteAll();
      }

      await tx.orm.public.Message.where({ senderId: userId }).deleteAll();
      await tx.orm.public.RefreshToken.where({ userId }).deleteAll();
      await tx.orm.public.User.where({ id: userId }).deleteAll();
    });

    if (r2KeysToDelete.length > 0) {
      await Promise.allSettled(r2KeysToDelete.map((key) => deleteFromR2(key)));
    }
  }
}

export const userService = new UserService();
