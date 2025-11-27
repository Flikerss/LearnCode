import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const url = process.env.DB_CONNECTION;
if (!url) {
  console.error("Ошибка: DB_CONNECTION не установлена в переменных окружения");
  process.exit(1);
}

export const client = new MongoClient(url);

try {
  await client.connect();
  console.log("Успешное подключение к MongoDB");
} catch (error) {
  console.error("Ошибка подключения к MongoDB:", error);
  process.exit(1);
}

const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const app = express();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());

import userRoutes from "./src/routes/user.mjs";
app.use("/user", userRoutes);

import lessonsRoutesFactory from "./src/routes/lessons.mjs";
app.use("/lessons", lessonsRoutesFactory(client, JUDGE0_URL, JUDGE0_API_KEY));

import submissionsRoutesFactory from "./src/routes/submissions.mjs";
app.use("/submissions", submissionsRoutesFactory(client, JUDGE0_URL, JUDGE0_API_KEY));

import achievementsRoutesFactory from "./src/routes/achievements.mjs";
app.use("/achievements", achievementsRoutesFactory(client));

import walletRoutesFactory from "./src/routes/wallet.mjs";
app.use("/wallet", walletRoutesFactory(client));

import contentRoutesFactory from "./src/routes/content.mjs";
app.use("/content", contentRoutesFactory(client));

import feedbackRoutesFactory from "./src/routes/feedback.mjs";
app.use("/feedback", feedbackRoutesFactory(client));

app.use((err, req, res, next) => {
  console.error("Ошибка сервера:", err);
  res.status(err.status || 500).json({
    error: err.message || "Внутренняя ошибка сервера",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`База данных: ${url ? "подключена" : "не настроена"}`);
});
