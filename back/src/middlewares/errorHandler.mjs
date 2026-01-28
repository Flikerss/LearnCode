import AppError from "../errors/AppError.mjs";
import { config } from "../config/index.mjs";

const isDev = config.env === "development";

export default function errorHandler(err, req, res, next) {
  const requestId = req.id || req.headers["x-request-id"] || "-";

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.code && { code: err.code }),
      ...(isDev && err.stack && { stack: err.stack }),
    });
    return;
  }

  if (err.name === "MongoError" || err.name === "MongoServerError") {
    const status = err.code === 11000 ? 409 : 400;
    const message = err.code === 11000 ? "Дубликат записи" : "Ошибка данных";
    res.status(status).json({
      error: message,
      code: "MONGO_ERROR",
      ...(isDev && { detail: err.message }),
    });
    return;
  }

  if (err.name === "BSONTypeError" || (err.message && err.message.includes("ObjectId"))) {
    res.status(400).json({
      error: "Некорректный идентификатор",
      code: "INVALID_ID",
    });
    return;
  }

  const status = err.status || err.statusCode || 500;
  const fallbackMessage = typeof err.message === "string" ? err.message : "Внутренняя ошибка сервера";

  if (status >= 400 && status < 500) {
    res.status(status).json({
      error: fallbackMessage,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  console.error(`[${requestId}] Server error:`, err);
  res.status(500).json({
    error: isDev ? fallbackMessage : "Внутренняя ошибка сервера",
    code: "INTERNAL",
    ...(isDev && err.stack && { stack: err.stack }),
  });
}
