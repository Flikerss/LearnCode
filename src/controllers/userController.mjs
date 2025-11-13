import { client } from '../../app.mjs'; 
import { ObjectId } from 'mongodb'; 

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const PROGRESS_INCREMENT = 4;

export default {
    async register(req, res) {
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
                name, 
                email,
                password,
                progress: 0
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
    },

    async login(req, res) {
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
    },

    async getAll(req, res) {
        try {
            let users = await client.db("main").collection("user").find({}).toArray();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateProgress(req, res) {
        const { id: userId, lessonId } = req.params;
        try {
            const lesson = await client.db("main").collection("lessons").findOne({ _id: new ObjectId(lessonId) });
            if (!lesson) {
                return res.status(404).json({ message: 'Урок не найден' });
            }

            const user = await client.db("main").collection("user").findOne({ _id: new ObjectId(userId) });
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            let currentProgress = typeof user.progress === 'string'
                ? parseInt(user.progress.replace('%', '')) || 0
                : user.progress || 0;
            const newProgress = Math.min(currentProgress + PROGRESS_INCREMENT, 100);

            const result = await client.db("main").collection("user").updateOne(
                { _id: new ObjectId(userId) },
                { $set: { progress: newProgress } }
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
                progressIncrement: PROGRESS_INCREMENT,
                oldProgress: currentProgress,
                newProgress: newProgress
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateName(req, res) {
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
    }
}
