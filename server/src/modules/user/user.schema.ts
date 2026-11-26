import { z } from "zod";

const emailSchema = (message: string) =>
  z.string().trim().email(message).toLowerCase();

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .regex(
    /^[a-z0-9_]+$/,
    "Username must be lowercase and can only contain letters, numbers, and underscores",
  );

export const searchUserSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1, "Search query is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, "Name must be at least 3 characters").optional(),
    bio: z.string().max(160, "Bio must be at most 160 characters").optional(),
  }),
});

export const checkUsernameSchema = z.object({
  query: z.object({
    username: usernameSchema,
  }),
});

export const changeUsernameSchema = z.object({
  body: z.object({
    username: usernameSchema,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
});

export const changeEmailRequestSchema = z.object({
  body: z.object({
    currentEmail: emailSchema("Invalid current email address"),
    newEmail: emailSchema("Invalid new email address"),
  }),
});

export const verifyCurrentMailSchema = z.object({
  body: z.object({
    currentEmail: emailSchema("Invalid current email address"),
    otp: z.string().trim().min(6, "OTP must be 6 digits"),
  }),
});

export const changeEmailSchema = z.object({
  body: z.object({
    currentEmail: emailSchema("Invalid current email address"),
    otp: z.string().trim().min(6, "OTP must be 6 digits"),
  }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required to delete your account"),
  }),
});

export type SearchUserQuery = z.infer<typeof searchUserSchema>["query"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type CheckUsernameQuery = z.infer<typeof checkUsernameSchema>["query"];
export type ChangeUsernameInput = z.infer<typeof changeUsernameSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
export type GetUserByIdParams = z.infer<typeof getUserByIdSchema>["params"];
export type ChangeEmailRequestInput = z.infer<
  typeof changeEmailRequestSchema
>["body"];
export type VerifyCurrentMailInput = z.infer<
  typeof verifyCurrentMailSchema
>["body"];
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>["body"];
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>["body"];
