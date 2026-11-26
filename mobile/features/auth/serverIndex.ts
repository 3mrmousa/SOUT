import { server } from "@/lib/server";
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

export const authServer = {
  registerRequest: (data: RegisterInput) =>
    server<ApiResponse<{ email: string }>>("/auth/register/request", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyRegister: (data: VerifyRegisterInput) =>
    server<ApiResponse<AuthSessionData>>("/auth/register/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginInput) =>
    server<ApiResponse<AuthSessionData>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refreshAccessToken: () =>
    server<ApiResponse<RefreshTokenData>>("/auth/refresh", {
      method: "POST",
    }),

  logout: () =>
    server<ApiResponse<null>>("/auth/logout", {
      method: "POST",
    }),

  logoutAll: () =>
    server<ApiResponse<null>>("/auth/logout-all", {
      method: "POST",
    }),

  requestForgotPassword: (data: ForgotPasswordInput) =>
    server<ApiResponse<{ email: string }>>("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyForgotPassword: (data: VerifyForgotPasswordInput) =>
    server<ApiResponse<{ email: string }>>("/auth/password/forgot/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: (data: ResetPasswordInput) =>
    server<ApiResponse<null>>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () =>
    server<ApiResponse<{ user: SafeUser }>>("/auth/me", {
      method: "GET",
    }),
};

export default authServer;
