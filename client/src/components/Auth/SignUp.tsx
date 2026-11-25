import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { signupApi } from "@/services/auth.service";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Loader2 } from "lucide-react";
import axios from "axios";

type SignUpFormData = {
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
};

const inputClass =
  "block w-full rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-colors duration-200 disabled:opacity-60";

export default function SignUp() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: "",
      firstname: "",
      lastname: "",
      username: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Single flag to lock the whole UI
  const isBusy = isSubmitting || isGoogleLoading;

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const response = await signupApi(data);

      if (response.data) {
        toast.success("Account created successfully!");
        navigate("/login");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Signup failed. Please try again."
        );
      } else {
        toast.error("Signup failed. Please try again.");
      }
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",

    onSuccess: async (codeResponse) => {
      // User clicked "Continue" in Google's popup -> show loader right away
      setIsGoogleLoading(true);
      try {
        const res = await api.post("/auth/google", {
          code: codeResponse.code,
        });

        if (res.data.success) {
          login({
            user: res.data.user,
            token: res.data.token,
            workspace: res.data.currentWorkspace,
          });
          toast.success("Successfully signed up with Google!");
          navigate("/request");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Google sign up failed."
          );
        } else {
          toast.error("Google sign up failed.");
        }
      } finally {
        setIsGoogleLoading(false);
      }
    },

    onError: () => {
      setIsGoogleLoading(false);
      toast.error("Google sign up failed.");
    },

    // Fires when the user closes the popup / popup is blocked
    onNonOAuthError: () => {
      setIsGoogleLoading(false);
    },
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Ambient gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-purple-400/30 dark:bg-purple-600/20 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-96 w-96 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-purple-300/20 dark:bg-blue-500/10 blur-3xl" />
      </div>

      {/* Top bar: logo + theme toggle */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link to="/" className="flex items-center">
          <img
            src="/autoapi-web-logo.svg"
            alt="AutoAPI"
            className="h-5 sm:h-6 md:h-6 lg:h-7 xl:h-8 w-auto"
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Start building with AutoAPI in minutes
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-120">
          <div
            aria-busy={isGoogleLoading}
            className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl shadow-2xl px-6 py-10 sm:px-10"
          >
            {/* Loading overlay for Google sign-up */}
            {isGoogleLoading && (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm animate-in fade-in duration-200"
              >
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Setting up your account with Google...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This may take a few seconds
                </p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isBusy} className="space-y-5 border-0 p-0 m-0 min-w-0">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email", { required: "Email is required" })}
                      className={inputClass}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* First name */}
                  <div>
                    <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First name
                    </label>
                    <div className="mt-2">
                      <input
                        id="firstname"
                        type="text"
                        autoComplete="given-name"
                        {...register("firstname", { required: "First name is required" })}
                        className={inputClass}
                      />
                      {errors.firstname && (
                        <p className="mt-1 text-sm text-red-500">{errors.firstname.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Last name */}
                  <div>
                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last name
                    </label>
                    <div className="mt-2">
                      <input
                        id="lastname"
                        type="text"
                        autoComplete="family-name"
                        {...register("lastname")}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <div className="mt-2">
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      {...register("username", { required: "Username is required" })}
                      className={inputClass}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={inputClass}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Signing up..." : "Sign up"}
                  </button>
                </div>
              </fieldset>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-x-4">
              <div className="w-full flex-1 border-t border-gray-200 dark:border-gray-700" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-nowrap">
                Or continue with
              </p>
              <div className="w-full flex-1 border-t border-gray-200 dark:border-gray-700" />
            </div>

            {/* Social Buttons */}
            <div className="mt-6 gap-4">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => googleLogin()}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
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
                )}
                <span>{isGoogleLoading ? "Signing up with Google..." : "Google"}</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}