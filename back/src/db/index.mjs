import { MongoClient } from "mongodb";
import { config } from "../config/index.mjs";

export const client = new MongoClient(config.db.url, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});

export async function connectDb() {
  try {
    await client.connect();
    console.log("Успешное подключение к MongoDB");
  } catch (error) {
    console.error("Ошибка подключения к MongoDB:", error);
    throw error;
  }
}

export default client;