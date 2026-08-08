import api from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PasswordStatusResponse {
  hasPassword: boolean;
}

export interface CreatePasswordPayload {
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  firstname?: string;
  lastname?: string;
  username?: string;
}

export interface UpdateEmailPayload {
  newEmail: string;
  password: string;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/** Check whether the current user has a local password set */
export const getPasswordStatus = () =>
  api.get<PasswordStatusResponse>("profile/password-status");

/** Create a password for a Google-only account */
export const createPassword = (data: CreatePasswordPayload) =>
  api.post("profile/create-password", data);

/** Change password for a user who already has one */
export const changePassword = (data: ChangePasswordPayload) =>
  api.put("profile/change-password", data);

/** Update profile fields (firstname, lastname, username) */
export const updateProfile = (data: UpdateProfilePayload) =>
  api.put("profile/update-profile", data);

/** Update email (requires current password for verification) */
export const updateEmail = (data: UpdateEmailPayload) =>
  api.put("profile/update-email", data);
