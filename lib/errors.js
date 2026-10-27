'use strict';
/** Custom error carrying an HTTP status code and machine-readable code. */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'E_APP') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, AppError);
  }
}
module.exports = { AppError };
