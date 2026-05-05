class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global Express error handler (4-arg signature required)
const globalErrorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ status: "fail", message: `${field} already exists` });
  }
  // Mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({ status: "fail", message: "Invalid ID" });
  }
  // JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ status: "fail", message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ status: "fail", message: "Token expired, please log in again" });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({ status: err.status, message: err.message });
  }

  console.error("UNEXPECTED ERROR:", err);
  res.status(500).json({ status: "error", message: "Something went wrong" });
};

module.exports = { AppError, globalErrorHandler };
