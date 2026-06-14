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

export const logoutService = () => {
  // console.log('service line 22');
  return api.post("auth/logout");
};