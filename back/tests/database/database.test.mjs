import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';

describe('Database Tests', () => {
  let mongoServer;
  let client;
  let db;

  beforeAll(async () => {
    // Запускаем MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test');
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Очищаем все коллекции перед каждым тестом
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
    }
  });

  describe('User Collection', () => {
    test('должен создать пользователя', async () => {
      const usersCollection = db.collection('user');
      
      const user = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'user',
        progress: 0,
        experience: 0,
        level: 1,
        streak: 0,
        completedLessons: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(user);
      expect(result.insertedId).toBeDefined();

      const insertedUser = await usersCollection.findOne({ _id: result.insertedId });
      expect(insertedUser.name).toBe('Test User');
      expect(insertedUser.email).toBe('test@example.com');
      expect(insertedUser.role).toBe('user');
      expect(insertedUser.progress).toBe(0);
    });

    test('должен найти пользователя по email', async () => {
      const usersCollection = db.collection('user');
      
      await usersCollection.insertOne({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'user',
        progress: 0,
      });

      const user = await usersCollection.findOne({ email: 'test@example.com' });
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    test('должен обновить прогресс пользователя', async () => {
      const usersCollection = db.collection('user');
      
      const insertResult = await usersCollection.insertOne({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        progress: 20,
      });

      const updateResult = await usersCollection.updateOne(
        { _id: insertResult.insertedId },
        { $set: { progress: 50, updatedAt: new Date() } }
      );

      expect(updateResult.modifiedCount).toBe(1);

      const updatedUser = await usersCollection.findOne({ _id: insertResult.insertedId });
      expect(updatedUser.progress).toBe(50);
    });

    test('должен добавить завершенный урок в массив', async () => {
      const usersCollection = db.collection('user');
      const lessonId = new ObjectId();
      
      const insertResult = await usersCollection.insertOne({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        completedLessons: [],
      });

      await usersCollection.updateOne(
        { _id: insertResult.insertedId },
        { $addToSet: { completedLessons: lessonId } }
      );

      const user = await usersCollection.findOne({ _id: insertResult.insertedId });
      expect(user.completedLessons).toHaveLength(1);
      expect(user.completedLessons[0].toString()).toBe(lessonId.toString());
    });

    test('не должен создать пользователя с дублирующимся email', async () => {
      const usersCollection = db.collection('user');
      
      // Создаем индекс для уникальности email
      await usersCollection.createIndex({ email: 1 }, { unique: true });

      await usersCollection.insertOne({
        name: 'Test User 1',
        email: 'test@example.com',
        password: 'hashed_password',
      });

      // Попытка создать пользователя с тем же email должна вызвать ошибку
      await expect(
        usersCollection.insertOne({
          name: 'Test User 2',
          email: 'test@example.com',
          password: 'hashed_password',
        })
      ).rejects.toThrow();
    });
  });

  describe('Lessons Collection', () => {
    test('должен создать урок', async () => {
      const lessonsCollection = db.collection('lessons');
      
      const lesson = {
        title: 'Test Lesson',
        theory: [{ body: 'Теория урока' }],
        practiceTask: {
          description: 'Практическое задание',
          languageId: 63,
          testCases: [],
        },
        completedBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await lessonsCollection.insertOne(lesson);
      expect(result.insertedId).toBeDefined();

      const insertedLesson = await lessonsCollection.findOne({ _id: result.insertedId });
      expect(insertedLesson.title).toBe('Test Lesson');
      expect(insertedLesson.theory).toHaveLength(1);
      expect(insertedLesson.practiceTask.languageId).toBe(63);
    });

    test('должен найти урок по ID', async () => {
      const lessonsCollection = db.collection('lessons');
      
      const insertResult = await lessonsCollection.insertOne({
        title: 'Test Lesson',
        theory: [{ body: 'Теория' }],
        practiceTask: {
          description: 'Задание',
          languageId: 63,
        },
      });

      const lesson = await lessonsCollection.findOne({ _id: insertResult.insertedId });
      expect(lesson).toBeDefined();
      expect(lesson.title).toBe('Test Lesson');
    });

    test('должен обновить урок', async () => {
      const lessonsCollection = db.collection('lessons');
      
      const insertResult = await lessonsCollection.insertOne({
        title: 'Old Title',
        theory: [{ body: 'Теория' }],
        practiceTask: { description: 'Задание', languageId: 63 },
      });

      const updateResult = await lessonsCollection.updateOne(
        { _id: insertResult.insertedId },
        { $set: { title: 'New Title', updatedAt: new Date() } }
      );

      expect(updateResult.modifiedCount).toBe(1);

      const updatedLesson = await lessonsCollection.findOne({ _id: insertResult.insertedId });
      expect(updatedLesson.title).toBe('New Title');
    });

    test('должен добавить пользователя в completedBy', async () => {
      const lessonsCollection = db.collection('lessons');
      const userId = new ObjectId();
      
      const insertResult = await lessonsCollection.insertOne({
        title: 'Test Lesson',
        theory: [{ body: 'Теория' }],
        practiceTask: { description: 'Задание', languageId: 63 },
        completedBy: [],
      });

      await lessonsCollection.updateOne(
        { _id: insertResult.insertedId },
        { $addToSet: { completedBy: userId } }
      );

      const lesson = await lessonsCollection.findOne({ _id: insertResult.insertedId });
      expect(lesson.completedBy).toHaveLength(1);
      expect(lesson.completedBy[0].toString()).toBe(userId.toString());
    });

    test('должен удалить урок', async () => {
      const lessonsCollection = db.collection('lessons');
      
      const insertResult = await lessonsCollection.insertOne({
        title: 'Test Lesson',
        theory: [{ body: 'Теория' }],
        practiceTask: { description: 'Задание', languageId: 63 },
      });

      const deleteResult = await lessonsCollection.deleteOne({ _id: insertResult.insertedId });
      expect(deleteResult.deletedCount).toBe(1);

      const deletedLesson = await lessonsCollection.findOne({ _id: insertResult.insertedId });
      expect(deletedLesson).toBeNull();
    });
  });

  describe('Submissions Collection', () => {
    test('должен создать submission', async () => {
      const submissionsCollection = db.collection('submissions');
      const userId = new ObjectId();
      const lessonId = new ObjectId();
      
      const submission = {
        userId,
        lessonId,
        code: 'console.log("Hello");',
        languageId: 63,
        status: 'accepted',
        testResults: [],
        createdAt: new Date(),
      };

      const result = await submissionsCollection.insertOne(submission);
      expect(result.insertedId).toBeDefined();

      const insertedSubmission = await submissionsCollection.findOne({ _id: result.insertedId });
      expect(insertedSubmission.userId.toString()).toBe(userId.toString());
      expect(insertedSubmission.lessonId.toString()).toBe(lessonId.toString());
      expect(insertedSubmission.status).toBe('accepted');
    });

    test('должен найти submissions по userId', async () => {
      const submissionsCollection = db.collection('submissions');
      const userId = new ObjectId();
      const lessonId1 = new ObjectId();
      const lessonId2 = new ObjectId();
      
      await submissionsCollection.insertMany([
        {
          userId,
          lessonId: lessonId1,
          code: 'code1',
          languageId: 63,
          status: 'accepted',
          createdAt: new Date(),
        },
        {
          userId,
          lessonId: lessonId2,
          code: 'code2',
          languageId: 63,
          status: 'rejected',
          createdAt: new Date(),
        },
      ]);

      const submissions = await submissionsCollection
        .find({ userId })
        .toArray();

      expect(submissions).toHaveLength(2);
      expect(submissions[0].userId.toString()).toBe(userId.toString());
    });
  });

  describe('Sessions Collection', () => {
    test('должен создать сессию', async () => {
      const sessionsCollection = db.collection('sessions');
      const userId = new ObjectId();
      
      const session = {
        userId,
        refreshToken: 'refresh_token_123',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      const result = await sessionsCollection.insertOne(session);
      expect(result.insertedId).toBeDefined();

      const insertedSession = await sessionsCollection.findOne({ _id: result.insertedId });
      expect(insertedSession.userId.toString()).toBe(userId.toString());
      expect(insertedSession.refreshToken).toBe('refresh_token_123');
    });

    test('должен найти сессию по userId и refreshToken', async () => {
      const sessionsCollection = db.collection('sessions');
      const userId = new ObjectId();
      
      await sessionsCollection.insertOne({
        userId,
        refreshToken: 'refresh_token_123',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      const session = await sessionsCollection.findOne({
        userId,
        refreshToken: 'refresh_token_123',
      });

      expect(session).toBeDefined();
      expect(session.userId.toString()).toBe(userId.toString());
    });

    test('должен удалить все сессии пользователя', async () => {
      const sessionsCollection = db.collection('sessions');
      const userId = new ObjectId();
      
      await sessionsCollection.insertMany([
        {
          userId,
          refreshToken: 'token1',
          expiresAt: new Date(),
          createdAt: new Date(),
        },
        {
          userId,
          refreshToken: 'token2',
          expiresAt: new Date(),
          createdAt: new Date(),
        },
      ]);

      const deleteResult = await sessionsCollection.deleteMany({ userId });
      expect(deleteResult.deletedCount).toBe(2);

      const remainingSessions = await sessionsCollection.find({ userId }).toArray();
      expect(remainingSessions).toHaveLength(0);
    });
  });

  describe('User Lessons Collection', () => {
    test('должен создать запись user_lesson', async () => {
      const userLessonsCollection = db.collection('user_lessons');
      const userId = new ObjectId();
      const lessonId = new ObjectId();
      const chapterId = new ObjectId();
      
      const userLesson = {
        userId,
        lessonId,
        chapterId,
        status: 'completed',
        completedAt: new Date(),
        score: 100,
        updatedAt: new Date(),
      };

      const result = await userLessonsCollection.insertOne(userLesson);
      expect(result.insertedId).toBeDefined();

      const inserted = await userLessonsCollection.findOne({ _id: result.insertedId });
      expect(inserted.status).toBe('completed');
      expect(inserted.score).toBe(100);
    });

    test('должен использовать upsert для обновления или создания', async () => {
      const userLessonsCollection = db.collection('user_lessons');
      const userId = new ObjectId();
      const lessonId = new ObjectId();
      
      // Первая вставка
      await userLessonsCollection.updateOne(
        { userId, lessonId },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            score: 100,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      const first = await userLessonsCollection.findOne({ userId, lessonId });
      expect(first).toBeDefined();
      expect(first.score).toBe(100);

      // Обновление существующей записи
      await userLessonsCollection.updateOne(
        { userId, lessonId },
        {
          $set: {
            status: 'completed',
            score: 95,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      const updated = await userLessonsCollection.findOne({ userId, lessonId });
      expect(updated.score).toBe(95);
    });
  });

  describe('Achievements Collections', () => {
    test('должен создать достижение', async () => {
      const achievementsCollection = db.collection('achievements');
      
      const achievement = {
        title: 'First Lesson',
        description: 'Завершите первый урок',
        icon: '🏆',
        condition: {
          type: 'lessons_completed',
          value: 1,
        },
        reward: {
          type: 'coins',
          amount: 10,
        },
      };

      const result = await achievementsCollection.insertOne(achievement);
      expect(result.insertedId).toBeDefined();

      const inserted = await achievementsCollection.findOne({ _id: result.insertedId });
      expect(inserted.title).toBe('First Lesson');
      expect(inserted.condition.type).toBe('lessons_completed');
    });

    test('должен создать запись user_achievement', async () => {
      const userAchievementsCollection = db.collection('user_achievements');
      const userId = new ObjectId();
      const achievementId = new ObjectId();
      
      const userAchievement = {
        userId,
        achievementId,
        earnedAt: new Date(),
      };

      const result = await userAchievementsCollection.insertOne(userAchievement);
      expect(result.insertedId).toBeDefined();

      const inserted = await userAchievementsCollection.findOne({ _id: result.insertedId });
      expect(inserted.userId.toString()).toBe(userId.toString());
      expect(inserted.achievementId.toString()).toBe(achievementId.toString());
    });
  });

  describe('Chapters Collection', () => {
    test('должен создать главу с уроками', async () => {
      const chaptersCollection = db.collection('chapters');
      const lessonId1 = new ObjectId();
      const lessonId2 = new ObjectId();
      
      const chapter = {
        title: 'Introduction',
        description: 'Введение в программирование',
        lessons: [lessonId1, lessonId2],
        order: 1,
        createdAt: new Date(),
      };

      const result = await chaptersCollection.insertOne(chapter);
      expect(result.insertedId).toBeDefined();

      const inserted = await chaptersCollection.findOne({ _id: result.insertedId });
      expect(inserted.title).toBe('Introduction');
      expect(inserted.lessons).toHaveLength(2);
    });
  });
});


