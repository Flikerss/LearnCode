import express from "express";
import cors from 'cors';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";

import { config } from "./src/config/index.mjs";
import { client, connectDb } from "./src/db/index.mjs";
import errorHandler from "./src/middlewares/errorHandler.mjs";
import requestId from "./src/middlewares/requestId.mjs";
import { securityHeaders, jsonBodyLimit } from "./src/middlewares/security.mjs";
import rateLimit from "./src/middlewares/rateLimit.mjs";

import userRoutesFactory from "./src/routes/user.mjs";
import lessonsRoutesFactory from "./src/routes/lessons.mjs";
import submissionsRoutesFactory from "./src/routes/submissions.mjs";
import achievementsRoutesFactory from "./src/routes/achievements.mjs";
import walletRoutesFactory from "./src/routes/wallet.mjs";
import contentRoutesFactory from "./src/routes/content.mjs";
import feedbackRoutesFactory from "./src/routes/feedback.mjs";

const app = express();

app.use('/videos', express.static('public/videos'));

try {
  await connectDb();
} catch (error) {
  console.error("Ошибка подключения к MongoDB:", error);
  process.exit(1);
}

app.use(requestId);
app.use(securityHeaders);
app.use(compression());
app.use(rateLimit);
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(cookieParser());
app.use(bodyParser.json({ limit: jsonBodyLimit }));

app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (!res.getHeader("Content-Type")) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    return originalJson.call(this, data);
  };
  next();
});

app.use("/user", userRoutesFactory(client));
app.use("/lessons", lessonsRoutesFactory(client, config.judge0.url, config.judge0.apiKey));
app.use("/submissions", submissionsRoutesFactory(client, config.judge0.url, config.judge0.apiKey));
app.use("/achievements", achievementsRoutesFactory(client));
app.use("/wallet", walletRoutesFactory(client));
app.use("/content", contentRoutesFactory(client));
app.use("/feedback", feedbackRoutesFactory(client));

app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден", code: "NOT_FOUND" });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Сервер запущен на порту ${config.port}`);
  console.log(`Окружение: ${config.env}`);
});