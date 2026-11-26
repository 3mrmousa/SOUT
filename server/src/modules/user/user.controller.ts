import type { Request, Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import { userService } from "./user.service.js";
import {
  generateAndSetJWT,
  cleanAuthCookies,
} from "../../utils/tokens/index.js";
import type { AuthRequest } from "../../types/types.js";
import type {
  SearchUserQuery,
  GetUserByIdParams,
  UpdateProfileInput,
  CheckUsernameQuery,
  ChangeUsernameInput,
  ChangePasswordInput,
  ChangeEmailRequestInput,
  VerifyCurrentMailInput,
  ChangeEmailInput,
  DeleteAccountInput,
} from "./user.schema.js";
import { forceLogoutAllSessions } from "../../socket.js";

export const searchUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = req.query as SearchUserQuery;
    const users = await userService.searchUsers(query.q, req.user.id);

    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  },
);

export const getUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const params = req.params as GetUserByIdParams;
    const user = await userService.getUserById(params.id);

    res.status(200).json({
      status: "success",
      data: { user },
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.body as UpdateProfileInput;
    const updatedUser = await userService.updateProfile(req.user.id, body);

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  },
);

export const checkUsername = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as CheckUsernameQuery;
    const exists = await userService.checkUsernameExists(query.username);

    res.status(200).json({
      status: "success",
      data: {
        username: query.username,
        exists,
        isAvailable: !exists,
      },
    });
  },
);

export const changeUsername = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.body as ChangeUsernameInput;
    const updatedUser = await userService.changeUsername(
      req.user.id,
      body.username,
    );

    generateAndSetJWT(
      updatedUser.id,
      updatedUser.username,
      updatedUser.tokenVersion,
      res,
    );

    res.status(200).json({
      status: "success",
      message: "Username updated successfully",
      data: { user: updatedUser },
    });
  },
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.body as ChangePasswordInput;
    await userService.changePassword(req.user.id, body);
    forceLogoutAllSessions(req.user.id);
    cleanAuthCookies(res);

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  },
);

export const updateProfileImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const updatedUser = await userService.updateProfileImage(
      req.user.id,
      req.file,
    );

    res.status(200).json({
      status: "success",
      message: "Profile image updated successfully",
      data: { user: updatedUser },
    });
  },
);

export const removeProfileImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const updatedUser = await userService.removeProfileImage(req.user.id);

    res.status(200).json({
      status: "success",
      message: "Profile image removed successfully",
      data: { user: updatedUser },
    });
  },
);

export const changeEmailRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.body as ChangeEmailRequestInput;
    const result = await userService.changeEmailRequest(req.user.id, body);

    res.status(200).json({
      status: "success",
      message: result.message,
      data: {
        currentEmail: result.currentEmail,
        newEmail: result.newEmail,
      },
    });
  },
);

export const verifyCurrentMail = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.body as VerifyCurrentMailInput;
    const result = await userService.verifyCurrentMail(req.user.id, body);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  },
);

export const changeEmail = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.body as ChangeEmailInput;
    const updatedUser = await userService.changeEmail(req.user.id, body);
    cleanAuthCookies(res);

    res.status(200).json({
      status: "success",
      message: "Email changed successfully",
      data: { user: updatedUser },
    });
  },
);

export const deleteAccount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.body as DeleteAccountInput;
    await userService.deleteAccount(req.user.id, body.password);
    cleanAuthCookies(res);

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  },
);
