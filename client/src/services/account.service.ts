import api from "@/lib/api";

export interface DeleteAccountPayload {
  email: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

/**
 * Permanently delete the user's account and all associated data.
 * Calls /account/delete with confirmation email in body.
 */
export const deleteAccountApi = (data: DeleteAccountPayload) => {
  return api.delete<DeleteAccountResponse>("account/delete", {
    data,
    skipAuthRefresh: true,
  });
};
