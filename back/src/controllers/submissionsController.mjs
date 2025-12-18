import { ObjectId } from "mongodb";

export default (client, JUDGE0_URL, JUDGE0_API_KEY) => {
  const createSubmission = async (req, res) => {
    try {
      const { lessonId, code, languageId } = req.body;
      const { userId } = req.user || {};

      if (!lessonId || !code) {
        return res.status(400).json({ error: "lessonId и code обязательны" });
      }

      const lesson = await client
        .db("main")
        .collection("lessons")
        .findOne({ _id: new ObjectId(lessonId) });

      if (!lesson) {
        return res.status(404).json({ error: "Урок не найден" });
      }

      // Получаем тестовые случаи из урока
      const testCases = lesson.practiceTask?.testCases || [];
      
      // Если нет тестовых случаев, возвращаем ошибку
      if (!Array.isArray(testCases) || testCases.length === 0) {
        return res.status(400).json({ 
          error: "Урок не содержит тестовых случаев для проверки решения. Обратитесь к администратору.",
          success: false 
        });
      }

      const executionResult = await executeCode(
        code,
        languageId || lesson.practiceTask?.languageId || 63,
        testCases,
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
    } catch (error) {
      console.error("Ошибка создания submission:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const getSubmissions = async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Ошибка получения submissions:", error);
      res.status(500).json({ error: error.message });
    }
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
  
  // Если нет тестовых случаев, код не должен приниматься
  if (!Array.isArray(testCases) || testCases.length === 0) {
    return {
      success: false,
      error: "Для проверки решения необходимы тестовые случаи. Обратитесь к администратору.",
      details: [],
      executionTime: Date.now() - startTime,
    };
  }

  try {
    const results = [];
    let allPassed = true;

    for (const testCase of testCases) {
      // Проверяем, что тест-кейс валиден
      if (!testCase.hasOwnProperty('expectedOutput')) {
        results.push({
          input: testCase.input || null,
          expectedOutput: null,
          actualOutput: null,
          passed: false,
          status: "Invalid test case",
          error: "Тестовый случай не содержит ожидаемого результата",
        });
        allPassed = false;
        continue;
      }

      try {
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
            timeout: 10000, // 10 секунд таймаут
          }
        );
        const result = response.data;
        
        // Статус 3 = Accepted, статус 4 = Wrong Answer
        const passed = result.status.id === 3;
        const actualOutput = result.stdout || result.stderr || "";
        
        results.push({
          input: testCase.input ?? "—",
          expectedOutput: testCase.expectedOutput ?? "—",
          actualOutput: actualOutput.trim() || "—",
          passed: passed,
          status: result.status.description || "Unknown",
          time: result.time,
          memory: result.memory,
          error: result.stderr || (result.status.id !== 3 ? result.status.description : null),
        });
        
        if (!passed) {
          allPassed = false;
        }
      } catch (apiError) {
        results.push({
          input: testCase.input ?? "—",
          expectedOutput: testCase.expectedOutput ?? "—",
          actualOutput: null,
          passed: false,
          status: "Error",
          error: apiError.response?.data?.error || apiError.message || "Ошибка выполнения кода",
        });
        allPassed = false;
      }
    }
    
    return {
      success: allPassed && results.length > 0,
      error: allPassed ? null : "Некоторые тесты не прошли. Проверьте решение.",
      details: results,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Ошибка выполнения кода",
      details: [],
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

  // Если нет тестовых случаев, код не должен приниматься
  if (!Array.isArray(testCases) || testCases.length === 0) {
    return {
      success: false,
      error: "Для проверки решения необходимы тестовые случаи. Обратитесь к администратору.",
      details: [],
      executionTime: Date.now() - startTime,
    };
  }

  try {
    for (const testCase of testCases) {
      // Проверяем, что тест-кейс имеет необходимые поля
      if (!testCase.hasOwnProperty('expectedOutput')) {
        results.push({
          input: testCase.input || null,
          expectedOutput: null,
          actualOutput: null,
          passed: false,
          error: "Тестовый случай не содержит ожидаемого результата",
        });
        allPassed = false;
        continue;
      }

      const sandbox = {
        input: testCase.input,
        result: null,
        output: null,
        console: {
          log: (...args) => {
            sandbox.result = args.join(" ");
            sandbox.output = args.join(" ");
          },
        },
      };

      try {
        const context = vm.createContext(sandbox);
        vm.runInContext(code, context, { timeout: 5000 });

        // Проверяем результат через console.log или через return (если есть функция solution)
        let actualOutput = sandbox.result || sandbox.output;
        
        // Если код содержит функцию solution, пытаемся её вызвать
        if (code.includes('function solution') || code.includes('const solution') || code.includes('let solution')) {
          try {
            const solutionSandbox = {
              input: testCase.input,
              result: null,
              console: {
                log: (...args) => {
                  solutionSandbox.result = args.join(" ");
                },
              },
            };
            const solutionContext = vm.createContext(solutionSandbox);
            // Выполняем код и затем вызываем solution если она есть
            vm.runInContext(code, solutionContext, { timeout: 5000 });
            
            // Пытаемся вызвать solution(testCase.input)
            const callCode = `solution(${JSON.stringify(testCase.input)})`;
            try {
              const callContext = vm.createContext({ ...solutionSandbox, solution: solutionContext.solution });
              vm.runInContext(`result = ${callCode}`, callContext, { timeout: 2000 });
              if (callContext.result !== undefined) {
                actualOutput = String(callContext.result);
              }
            } catch (e) {
              // Если не удалось вызвать solution, используем console.log результат
            }
          } catch (e) {
            // Игнорируем ошибки при попытке вызвать solution
          }
        }

        const expected = String(testCase.expectedOutput || "").trim();
        const actual = String(actualOutput || "").trim();
        const passed = actual === expected;

        results.push({
          input: testCase.input ?? "—",
          expectedOutput: expected || "—",
          actualOutput: actual || "—",
          passed: passed,
        });

        if (!passed) {
          allPassed = false;
        }
      } catch (execError) {
        results.push({
          input: testCase.input ?? "—",
          expectedOutput: testCase.expectedOutput ?? "—",
          actualOutput: null,
          passed: false,
          error: execError.message || "Ошибка выполнения кода",
        });
        allPassed = false;
      }
    }

    return {
      success: allPassed && results.length > 0,
      error: allPassed ? null : "Некоторые тесты не прошли. Проверьте решение.",
      details: results,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Ошибка выполнения кода",
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


