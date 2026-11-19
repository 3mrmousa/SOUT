import type { SafeUser, ApiResponse } from "../auth/types";

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
}

export interface CheckUsernameResponse {
  username: string;
  exists: boolean;
  isAvailable: boolean;
}

export interface ChangeUsernameInput {
  username: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequestInput {
  currentEmail: string;
  newEmail: string;
}

export interface VerifyCurrentMailInput {
  currentEmail: string;
  otp: string;
}

export interface ChangeEmailInput {
  currentEmail: string;
  otp: string;
}

export interface SearchUsersResponse {
  users: SafeUser[];
}

export type { SafeUser, ApiResponse };
