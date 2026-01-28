export default class AppError extends Error {
  constructor(statusCode, message, code = "APP_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, code) {
    return new AppError(400, message, code);
  }

  static unauthorized(message = "Необходима авторизация", code = "UNAUTHORIZED") {
    return new AppError(401, message, code);
  }

  static forbidden(message = "Доступ запрещён", code = "FORBIDDEN") {
    return new AppError(403, message, code);
  }

  static notFound(message = "Ресурс не найден", code = "NOT_FOUND") {
    return new AppError(404, message, code);
  }

  static conflict(message, code = "CONFLICT") {
    return new AppError(409, message, code);
  }

  static internal(message = "Внутренняя ошибка сервера", code = "INTERNAL") {
    return new AppError(500, message, code);
  }
}
