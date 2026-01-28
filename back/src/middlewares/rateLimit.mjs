import rateLimit from "express-rate-limit";
import { config } from "../config/index.mjs";

export default rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: "Слишком много запросов, попробуйте позже",
    code: "RATE_LIMIT",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
