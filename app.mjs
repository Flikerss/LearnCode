import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const url = process.env.DB_CONNECTION;
export const client = new MongoClient(url);
await client.connect();

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

import userRoutes from './src/routes/user.mjs';
app.use('/user', userRoutes);

import lessonsRoutesFactory from './src/routes/lessons.mjs';
app.use('/lessons', lessonsRoutesFactory(client, JUDGE0_URL, JUDGE0_API_KEY));

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
