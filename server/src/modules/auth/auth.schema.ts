import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .toLowerCase();

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .regex(
    /^[a-z0-9_]+$/,
    "Username must be lowercase and can only contain letters, numbers, and underscores",
  );

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(6, "Password must be at least 6 characters"),
    username: usernameSchema,
    name: z.string().trim().min(1, "Name is required"),
  }),
});

export const verifyRegisterSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z.string().trim().min(6, "OTP must be 6 digits"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z
      .string()
      .trim()
      .min(1, "Username or email is required")
      .transform((val) => (val.includes("@") ? val.toLowerCase() : val)),
    password: z.string().min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const verifyForgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z.string().trim().min(6, "OTP must be 6 digits"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type VerifyRegisterInput = z.infer<typeof verifyRegisterSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type VerifyForgotPasswordInput = z.infer<typeof verifyForgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
