import dotenv from "dotenv";

dotenv.config();

const required = ["DB_CONNECTION"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Ошибка: отсутствуют переменные окружения: ${missing.join(", ")}`);
  process.exit(1);
}

export const DB_NAME = "main";

export const config = Object.freeze({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  clientUrl: process.env.CLIENT_URL,
  db: {
    url: process.env.DB_CONNECTION,
    name: DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpires: "7d",
    refreshExpires: "30d",
  },
  judge0: {
    url: process.env.JUDGE0_URL,
  },
  security: {
    saltRounds: 10,
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000,
    refreshCookieMaxAge: 30 * 24 * 60 * 60 * 1000,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 200,
  },
});

export default config;
