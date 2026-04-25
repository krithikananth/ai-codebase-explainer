// ──────────────────────────────────────────────────────────────
// middleware/errorMiddleware.js — Global error handling
// Catches unhandled errors and 404s, returns consistent JSON
// ──────────────────────────────────────────────────────────────

/**
 * 404 handler — catches requests to undefined routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler — formats all errors as JSON
 * In development, includes stack trace for debugging
 */
export const errorHandler = (err, _req, res, _next) => {
  // Default to 500 if status is still 200 (unhandled throw)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // Include stack trace only in development
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};