import { ObjectId } from "mongodb";
import AppError from "../errors/AppError.mjs";

export default (client, JUDGE0_URL, JUDGE0_API_KEY) => {
  const createSubmission = async (req, res) => {
    const { lessonId, code, languageId } = req.body;
    const { userId } = req.user || {};

    if (!lessonId || !code) {
      throw AppError.badRequest("lessonId и code обязательны");
    }

    const lesson = await client
      .db("main")
      .collection("lessons")
      .findOne({ _id: new ObjectId(lessonId) });

    if (!lesson) {
      throw AppError.notFound("Урок не найден");
    }

    const executionResult = await executeCode(
      code,
      languageId || lesson.practiceTask?.languageId || 63,
      lesson.practiceTask?.testCases || [],
      JUDGE0_URL,
      JUDGE0_API_KEY
    );

    const submission = {
      userId: new ObjectId(userId),
      lessonId: new ObjectId(lessonId),
      code,
      languageId: languageId || lesson.practiceTask?.languageId || 63,
      status: executionResult.success ? "accepted" : "rejected",
      testResults: executionResult.details || [],
      executionTime: executionResult.executionTime || null,
      memoryUsed: executionResult.memoryUsed || null,
      error: executionResult.error || null,
      createdAt: new Date(),
    };

    const result = await client
      .db("main")
      .collection("submissions")
      .insertOne(submission);

    submission._id = result.insertedId;

    if (executionResult.success) {
      await updateUserProgress(client, userId, lessonId, lesson);
    }

    res.status(201).json({
      submission: {
        id: submission._id.toString(),
        status: submission.status,
        testResults: submission.testResults,
        error: submission.error,
      },
      success: executionResult.success,
    });
  };

  const getSubmissions = async (req, res) => {
    const { userId } = req.user || {};
      const { lessonId, limit = 10, offset = 0 } = req.query;

    const query = { userId: new ObjectId(userId) };
    if (lessonId) {
      query.lessonId = new ObjectId(lessonId);
    }

    const submissions = await client
      .db("main")
      .collection("submissions")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();

    res.status(200).json({ submissions });
  };

  return {
    createSubmission,
    getSubmissions,
  };
};

async function executeCode(code, languageId, testCases, JUDGE0_URL, JUDGE0_API_KEY) {
  try {
    if (JUDGE0_API_KEY) {
      return await executeWithJudge0(code, languageId, testCases, JUDGE0_URL, JUDGE0_API_KEY);
    }
    if (languageId === 63) {
      return await executeJavaScriptLocally(code, testCases);
    }
    throw new Error("Сервис выполнения кода не настроен");
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: null,
    };
  }
}

async function executeWithJudge0(code, languageId, testCases, JUDGE0_URL, JUDGE0_API_KEY) {
  const axios = await import("axios");
  const startTime = Date.now();
  try {
    const results = [];
    let allPassed = true;

    for (const testCase of testCases) {
      const response = await axios.default.post(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: languageId,
          stdin: testCase.input || "",
          expected_output: testCase.expectedOutput,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": JUDGE0_API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );
      const result = response.data;
      const passed = result.status.id === 3;
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.stdout,
        passed: passed,
        status: result.status.description,
        time: result.time,
        memory: result.memory,
      });
      if (!passed) {
        allPassed = false;
      }
    }
    return {
      success: allPassed,
      error: allPassed ? null : "Некоторые тесты не прошли",
      details: results,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: null,
      executionTime: Date.now() - startTime,
    };
  }
}

async function executeJavaScriptLocally(code, testCases) {
  const vmModule = await import("vm");
  const vm = vmModule.default;
  const startTime = Date.now();
  const results = [];
  let allPassed = true;

  try {
    for (const testCase of testCases) {
      const sandbox = {
        input: testCase.input,
        result: null,
        console: {
          log: (...args) => {
            sandbox.result = args.join(" ");
          },
        },
      };

      const context = vm.createContext(sandbox);
      vm.runInContext(code, context, { timeout: 5000 });

      const passed =
        sandbox.result?.toString().trim() === testCase.expectedOutput?.toString().trim();

      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: sandbox.result,
        passed: passed,
      });

      if (!passed) {
        allPassed = false;
      }
    }

    return {
      success: allPassed,
      error: allPassed ? null : "Некоторые тесты не прошли",
      details: results,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: results,
      executionTime: Date.now() - startTime,
    };
  }
}

