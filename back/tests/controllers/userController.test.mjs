import { jest, describe, test, expect, beforeAll, beforeEach } from "@jest/globals";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

// Подменяем app.mjs, чтобы не было реального подключения к MongoDB
const mockClient = { db: () => global.testDb };
jest.unstable_mockModule("../../app.mjs", () => ({
  client: mockClient,
}));

const userController = (await import("../../src/controllers/userController.mjs")).default;

const createMockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.cookie = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  res.setHeader = jest.fn(() => res);
  return res;
};

describe("userController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test_jwt_secret";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("register: создаёт пользователя и ставит cookie", async () => {
    const req = {
      body: { name: "Test", email: "test@example.com", password: "123456" },
    };
    const res = createMockRes();

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalled();
    const saved = await global.testDb.collection("user").findOne({ email: "test@example.com" });
    expect(saved).toBeTruthy();
    expect(saved.role).toBe("user");
  });

  test("register: отклоняет дублирующий email", async () => {
    await global.testDb.collection("user").insertOne({
      name: "Exists",
      email: "dup@example.com",
      password: "hashed",
    });

    const req = {
      body: { name: "Dup", email: "dup@example.com", password: "123456" },
    };
    const res = createMockRes();

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Пользователь с таким email уже существует" });
  });

  test("login: авторизует пользователя с bcrypt-хешем", async () => {
    const password = "secret123";
    const hash = await bcrypt.hash(password, 10);
    const userId = (await global.testDb.collection("user").insertOne({
      name: "Login User",
      email: "login@example.com",
      password: hash,
    })).insertedId;

    const req = { body: { email: "login@example.com", password }, user: { userId: userId.toString() } };
    const res = createMockRes();

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalled();
  });

  test("logout: удаляет сессии и очищает cookie", async () => {
    const userId = new ObjectId();
    await global.testDb.collection("sessions").insertMany([
      { userId, refreshToken: "t1" },
      { userId, refreshToken: "t2" },
    ]);

    const req = { user: { userId: userId.toString() } };
    const res = createMockRes();

    await userController.logout(req, res);

    const remaining = await global.testDb.collection("sessions").find({ userId }).toArray();
    expect(remaining).toHaveLength(0);
    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("profile: возвращает профиль с последним уроком", async () => {
    const userId = new ObjectId();
    const lessonId = new ObjectId();
    await global.testDb.collection("lessons").insertOne({
      _id: lessonId,
      title: "Lesson 1",
      practiceTask: {},
    });
    await global.testDb.collection("user").insertOne({
      _id: userId,
      name: "Profile User",
      email: "p@example.com",
      password: "x",
      completedLessons: [lessonId],
    });

    const req = { user: { userId: userId.toString() } };
    const res = createMockRes();

    await userController.profile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.user.name).toBe("Profile User");
    expect(payload.user.lastLesson.id).toBe(lessonId.toString());
  });

  test("updateProgress: увеличивает прогресс и помечает урок завершённым", async () => {
    const userId = new ObjectId();
    const lessonId = new ObjectId();
    await global.testDb.collection("user").insertOne({
      _id: userId,
      name: "Progress User",
      email: "pr@example.com",
      password: "x",
      progress: 0,
      completedLessons: [],
    });
    await global.testDb.collection("lessons").insertOne({
      _id: lessonId,
      title: "Progress Lesson",
      completedBy: [],
      practiceTask: {},
    });

    const req = { params: { id: userId.toString(), lessonId: lessonId.toString() } };
    const res = createMockRes();

    await userController.updateProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const user = await global.testDb.collection("user").findOne({ _id: userId });
    expect(user.progress).toBe(4);
    const lesson = await global.testDb.collection("lessons").findOne({ _id: lessonId });
    expect(lesson.completedBy.map((id) => id.toString())).toContain(userId.toString());
  });
});

