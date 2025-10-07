/**
 * Simple logger utility that respects NODE_ENV
 * In production, only errors are logged
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = {
  /**
   * Log informational messages (development only)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Log errors (always logged, but sanitized in production)
   */
  error: (...args) => {
    if (isDevelopment) {
      console.error('[ERROR]', ...args);
    } else {
      // In production, log errors but without sensitive details
      // You should integrate with a proper logging service (e.g., Sentry, LogRocket)
      console.error('[ERROR]', args[0]); // Only log the error message, not full details
    }
  },

  /**
   * Log debug messages (development only)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
};
