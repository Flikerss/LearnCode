import express from 'express'
import bodyParser from 'body-parser'
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const url = process.env.DB_CONNECTION; 
const client = new MongoClient(url); 
await client.connect(); 

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const app = express()
const port = process.env.PORT
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post('/user', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Имя, email и пароль обязательны' });
        }

        const existingUser = await client.db("main").collection("user").findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
        }

        const newUser = { 
            name: name, 
            email: email, 
            password: password,
            progress: "0" 
        };
        
        const result = await client.db("main").collection("user").insertOne(newUser);
        newUser._id = result.insertedId;
        
        const { password: _, ...safeUser } = newUser;
    
        const token = jwt.sign({ userId: newUser._id.toString(), email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ 
            message: `Пользователь '${newUser.name}' успешно зарегистрировался`, 
            user: safeUser,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }

        const user = await client.db("main").collection("user").findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }

        const { password: _, ...safeUser } = user;
        const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ 
            message: `Пользователь '${user.name}' успешно вошел в аккаунт`, 
            user: safeUser,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/user', authenticateToken, async (req, res) => {
    try {
        let users = await client.db("main").collection("user").find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/user/:id/progress/:lessonId', authenticateToken, async (req, res) => {
    const { id: userId, lessonId } = req.params;
    try {
        const lesson = await client.db("main").collection("lessons").findOne({ _id: new ObjectId(lessonId) });
        if (!lesson) {
            return res.status(404).json({ message: 'Урок не найден' });
        }

        const lessonPercentage = lesson.percentage;

        const user = await client.db("main").collection("user").findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const currentProgress = parseInt(user.progress.replace('%', '')) || 0;
        const newProgress = Math.min(currentProgress + lessonPercentage, 100);
        const newProgressString = newProgress + '%';

        const result = await client.db("main").collection("user").updateOne(
            { _id: new ObjectId(userId) },
            { $set: { progress: newProgressString } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        await client.db("main").collection("lessons").updateOne(
            { _id: new ObjectId(lessonId) },
            { $addToSet: { completedBy: new ObjectId(userId) } }
        );

        res.status(200).json({ 
            message: 'Прогресс обновлен', 
            userId: userId, 
            lessonId: lessonId,
            lessonTitle: lesson.title,
            lessonPercentage: lessonPercentage + '%',
            oldProgress: user.progress,
            newProgress: newProgressString
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/user/:id', authenticateToken, async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    try {
        const result = await client.db("main").collection("user").updateOne(
            { _id: new ObjectId(id) },
            { $set: { name: name } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.status(200).json({ message: 'Имя пользователя обновлено', userId: id, newName: name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Listening on ${port}`)
});
