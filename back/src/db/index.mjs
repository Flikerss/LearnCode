import { MongoClient } from "mongodb";
import { config } from "../config/index.mjs";

export const client = new MongoClient(config.db.url);

export async function connectDb() {
  await client.connect();
  console.log("Успешное подключение к MongoDB");
}

export default client;
