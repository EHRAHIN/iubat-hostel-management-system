class ApiError extends Error {
  constructor(statusCode = 500, message = 'Internal Server Error', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
module.exports.default = ApiError;
