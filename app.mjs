import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const url = process.env.DB_CONNECTION;
export const client = new MongoClient(url);
await client.connect();

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

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
