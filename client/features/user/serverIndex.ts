import { server } from "@/lib/server";
import type {
  UpdateProfileInput,
  CheckUsernameResponse,
  ChangeUsernameInput,
  ChangePasswordInput,
  ChangeEmailRequestInput,
  VerifyCurrentMailInput,
  ChangeEmailInput,
  SearchUsersResponse,
  SafeUser,
  ApiResponse,
} from "./types";

export * from "./types";

export const userServer = {
  checkUsername: (username: string) =>
    server<ApiResponse<CheckUsernameResponse>>(
      `/users/check-username?username=${encodeURIComponent(username)}`,
      { method: "GET" },
    ),

  searchUsers: (query: string) =>
    server<ApiResponse<SearchUsersResponse>>(
      `/users/search?q=${encodeURIComponent(query)}`,
      { method: "GET" },
    ),

  getUserById: (id: string) =>
    server<ApiResponse<{ user: SafeUser }>>(`/users/${id}`, {
      method: "GET",
    }),

  updateProfile: (data: UpdateProfileInput) =>
    server<ApiResponse<{ user: SafeUser }>>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateProfileImage: (formData: FormData) =>
    server<ApiResponse<{ user: SafeUser }>>("/users/profile/image", {
      method: "PATCH",
      body: formData,
    }),

  removeProfileImage: () =>
    server<ApiResponse<{ user: SafeUser }>>("/users/profile/image", {
      method: "DELETE",
    }),

  changeUsername: (data: ChangeUsernameInput) =>
    server<ApiResponse<{ user: SafeUser }>>("/users/profile/username", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordInput) =>
    server<ApiResponse<null>>("/users/profile/password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changeEmailRequest: (data: ChangeEmailRequestInput) =>
    server<ApiResponse<{ currentEmail: string; newEmail: string }>>(
      "/users/profile/email/request",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  verifyCurrentMail: (data: VerifyCurrentMailInput) =>
    server<ApiResponse<null>>("/users/profile/email/verify-current", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  changeEmail: (data: ChangeEmailInput) =>
    server<ApiResponse<{ user: SafeUser }>>("/users/profile/email/change", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export default userServer;
