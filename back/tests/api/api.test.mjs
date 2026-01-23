import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const mockClient = {
  db: () => global.testDb,
};

jest.unstable_mockModule('../../app.mjs', () => ({
  client: mockClient,
}));

const usersController = (await import('../../src/controllers/userController.mjs')).default;
const lessonsControllerFactory = (await import('../../src/controllers/lessonsController.mjs')).default;
const submissionsControllerFactory = (await import('../../src/controllers/submissionsController.mjs')).default;

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';

describe('API Integration Tests', () => {
  let app;
  let testDb;
  let lessonsController;
  let submissionsController;

  beforeAll(async () => {
    app = express();
    app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
    app.use(cookieParser());
    app.use(bodyParser.json());

    testDb = global.testDb;

    lessonsController = lessonsControllerFactory(mockClient, 'http://judge0', null);
    submissionsController = submissionsControllerFactory(mockClient, 'http://judge0', null);

    const authenticateToken = (req, res, next) => {
      const header = req.headers['authorization'];
      const headerToken = header && header.split(' ')[1];
      const cookieToken = req.cookies?.token;
      const token = cookieToken || headerToken;

      if (!token) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
      }

      try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { userId: payload.userId, email: payload.email };
        next();
      } catch (err) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
    };

    const optionalAuthenticateToken = (req, res, next) => {
      const header = req.headers['authorization'];
      const headerToken = header && header.split(' ')[1];
      const cookieToken = req.cookies?.token;
      const token = cookieToken || headerToken;

      if (!token) {
        req.user = null;
        return next();
      }

      try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { userId: payload.userId, email: payload.email };
      } catch {
        req.user = null;
      }
      next();
    };

    app.post('/api/user', (req, res) => usersController.register(req, res));
    app.post('/api/user/login', (req, res) => usersController.login(req, res));
    app.post('/api/user/logout', authenticateToken, (req, res) => usersController.logout(req, res));
    app.get('/api/user/profile', authenticateToken, (req, res) => usersController.profile(req, res));

    // Маршруты /api/lessons
    app.get('/api/lessons', optionalAuthenticateToken, (req, res) =>
      lessonsController.getAllLessons(req, res),
    );
    app.get('/api/lessons/:id', optionalAuthenticateToken, (req, res) =>
      lessonsController.getLesson(req, res),
    );
    app.post('/api/lessons', authenticateToken, (req, res) =>
      lessonsController.createLesson(req, res),
    );

    app.post('/api/submissions', authenticateToken, (req, res) =>
      submissionsController.createSubmission(req, res),
    );
    app.get('/api/submissions', authenticateToken, (req, res) =>
      submissionsController.getSubmissions(req, res),
    );

    app.use((err, req, res, next) => {
      res.status(err.status || 500).json({
        error: err.message || 'Внутренняя ошибка сервера',
      });
    });

    app.use((req, res) => {
      res.status(404).json({ error: 'Маршрут не найден' });
    });

    process.env.JWT_SECRET = JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET;
  });

  beforeEach(async () => {
    const collections = await testDb.listCollections().toArray();
    for (const collection of collections) {
      await testDb.collection(collection.name).deleteMany({});
    }
  });

  describe('POST /api/user - Регистрация', () => {
    test('должен зарегистрировать нового пользователя', async () => {
      const response = await request(app)
        .post('/api/user')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123456',
        })
        .expect(201);

      expect(response.body.message).toContain('успешно зарегистрировался');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.password).toBeUndefined();

      const user = await testDb.collection('user').findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.role).toBe('user');
      expect(user.progress).toBe(0);
    });

    test('должен вернуть 400 при отсутствии обязательных полей', async () => {
      const response = await request(app)
        .post('/api/user')
        .send({
          name: 'Test User',
        })
        .expect(400);

      expect(response.body.error).toContain('обязательны');
    });

    test('должен вернуть 400 при коротком пароле', async () => {
      const response = await request(app)
        .post('/api/user')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345',
        })
        .expect(400);

      expect(response.body.error).toContain('минимум 6 символов');
    });

    test('должен вернуть 409 при дублирующемся email', async () => {
      await testDb.collection('user').insertOne({
        name: 'Existing User',
        email: 'dup@example.com',
        password: 'hashed',
      });

      const response = await request(app)
        .post('/api/user')
        .send({
          name: 'New User',
          email: 'dup@example.com',
          password: '123456',
        })
        .expect(409);

      expect(response.body.error).toContain('уже существует');
    });

    test('должен установить cookie с токеном', async () => {
      const response = await request(app)
        .post('/api/user')
        .send({
          name: 'Test User',
          email: 'cookie@example.com',
          password: '123456',
        })
        .expect(201);

      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      expect(cookies.some((cookie) => cookie.includes('token='))).toBe(true);
    });
  });

  describe('POST /api/user/login - Вход', () => {
    test('должен авторизовать пользователя с правильными данными', async () => {
      const password = 'secret123';
      const hash = await bcrypt.hash(password, 10);
      await testDb.collection('user').insertOne({
        name: 'Login User',
        email: 'login@example.com',
        password: hash,
      });

      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'login@example.com',
          password: password,
        })
        .expect(200);

      expect(response.body.message).toContain('успешно вошел');
      expect(response.body.user).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('должен вернуть 401 при неверных данных', async () => {
      await testDb.collection('user').insertOne({
        name: 'User',
        email: 'user@example.com',
        password: await bcrypt.hash('correct', 10),
      });

      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'user@example.com',
          password: 'wrong',
        })
        .expect(401);

      expect(response.body.error).toContain('Неверные учетные данные');
    });

    test('должен вернуть 400 при отсутствии данных', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('обязательны');
    });
  });

  describe('GET /api/user/profile - Профиль', () => {
    test('должен вернуть профиль авторизованного пользователя', async () => {
      const userId = new ObjectId();
      const lessonId = new ObjectId();
      await testDb.collection('user').insertOne({
        _id: userId,
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'hashed',
        completedLessons: [lessonId],
        progress: 20,
      });
      await testDb.collection('lessons').insertOne({
        _id: lessonId,
        title: 'Test Lesson',
        practiceTask: {},
      });

      const token = jwt.sign({ userId: userId.toString(), email: 'profile@example.com' }, JWT_SECRET, {
        expiresIn: '7d',
      });

      const response = await request(app)
        .get('/api/user/profile')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe('Profile User');
      expect(response.body.user.email).toBe('profile@example.com');
      expect(response.body.user.password).toBeUndefined();
    });

    test('должен вернуть 401 без токена', async () => {
      const response = await request(app).get('/api/user/profile').expect(401);

      expect(response.body.error).toContain('Токен не предоставлен');
    });
  });

  describe('POST /api/user/logout - Выход', () => {
    test('должен выйти из системы и очистить cookie', async () => {
      const userId = new ObjectId();
      await testDb.collection('sessions').insertOne({
        userId,
        refreshToken: 'refresh_token',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const token = jwt.sign({ userId: userId.toString(), email: 'test@example.com' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/user/logout')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.message).toContain('Вы вышли из системы');

      const sessions = await testDb.collection('sessions').find({ userId }).toArray();
      expect(sessions).toHaveLength(0);
    });
  });

  describe('GET /api/lessons - Список уроков', () => {
    test('должен вернуть список уроков', async () => {
      await testDb.collection('lessons').insertMany([
        {
          title: 'Lesson 1',
          theory: [{ body: 'Theory 1' }],
          practiceTask: { description: 'Task 1', languageId: 63, testCases: [] },
          completedBy: [],
        },
        {
          title: 'Lesson 2',
          theory: [{ body: 'Theory 2' }],
          practiceTask: { description: 'Task 2', languageId: 63, testCases: [] },
          completedBy: [],
        },
      ]);

      const response = await request(app).get('/api/lessons').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Lesson 1');
    });

    test('должен показать isCompleted для авторизованного пользователя', async () => {
      const userId = new ObjectId();
      const lessonId = new ObjectId();
      await testDb.collection('user').insertOne({
        _id: userId,
        email: 'user@example.com',
        password: 'hashed',
        completedLessons: [lessonId],
      });
      await testDb.collection('lessons').insertOne({
        _id: lessonId,
        title: 'Completed Lesson',
        theory: [{ body: 'Theory' }],
        practiceTask: { description: 'Task', languageId: 63, testCases: [] },
        completedBy: [],
      });

      const token = jwt.sign({ userId: userId.toString(), email: 'user@example.com' }, JWT_SECRET);

      const response = await request(app)
        .get('/api/lessons')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body[0].isCompleted).toBe(true);
    });
  });

  describe('GET /api/lessons/:id - Получение урока', () => {
    test('должен вернуть урок по ID', async () => {
      const lessonId = new ObjectId();
      await testDb.collection('lessons').insertOne({
        _id: lessonId,
        title: 'Single Lesson',
        theory: [{ body: 'Theory content' }],
        practiceTask: { description: 'Practice task', languageId: 63, testCases: [] },
        completedBy: [],
      });

      const response = await request(app).get(`/api/lessons/${lessonId.toString()}`).expect(200);

      expect(response.body.title).toBe('Single Lesson');
      expect(response.body._id).toBe(lessonId.toString());
    });

    test('должен вернуть 404 для несуществующего урока', async () => {
      const fakeId = new ObjectId();
      const response = await request(app).get(`/api/lessons/${fakeId.toString()}`).expect(404);

      expect(response.body.message).toContain('не найден');
    });
  });

  describe('POST /api/lessons - Создание урока (требует авторизации)', () => {
    test('должен создать урок для авторизованного пользователя', async () => {
      const userId = new ObjectId();
      const token = jwt.sign({ userId: userId.toString(), email: 'admin@example.com' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/lessons')
        .set('Cookie', `token=${token}`)
        .send({
          title: 'New Lesson',
          theory: 'Theory text',
          practiceTask: 'Practice description',
          languageId: 63,
          testCases: [],
        })
        .expect(201);

      expect(response.body.message).toContain('успешно создан');
      expect(response.body.lesson).toBeDefined();
      expect(response.body.lesson.title).toBe('New Lesson');

      const lesson = await testDb.collection('lessons').findOne({ title: 'New Lesson' });
      expect(lesson).toBeTruthy();
    });

    test('должен вернуть 401 без авторизации', async () => {
      const response = await request(app)
        .post('/api/lessons')
        .send({
          title: 'New Lesson',
          theory: 'Theory',
          practiceTask: 'Task',
        })
        .expect(401);

      expect(response.body.error).toContain('Токен не предоставлен');
    });

    test('должен вернуть 400 при отсутствии обязательных полей', async () => {
      const userId = new ObjectId();
      const token = jwt.sign({ userId: userId.toString(), email: 'user@example.com' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/lessons')
        .set('Cookie', `token=${token}`)
        .send({
          title: 'Lesson without theory',
          // theory отсутствует
          practiceTask: 'Task',
        })
        .expect(400);

      expect(response.body.error).toContain('обязательны');
    });
  });

  describe('POST /api/submissions - Отправка решения', () => {
    test('должен создать submission и обновить прогресс при успешном решении', async () => {
      const userId = new ObjectId();
      const lessonId = new ObjectId();
      await testDb.collection('user').insertOne({
        _id: userId,
        email: 'submitter@example.com',
        password: 'hashed',
        progress: 0,
        completedLessons: [],
      });
      await testDb.collection('lessons').insertOne({
        _id: lessonId,
        title: 'Test Lesson',
        practiceTask: {
          languageId: 63,
          testCases: [{ input: '5', expectedOutput: '5' }],
        },
      });

      const token = jwt.sign({ userId: userId.toString(), email: 'submitter@example.com' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/submissions')
        .set('Cookie', `token=${token}`)
        .send({
          lessonId: lessonId.toString(),
          code: 'console.log(input);',
          languageId: 63,
        })
        .expect(201);

      expect(response.body.success).toBeDefined();
      expect(response.body.submission).toBeDefined();

      const submission = await testDb.collection('submissions').findOne({
        userId,
        lessonId,
      });
      expect(submission).toBeTruthy();
    });

    test('должен вернуть 400 если урок не содержит тестовых случаев', async () => {
      const userId = new ObjectId();
      const lessonId = new ObjectId();
      await testDb.collection('user').insertOne({
        _id: userId,
        email: 'user@example.com',
        password: 'hashed',
      });
      await testDb.collection('lessons').insertOne({
        _id: lessonId,
        title: 'Lesson without tests',
        practiceTask: {
          languageId: 63,
          testCases: [], // пустой массив
        },
      });

      const token = jwt.sign({ userId: userId.toString(), email: 'user@example.com' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/submissions')
        .set('Cookie', `token=${token}`)
        .send({
          lessonId: lessonId.toString(),
          code: 'console.log("test");',
        })
        .expect(400);

      expect(response.body.error).toContain('тестовых случаев');
    });

    test('должен вернуть 401 без авторизации', async () => {
      const response = await request(app)
        .post('/api/submissions')
        .send({
          lessonId: new ObjectId().toString(),
          code: 'console.log("test");',
        })
        .expect(401);
    });
  });

  describe('GET /api/submissions - Получение submissions', () => {
    test('должен вернуть submissions пользователя', async () => {
      const userId = new ObjectId();
      const otherUserId = new ObjectId();
      const lessonId = new ObjectId();

      await testDb.collection('submissions').insertMany([
        {
          userId,
          lessonId,
          code: 'code1',
          status: 'accepted',
          createdAt: new Date(),
        },
        {
          userId,
          lessonId,
          code: 'code2',
          status: 'rejected',
          createdAt: new Date(),
        },
        {
          userId: otherUserId,
          lessonId,
          code: 'code3',
          status: 'accepted',
          createdAt: new Date(),
        },
      ]);

      const token = jwt.sign({ userId: userId.toString(), email: 'user@example.com' }, JWT_SECRET);

      const response = await request(app)
        .get('/api/submissions')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.submissions).toBeDefined();
      expect(response.body.submissions.length).toBe(2);
      expect(response.body.submissions.every((s) => s.userId.toString() === userId.toString())).toBe(true);
    });

    test('должен поддерживать пагинацию', async () => {
      const userId = new ObjectId();
      const lessonId = new ObjectId();

      // Создаем 5 submissions
      await testDb.collection('submissions').insertMany(
        Array.from({ length: 5 }, (_, i) => ({
          userId,
          lessonId,
          code: `code${i}`,
          status: 'accepted',
          createdAt: new Date(Date.now() - i * 1000),
        }))
      );

      const token = jwt.sign({ userId: userId.toString(), email: 'user@example.com' }, JWT_SECRET);

      const response = await request(app)
        .get('/api/submissions?limit=2&offset=0')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.submissions.length).toBe(2);
    });
  });

  describe('404 обработка', () => {
    test('должен вернуть 404 для несуществующего маршрута', async () => {
      const response = await request(app).get('/api/nonexistent').expect(404);

      expect(response.body.error).toContain('не найден');
    });
  });
});
