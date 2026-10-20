/**
 * Custom Error Class for Application-specific API Errors
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request", details = null) {
    return new ApiError(400, message, details);
  }

  static notFound(message = "Resource Not Found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource Conflict") {
    return new ApiError(409, message);
  }

  static internal(message = "Internal Server Error") {
    return new ApiError(500, message);
  }
}

/**
 * 404 Route Not Found Middleware
 * Intercepts requests to undefined routes and forwards a 404 ApiError to the global handler.
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Global Error Handler Middleware
 * Centralized error handler that intercepts all errors and sends standardized JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details || null;

  // Handle Express JSON body parser syntax errors (malformed JSON payload)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload in request body";
    details = err.message;
  }

  // Hide internal stack trace details in production, show in development if needed
  const response = {
    success: false,
    error: {
      statusCode,
      message,
      ...(details ? { details } : {})
    },
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV === "development" && statusCode === 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler
};
