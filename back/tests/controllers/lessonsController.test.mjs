import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { ObjectId } from "mongodb";

const mockClient = { db: () => global.testDb };
const lessonsFactory = (await import("../../src/controllers/lessonsController.mjs")).default;
const lessonsController = lessonsFactory(mockClient, "http://judge0", null);

const createMockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.setHeader = jest.fn(() => res);
  return res;
};

describe("lessonsController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createLesson: создаёт урок с нормализованной теорией", async () => {
    const req = {
      body: {
        title: "New Lesson",
        theory: "Text theory",
        practiceTask: "Do it",
        languageId: 63,
      },
    };
    const res = createMockRes();

    await lessonsController.createLesson(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const saved = await global.testDb.collection("lessons").findOne({ title: "New Lesson" });
    expect(saved).toBeTruthy();
    expect(Array.isArray(saved.theory)).toBe(true);
    expect(saved.practiceTask.languageId).toBe(63);
  });

  test("getLesson: добавляет флаг isCompleted для пользователя", async () => {
    const lessonId = new ObjectId();
    const userId = new ObjectId();
    await global.testDb.collection("lessons").insertOne({
      _id: lessonId,
      title: "Lesson A",
      practiceTask: { languageId: 63, testCases: [] },
      theory: [],
      completedBy: [],
    });
    await global.testDb.collection("user").insertOne({
      _id: userId,
      name: "User",
      email: "u@example.com",
      password: "x",
      completedLessons: [lessonId],
    });

    const req = { params: { id: lessonId.toString() }, user: { userId: userId.toString() } };
    const res = createMockRes();

    await lessonsController.getLesson(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.isCompleted).toBe(true);
  });

  test("getAllLessons: возвращает список с признаком завершения", async () => {
    const lessonId = new ObjectId();
    const userId = new ObjectId();
    await global.testDb.collection("lessons").insertOne({
      _id: lessonId,
      title: "Lesson B",
      theory: [],
      practiceTask: { languageId: 63, testCases: [] },
      completedBy: [],
    });
    await global.testDb.collection("user").insertOne({
      _id: userId,
      email: "u2@example.com",
      password: "x",
      completedLessons: [lessonId],
    });

    const req = { query: {}, user: { userId: userId.toString() } };
    const res = createMockRes();

    await lessonsController.getAllLessons(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const list = res.json.mock.calls[0][0];
    expect(list).toHaveLength(1);
    expect(list[0].isCompleted).toBe(true);
  });
});

