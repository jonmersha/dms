/**
 * Global centralized error-handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error("[CENTRAL-ERROR-MIDDLEWARE]", err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || "An unexpected internal server error occurred",
    timestamp: new Date().toISOString()
  });
}
