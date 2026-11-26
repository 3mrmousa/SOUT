import { client } from "@/lib/client";
import type {
  RegisterInput,
  VerifyRegisterInput,
  LoginInput,
  ForgotPasswordInput,
  VerifyForgotPasswordInput,
  ResetPasswordInput,
  ApiResponse,
  AuthSessionData,
  RefreshTokenData,
  SafeUser,
} from "./types";

export * from "./types";

export const authClient = {
  registerRequest: (data: RegisterInput) =>
    client<ApiResponse<{ email: string }>>("/auth/register/request", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyRegister: (data: VerifyRegisterInput) =>
    client<ApiResponse<AuthSessionData>>("/auth/register/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginInput) =>
    client<ApiResponse<AuthSessionData>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refreshAccessToken: () =>
    client<ApiResponse<RefreshTokenData>>("/auth/refresh", {
      method: "POST",
    }),

  logout: () =>
    client<ApiResponse<null>>("/auth/logout", {
      method: "POST",
    }),

  logoutAll: () =>
    client<ApiResponse<null>>("/auth/logout-all", {
      method: "POST",
    }),

  requestForgotPassword: (data: ForgotPasswordInput) =>
    client<ApiResponse<{ email: string }>>("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyForgotPassword: (data: VerifyForgotPasswordInput) =>
    client<ApiResponse<{ email: string }>>("/auth/password/forgot/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: (data: ResetPasswordInput) =>
    client<ApiResponse<null>>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () =>
    client<ApiResponse<{ user: SafeUser }>>("/auth/me", {
      method: "GET",
    }),
};

export default authClient;
