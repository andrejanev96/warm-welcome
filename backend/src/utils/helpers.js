/**
 * Standard API response formatter
 */
export const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

/**
 * Standard error response formatter
 */
export const errorResponse = (message, errors = null) => ({
  success: false,
  message,
  ...(errors && { errors }),
});

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
