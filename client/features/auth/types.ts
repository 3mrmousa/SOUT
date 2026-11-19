export interface SafeUser {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string | null;
  image?: {
    secure_url: string;
    public_id: string;
  } | null;
  profileImage?: {
    secure_url: string;
    public_id: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
  name: string;
}

export interface VerifyRegisterInput {
  email: string;
  otp: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyForgotPasswordInput {
  email: string;
  otp: string;
}

export interface ResetPasswordInput {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  status: string;
  message?: string;
  data?: T;
}

export interface AuthSessionData {
  user: SafeUser;
  token?: string;
}

export interface RefreshTokenData {
  user: SafeUser;
}
