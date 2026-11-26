import type { Request, Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import { authService, RevocationReason } from "./auth.service.js";
import {
  generateAndSetJWT,
  cleanAuthCookies,
  generateRefreshToken,
  setRefreshToken,
} from "../../utils/tokens/index.js";
import type { AuthRequest } from "../../types/types.js";
import type {
  RegisterInput,
  VerifyRegisterInput,
  LoginInput,
  ForgotPasswordInput,
  VerifyForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.schema.js";
import AppError from "../../utils/errors/AppError.js";
import { forceLogoutAllSessions } from "../../socket.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterInput;

  const result = await authService.requestRegister(body);

  res.status(200).json({
    status: "success",
    message: "Verification code sent to your email",
    data: result,
  });
});

export const verifyRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as VerifyRegisterInput;

    const user = await authService.verifyRegister(body);
    generateAndSetJWT(user.id, user.username, user.tokenVersion, res);
    const { token, hashedToken, expiresAt } = generateRefreshToken();
    setRefreshToken(res, token);
    await authService.createRefreshToken(user.id, hashedToken, expiresAt);

    res.status(201).json({
      status: "success",
      message: "Registration completed successfully",
      data: { user },
    });
  },
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginInput;

  const user = await authService.login(body);
  generateAndSetJWT(user.id, user.username, user.tokenVersion, res);
  const { token, hashedToken, expiresAt } = generateRefreshToken();
  setRefreshToken(res, token);
  await authService.createRefreshToken(user.id, hashedToken, expiresAt);

  res.status(200).json({
    status: "success",
    message: "Logged in successfully",
    data: { user },
  });
});

export const requestForgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as ForgotPasswordInput;
    const result = await authService.requestForgotPassword(body);

    res.status(200).json({
      status: "success",
      message: "Password reset OTP sent to your email",
      data: result,
    });
  },
);

export const verifyForgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as VerifyForgotPasswordInput;
    const result = await authService.verifyForgotPassword(body);

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully. You may now reset your password.",
      data: result,
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as ResetPasswordInput;
    await authService.resetPassword(body);
    cleanAuthCookies(res);

    res.status(200).json({
      status: "success",
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  },
);

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const rawToken = req.cookies?.refresh_token;
    try {
      const { safeUser, refreshToken } =
        await authService.refreshToken(rawToken);
      generateAndSetJWT(
        safeUser.id,
        safeUser.username,
        safeUser.tokenVersion,
        res,
      );
      setRefreshToken(res, refreshToken);

      res.status(200).json({
        status: "success",
        message: "Token refreshed successfully",
        data: { user: safeUser },
      });
    } catch (err: any) {
      const isAuthFailure = err instanceof AppError && err.statusCode === 401;
      const isStaleRotation =
        err?.code === RevocationReason.ROTATED ||
        err?.message?.includes("been rotated");
      if (isAuthFailure && !isStaleRotation) {
        cleanAuthCookies(res);
      }
      throw err;
    }
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.refresh_token;
  if (rawToken) {
    await authService.logout(rawToken).catch(() => {});
  }
  cleanAuthCookies(res);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const logoutAll = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await authService.logoutAll(req.user.id);
    forceLogoutAllSessions(req.user.id);
    cleanAuthCookies(res);

    res.status(200).json({
      status: "success",
      message: "Logged out from all devices successfully",
    });
  },
);

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});
