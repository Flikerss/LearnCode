import express from 'express'
import bodyParser from 'body-parser'
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DB_CONNECTION; 
const client = new MongoClient(url); 
await client.connect(); 

const app = express()
const port = process.env.PORT
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.post('/user', async (req, res) => {
    const { name, email, progress } = req.body
    try {
        let newUser = { name: name, email: email, progress: progress};
        await client.db("main").collection("user").insertOne(newUser);
        res.status(201).json({ message: `Пользователь '${newUser.name}' успешно зарегистрировался`, user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})    

app.get('/user', async (req, res) => {
    try {
        let users = await client.db("main").collection("user").find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Listening on ${port}`)
})
