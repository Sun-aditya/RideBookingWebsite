class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = () => new AppError("Resource not found", 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  return new AppError(`Duplicate field value: ${field} already exists`, 400);
};

const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors || {}).map((item) => item.message);
  return new AppError(messages.join(", "), 400);
};

const handleJWTError = () => new AppError("Invalid token, please login again", 401);

const handleJWTExpiredError = () => new AppError("Token expired, please login again", 401);

const globalErrorHandler = (err, req, res, next) => {
  let error = err;
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Something went wrong";

  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = {
  AppError,
  globalErrorHandler,
};
