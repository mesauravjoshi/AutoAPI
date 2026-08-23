import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { loginApi } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";
import Checkbox from "@/components/UI/Common/Checkbox";
import { Sun, Moon } from "lucide-react";

type LoginFormData = {
  email: string;
  password: string;
};

const LogIn = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const res = await api.post("/auth/google", {
          code: codeResponse.code,
        });

        if (res.data.success) {
          login({
            user: res.data.user,
            token: res.data.token,
            workspace: res.data.workspace,
          });
          toast.success("Successfully logged in with Google!");
          navigate("/request");
        }
      } catch (error: any) {
        console.error(error);
        toast.error("Google login failed.");
      }
    },
    onError: () => {
      console.log("Google Login Failed");
      toast.error("Google login failed.");
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginApi(data);

      if (response.status === 200) {
        login({
          user: response.data.user,
          token: response.data.token,
          workspace: response.data.workspace,
        });
        toast.success("Successfully logged in!");
        navigate("/request");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || error?.response?.data?.error || "Login failed. Please try again.");
    } finally {
      reset();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Ambient gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-purple-400/30 dark:bg-purple-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-300/20 dark:bg-purple-500/10 blur-3xl" />
      </div>

      {/* Top bar: logo + theme toggle */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link to="/" className="flex items-center">
          <img
            src="/autoapi-web-logo.svg"
            alt="AutoAPI"
            className="h-5 sm:h-6 md:h-6 lg:h-7 xl:h-8 w-auto "
          />
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5 text-gray-300" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Sign in to continue to your workspace
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-120">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl shadow-2xl px-6 py-10 sm:px-10">
            <form method="POST" className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    autoComplete="email"
                    {...register("email", {
                      required: "Email is required",
                    })}
                    className="block w-full rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-colors duration-200"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className="block w-full rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-colors duration-200"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onChange={setRememberMe}
                  />
                  <label htmlFor="remember-me" className="block text-sm text-gray-600 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="#"
                    className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <div>
              <div className="mt-8 flex items-center gap-x-4">
                <div className="w-full flex-1 border-t border-gray-200 dark:border-gray-700" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-nowrap">
                  Or continue with
                </p>
                <div className="w-full flex-1 border-t border-gray-200 dark:border-gray-700" />
              </div>

              <div className="mt-6 gap-4">
                <div
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  onClick={() => googleLogin()}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                      fill="#34A853"
                    />
                  </svg>
                  <span>Google</span>
                </div>

              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn;