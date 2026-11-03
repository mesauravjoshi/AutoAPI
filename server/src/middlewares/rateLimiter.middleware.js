import { rateLimit, ipKeyGenerator } from "express-rate-limit";

/**
 * Key generator that uses the authenticated user's ID when available,
 * falling back to the client IP address (normalized for IPv6 subnet security).
 *
 * @param {import('express').Request} req
 * @returns {string} Unique rate-limit identifier
 */
export const getRateLimitKey = (req) => {
  // If user is authenticated, use authenticated user ID
  const userId = req.user?._id || req.user?.id;
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to client IP address
  const forwarded = req.headers && req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : null;

  const clientIp = req.ip || forwardedIp || req.socket?.remoteAddress || "127.0.0.1";

  return `ip:${ipKeyGenerator(clientIp) || clientIp}`;
};

/**
 * Custom response handler for rate-limit breaches.
 * Returns a standardized JSON response with retry-after metadata.
 *
 * @param {string} category
 * @returns {Function} Express rate-limit handler
 */
const defaultRateLimitHandler = (category) => (req, res, next, options) => {
  const retryAfterSeconds = req.rateLimit?.resetTime
    ? Math.max(0, Math.ceil((new Date(req.rateLimit.resetTime).getTime() - Date.now()) / 1000))
    : Math.ceil(options.windowMs / 1000);

  res.status(options.statusCode).json({
    success: false,
    status: options.statusCode,
    category,
    message: typeof options.message === "string"
      ? options.message
      : `Too many requests for ${category}. Please try again later.`,
    retryAfter: retryAfterSeconds,
  });
};

/**
 * Factory function to create tailored rate limiters.
 *
 * @param {Object} options
 * @param {number} [options.windowMs=60000] - Time window in milliseconds
 * @param {number} [options.limit=30] - Max requests allowed per window
 * @param {string} [options.category="General"] - Category label for response & logging
 * @param {string} [options.message] - Custom error message
 * @param {Function} [options.keyGenerator=getRateLimitKey] - Key generator function
 * @returns {import('express').RequestHandler}
 */
export const createRateLimiter = ({
  windowMs = 60 * 1000,
  limit = 30,
  category = "General",
  message,
  keyGenerator = getRateLimitKey,
  skipSuccessfulRequests = false,
  skipFailedRequests = false,
  skip,
  ...customOptions
} = {}) => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    validate: { trustProxy: false },
    keyGenerator,
    skipSuccessfulRequests,
    skipFailedRequests,
    ...(skip ? { skip } : {}),
    handler: defaultRateLimitHandler(category),
    message: message || `Too many requests for ${category}. Please try again later.`,
    ...customOptions,
  });
};

/* ==========================================================================
   STRICT TIER: Authentication and Password-Related APIs
   ========================================================================== */

/**
 * Login / Register Rate Limiter
 * Limit: 5 requests / 1 minute
 */
export const loginRegisterLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  category: "Login / Register",
  message: "Too many authentication attempts. Please try again after 1 minute.",
});
export const authLimiter = loginRegisterLimiter;

/**
 * Forgot / Reset Password Rate Limiter
 * Limit: 3 requests / 5 minutes
 */
export const passwordResetLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  category: "Forgot / Reset Password",
  message: "Too many password reset attempts. Please try again after 5 minutes.",
});
export const forgotResetPasswordLimiter = passwordResetLimiter;

/**
 * Google OAuth Rate Limiter
 * Limit: 5 requests / 1 minute
 */
export const googleOAuthLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  category: "Google OAuth",
  message: "Too many Google OAuth sign-in requests. Please wait a minute before retrying.",
});

/**
 * Refresh Token Rate Limiter
 * Limit: 10 requests / 1 minute
 */
export const refreshTokenLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 10,
  category: "Refresh Token",
  message: "Too many token refresh requests. Please try again later.",
});

/**
 * General Strict Tier Preset
 * Limit: 5 requests / 1 minute
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  category: "Strict Security Action",
  message: "Rate limit exceeded for strict action. Please try again after 1 minute.",
});

/* ==========================================================================
   MODERATE TIER: Write APIs, Search, and API Execution
   ========================================================================== */

/**
 * Create / Update / Delete (Write APIs) Rate Limiter
 * Limit: 30 requests / 1 minute
 */
export const createUpdateDeleteLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 30,
  category: "Create / Update / Delete",
  message: "Too many write requests. Please slow down and try again.",
});
export const writeLimiter = createUpdateDeleteLimiter;

/**
 * API Execution (Send Request) Rate Limiter
 * Limit: 30 requests / 1 minute
 */
export const apiExecutionLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 30,
  category: "API Execution (Send Request)",
  message: "API execution rate limit reached (30 requests/min). Please wait before sending more requests.",
});

/**
 * Request History Rate Limiter
 * Limit: 60 requests / 1 minute
 */
export const requestHistoryLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 60,
  category: "Request History",
  message: "Too many history requests. Please wait a moment before trying again.",
});
export const historyLimiter = requestHistoryLimiter;

/**
 * Search APIs Rate Limiter
 * Limit: 30 requests / 1 minute
 */
export const searchLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 30,
  category: "Search APIs",
  message: "Too many search requests. Please slow down your search queries.",
});

/**
 * General Moderate Tier Preset
 * Limit: 30 requests / 1 minute
 */
export const moderateRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 30,
  category: "Moderate Operation",
  message: "Moderate operation rate limit exceeded. Please try again later.",
});

/* ==========================================================================
   RELAXED TIER: Read-Only APIs
   ========================================================================== */

/**
 * Read APIs (GET) Rate Limiter
 * Limit: 100 requests / 1 minute
 */
export const readLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  category: "Read APIs (GET)",
  message: "Too many read requests. Please try again after 1 minute.",
});

/**
 * General Relaxed Tier Preset
 * Limit: 100 requests / 1 minute
 */
export const relaxedRateLimiter = readLimiter;

/* ==========================================================================
   DEFAULT EXPORT
   ========================================================================== */

export default {
  getRateLimitKey,
  createRateLimiter,
  // Strict Tier
  loginRegisterLimiter,
  authLimiter,
  passwordResetLimiter,
  forgotResetPasswordLimiter,
  googleOAuthLimiter,
  refreshTokenLimiter,
  strictRateLimiter,
  // Moderate Tier
  createUpdateDeleteLimiter,
  writeLimiter,
  apiExecutionLimiter,
  requestHistoryLimiter,
  historyLimiter,
  searchLimiter,
  moderateRateLimiter,
  // Relaxed Tier
  readLimiter,
  relaxedRateLimiter,
};
