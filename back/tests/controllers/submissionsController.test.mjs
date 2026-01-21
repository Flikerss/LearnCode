import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { ObjectId } from "mongodb";

const mockClient = { db: () => global.testDb };
const submissionsFactory = (await import("../../src/controllers/submissionsController.mjs")).default;
const submissionsController = submissionsFactory(mockClient, "http://judge0", null);

const createMockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.setHeader = jest.fn(() => res);
  return res;
};

describe("submissionsController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createSubmission: создаёт submission и помечает прогресс", async () => {
    const userId = new ObjectId();
    const lessonId = new ObjectId();
    await global.testDb.collection("lessons").insertOne({
      _id: lessonId,
      title: "Lesson with tests",
      practiceTask: {
        languageId: 63,
        testCases: [{ input: "5", expectedOutput: "5" }],
      },
    });
    await global.testDb.collection("user").insertOne({
      _id: userId,
      email: "s@example.com",
      password: "x",
      progress: 0,
      completedLessons: [],
    });

    const req = {
      body: {
        lessonId: lessonId.toString(),
        code: "console.log(input);",
        languageId: 63,
      },
      user: { userId: userId.toString() },
    };
    const res = createMockRes();

    await submissionsController.createSubmission(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);

    const submission = await global.testDb.collection("submissions").findOne({
      lessonId,
      userId,
    });
    expect(submission).toBeTruthy();
    expect(submission.status).toBe("accepted");

    const userLesson = await global.testDb.collection("user_lessons").findOne({
      userId,
      lessonId,
    });
    expect(userLesson?.status).toBe("completed");
  });

  test("createSubmission: возвращает 400 если нет тестовых случаев", async () => {
    const userId = new ObjectId();
    const lessonId = new ObjectId();
    await global.testDb.collection("lessons").insertOne({
      _id: lessonId,
      title: "Lesson without tests",
      practiceTask: {
        languageId: 63,
        testCases: [],
      },
    });
    await global.testDb.collection("user").insertOne({
      _id: userId,
      email: "s2@example.com",
      password: "x",
    });

    const req = {
      body: {
        lessonId: lessonId.toString(),
        code: "console.log('no tests');",
      },
      user: { userId: userId.toString() },
    };
    const res = createMockRes();

    await submissionsController.createSubmission(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Урок не содержит тестовых случаев"),
      })
    );
  });

  test("getSubmissions: возвращает submissions пользователя с пагинацией", async () => {
    const userId = new ObjectId();
    const otherUser = new ObjectId();
    const lessonA = new ObjectId();
    const lessonB = new ObjectId();

    await global.testDb.collection("submissions").insertMany([
      { userId, lessonId: lessonA, status: "accepted", createdAt: new Date() },
      { userId, lessonId: lessonB, status: "rejected", createdAt: new Date() },
      { userId: otherUser, lessonId: lessonA, status: "accepted", createdAt: new Date() },
    ]);

    const req = {
      user: { userId: userId.toString() },
      query: { limit: 10, offset: 0 },
    };
    const res = createMockRes();

    await submissionsController.getSubmissions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.submissions).toHaveLength(2);
    expect(payload.submissions.every((s) => s.userId.toString() === userId.toString())).toBe(true);
  });
});

