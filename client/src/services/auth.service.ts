import api from "@/lib/api";

export const loginApi = (data: { email: string; password: string }) => {
  return api.post("auth/login", data);
};

export const signupApi = (data: {
  email: string;
  username: string;
  password: string;
  firstname: string;
  lastname?: string;
}) => {
  return api.post("auth/signup", data);
};

export const refreshTokenApi = () => {
  // Uses httpOnly cookie automatically — no body needed
  return api.post("auth/refresh-token", {}, { withCredentials: true });
};

export const logoutService = () => {
  return api.post("auth/logout");
};