async function updateUserProgress(client, userId, lessonId, lesson) {
  try {
    const userLesson = await client
      .db("main")
      .collection("user_lessons")
      .findOne({
        userId: new ObjectId(userId),
        lessonId: new ObjectId(lessonId),
      });

    const isNewCompletion = !userLesson || userLesson.status !== "completed";

    if (isNewCompletion) {
      await client
        .db("main")
        .collection("user_lessons")
        .updateOne(
          {
            userId: new ObjectId(userId),
            lessonId: new ObjectId(lessonId),
          },
          {
            $set: {
              userId: new ObjectId(userId),
              lessonId: new ObjectId(lessonId),
              chapterId: lesson.chapterId ? new ObjectId(lesson.chapterId) : null,
              status: "completed",
              completedAt: new Date(),
              score: 100,
              bestAttempt: true,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );

      const user = await client
        .db("main")
        .collection("user")
        .findOne({ _id: new ObjectId(userId) });

      const currentProgress = user?.progress || 0;
      const newProgress = Math.min(currentProgress + 4, 100);
      const experienceGain = 50;
      const newExperience = (user?.experience || 0) + experienceGain;
      const newLevel = Math.floor(newExperience / 1000) + 1;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActivity = user?.lastActivityDate
        ? new Date(user.lastActivityDate)
        : null;
      const lastActivityDate = lastActivity ? new Date(lastActivity) : null;
      lastActivityDate?.setHours(0, 0, 0, 0);

      let newStreak = user?.streak || 0;
      if (!lastActivityDate || lastActivityDate.getTime() === today.getTime()) {
      } else if (
        lastActivityDate &&
        today.getTime() - lastActivityDate.getTime() === 86400000
      ) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      await client
        .db("main")
        .collection("user")
        .updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              progress: newProgress,
              experience: newExperience,
              level: newLevel,
              streak: newStreak,
              lastActivityDate: new Date(),
              updatedAt: new Date(),
            },
            $addToSet: { completedLessons: new ObjectId(lessonId) },
          }
        );

      await awardCurrency(client, userId, "coins", 10);

      await checkAchievements(client, userId, lessonId);
    }
  } catch (error) {
    console.error("Ошибка обновления прогресса:", error);
  }
}

async function awardCurrency(client, userId, currencyType, amount) {
  try {
    const currency = await client
      .db("main")
      .collection("currencies")
      .findOne({ type: currencyType });

    if (!currency) {
      return;
    }

    await client
      .db("main")
      .collection("user_wallets")
      .updateOne(
        { userId: new ObjectId(userId), currencyId: currency._id },
        {
          $inc: { balance: amount },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );

    await client.db("main").collection("wallet_transactions").insertOne({
      userId: new ObjectId(userId),
      currencyId: currency._id,
      type: "earn",
      amount,
      reason: "lesson_completion",
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Ошибка начисления валюты:", error);
  }
}

async function checkAchievements(client, userId, lessonId) {
  try {
    const user = await client
      .db("main")
      .collection("user")
      .findOne({ _id: new ObjectId(userId) });

    const completedCount = user?.completedLessons?.length || 0;
    const streak = user?.streak || 0;
    const level = user?.level || 1;

    const achievements = await client
      .db("main")
      .collection("achievements")
      .find({
        $or: [
          { condition: { type: "lessons_completed", value: completedCount } },
          { condition: { type: "streak", value: streak } },
          { condition: { type: "level", value: level } },
        ],
      })
      .toArray();

    for (const achievement of achievements) {
      const alreadyEarned = await client
        .db("main")
        .collection("user_achievements")
        .findOne({
          userId: new ObjectId(userId),
          achievementId: achievement._id,
        });

      if (!alreadyEarned) {
        await client.db("main").collection("user_achievements").insertOne({
          userId: new ObjectId(userId),
          achievementId: achievement._id,
          earnedAt: new Date(),
        });

        if (achievement.reward) {
          await awardCurrency(client, userId, achievement.reward.type, achievement.reward.amount);
        }
      }
    }
  } catch (error) {
    console.error("Ошибка проверки достижений:", error);
  }
}


