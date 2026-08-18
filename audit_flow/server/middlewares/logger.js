/**
 * Request logging middleware for API calls
 */
export function loggerMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(`[VERIFY-API] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} in ${elapsed}ms`);
  });
  next();
}
