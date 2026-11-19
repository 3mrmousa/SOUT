import { client } from "@/lib/client";
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

export const userClient = {
  checkUsername: (username: string) =>
    client<ApiResponse<CheckUsernameResponse>>(
      `/users/check-username?username=${encodeURIComponent(username)}`,
      { method: "GET" },
    ),

  searchUsers: (query: string) =>
    client<ApiResponse<SearchUsersResponse>>(
      `/users/search?q=${encodeURIComponent(query)}`,
      { method: "GET" },
    ),

  getUserById: (id: string) =>
    client<ApiResponse<{ user: SafeUser }>>(`/users/${id}`, {
      method: "GET",
    }),

  updateProfile: (data: UpdateProfileInput) =>
    client<ApiResponse<{ user: SafeUser }>>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateProfileImage: (formData: FormData) =>
    client<ApiResponse<{ user: SafeUser }>>("/users/profile/image", {
      method: "PATCH",
      body: formData,
    }),

  removeProfileImage: () =>
    client<ApiResponse<{ user: SafeUser }>>("/users/profile/image", {
      method: "DELETE",
    }),

  changeUsername: (data: ChangeUsernameInput) =>
    client<ApiResponse<{ user: SafeUser }>>("/users/profile/username", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordInput) =>
    client<ApiResponse<null>>("/users/profile/password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changeEmailRequest: (data: ChangeEmailRequestInput) =>
    client<ApiResponse<{ currentEmail: string; newEmail: string }>>(
      "/users/profile/email/request",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  verifyCurrentMail: (data: VerifyCurrentMailInput) =>
    client<ApiResponse<null>>("/users/profile/email/verify-current", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  changeEmail: (data: ChangeEmailInput) =>
    client<ApiResponse<{ user: SafeUser }>>("/users/profile/email/change", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export default userClient;
