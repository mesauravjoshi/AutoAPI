import axios from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // send cookies (refresh token) on every request
});

// ─── Refresh Token Queue ──────────────────────────────────────────────────────
// Prevents multiple concurrent 401s from each triggering their own refresh call.
// All requests that 401 while a refresh is in-flight are queued and resolved
// together once the refresh completes.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("AutoAPIAuthToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const is401 = error.response?.status === 401;
    const isRefreshRoute =
      originalRequest.url?.includes("auth/refresh-token") ||
      originalRequest.url?.includes("auth/login");

    // Don't try to refresh on login/refresh routes — hard logout instead
    if (is401 && isRefreshRoute) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // Retry once with a new access token on 401
    if (is401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>).Authorization =
                `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post(
          "auth/refresh-token",
          {},
          { withCredentials: true }
        );

        const newToken: string = data.token;
        localStorage.setItem("AutoAPIAuthToken", newToken);

        // Update auth header for future requests
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        // Retry the original request with the new token
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization =
            `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clearAuthAndRedirect() {
  localStorage.removeItem("AutoAPIAuthToken");
  localStorage.removeItem("AutoAPIUserData");
  localStorage.removeItem("AutoAPICurrentWorkspace");
  window.location.href = "/login";
}

export default api;