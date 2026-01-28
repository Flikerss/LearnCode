import { ObjectId } from 'mongodb';
import AppError from '../errors/AppError.mjs';

const PROGRESS_INCREMENT = 4;

export default (client, JUDGE0_URL, JUDGE0_API_KEY) => {
    const createLesson = async (req, res) => {
        const {
            title,
            theory,
            interactiveUrl,
            practiceTask,
            expectedOutput,
            languageId,
            testCases,
            chapter,
            chapterTitle,
            duration
        } = req.body;
        if (!title || !theory || !practiceTask) {
            throw AppError.badRequest('Название, теория и практика обязательны');
        }

        let normalizedTheory = theory;
        if (typeof theory === 'string') {
            normalizedTheory = [{ body: theory }];
        } else if (Array.isArray(theory) && theory.length > 0 && typeof theory[0] === 'string') {
            normalizedTheory = theory.map(t => ({ body: t }));
        }

        const newLesson = {
            title,
            theory: normalizedTheory,
            chapter: chapter || chapterTitle || "",
            chapterTitle: chapterTitle || chapter || "",
            duration: duration || null,
            interactiveUrl: interactiveUrl || null,
            practiceTask: {
                description: practiceTask,
                expectedOutput: expectedOutput || null,
                languageId: languageId || 63,
                testCases: testCases || []
            },
            completedBy: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await client.db("main").collection("lessons").insertOne(newLesson);
        newLesson._id = result.insertedId;

        res.status(201).json({
            message: 'Урок успешно создан',
            lesson: newLesson
        });
    };

    const getAllLessons = async (req, res) => {
        const { userId } = req.user || {};
        const { chapterId, limit, offset } = req.query;

        const query = {};
        if (chapterId) {
            query.chapterId = new ObjectId(chapterId);
        }

        const lessonsQuery = client.db("main").collection("lessons").find(query).sort({ order: 1, createdAt: 1 });

        if (limit) {
            lessonsQuery.limit(parseInt(limit));
        }
        if (offset) {
            lessonsQuery.skip(parseInt(offset));
        }

        const lessons = await lessonsQuery.toArray();

        let completedLessons = [];
        if (userId) {
            const user = await client.db("main").collection("user").findOne(
                { _id: new ObjectId(userId) },
                { projection: { completedLessons: 1 } }
            );
            completedLessons = user?.completedLessons?.map(id => id.toString()) || [];
        }

        const chapters = await client.db("main").collection("chapters").find({}).toArray();
        const chaptersMap = chapters.reduce((acc, ch) => {
            acc[ch._id.toString()] = ch;
            return acc;
        }, {});

        const lessonsWithStatus = lessons.map(lesson => {
            const chapter = lesson.chapterId ? chaptersMap[lesson.chapterId.toString()] : null;
            return {
                ...lesson,
                id: lesson._id.toString(),
                chapter: chapter ? {
                    id: chapter._id.toString(),
                    title: chapter.title,
                    description: chapter.description,
                } : null,
                isCompleted: completedLessons.includes(lesson._id.toString()),
            };
        });

        res.status(200).json(lessonsWithStatus);
    };

    const getLesson = async (req, res) => {
        const { id } = req.params;
        const lesson = await client.db("main").collection("lessons").findOne({ _id: new ObjectId(id) });
        if (!lesson) {
            throw AppError.notFound('Урок не найден');
        }

        const { userId } = req.user || {};
        let isCompleted = false;
        if (userId) {
            const user = await client.db("main").collection("user").findOne(
                { _id: new ObjectId(userId) },
                { projection: { completedLessons: 1 } }
            );
            isCompleted = user?.completedLessons?.some(
                completedId => completedId.toString() === id
            ) || false;
        }

        res.status(200).json({
            ...lesson,
            isCompleted,
        });
    };

    const updateLesson = async (req, res) => {
        const { id } = req.params;
        const updateData = { ...req.body };
        delete updateData._id;
        updateData.updatedAt = new Date();

        if (updateData.theory) {
            if (typeof updateData.theory === 'string') {
                updateData.theory = [{ body: updateData.theory }];
            } else if (Array.isArray(updateData.theory) && updateData.theory.length > 0 && typeof updateData.theory[0] === 'string') {
                updateData.theory = updateData.theory.map(t => ({ body: t }));
            }
        }

        const result = await client.db("main").collection("lessons").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            throw AppError.notFound('Урок не найден');
        }

        res.status(200).json({ message: 'Урок обновлен', lessonId: id });
    };

    const deleteLesson = async (req, res) => {
        const { id } = req.params;
        await client.db("main").collection("user").updateMany(
            {},
            { $pull: { completedLessons: new ObjectId(id) } }
        );

        const result = await client.db("main").collection("lessons").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            throw AppError.notFound('Урок не найден');
        }
        res.status(200).json({ message: 'Урок удален', lessonId: id });
    };

    const submitLesson = async (req, res) => {
        const { lessonId } = req.params;
        const { code } = req.body;
        const userId = req.user.userId;

        const lesson = await client.db("main").collection("lessons").findOne({ _id: new ObjectId(lessonId) });
        if (!lesson) {
            throw AppError.notFound('Урок не найден');
        }
        if (!code) {
            throw AppError.badRequest('Код решения обязателен');
        }

        const executionResult = await executeCode(
            code,
            lesson.practiceTask.languageId,
            lesson.practiceTask.testCases,
            JUDGE0_URL,
            JUDGE0_API_KEY
        );

        if (executionResult.success) {
            const user = await client.db("main").collection("user").findOne({ _id: new ObjectId(userId) });
            const completedLessons = user?.completedLessons || [];
            const alreadyCompleted = completedLessons.some(
                id => id.toString() === lessonId
            );

            let progress = null;
            if (!alreadyCompleted) {
                const currentProgress = typeof user.progress === 'string'
                    ? parseInt(user.progress.replace('%', '')) || 0
                    : user.progress || 0;

                const newProgress = Math.min(currentProgress + PROGRESS_INCREMENT, 100);

                await client.db("main").collection("user").updateOne(
                    { _id: new ObjectId(userId) },
                    {
                        $set: {
                            progress: newProgress,
                            updatedAt: new Date()
                        },
                        $addToSet: { completedLessons: new ObjectId(lessonId) }
                    }
                );

                await client.db("main").collection("lessons").updateOne(
                    { _id: new ObjectId(lessonId) },
                    {
                        $addToSet: { completedBy: new ObjectId(userId) },
                        $set: { updatedAt: new Date() }
                    }
                );
                progress = { old: currentProgress, new: newProgress };
            }

            res.status(200).json({
                status: 'success',
                message: 'Задача решена правильно!',
                interactiveUrl: lesson.interactiveUrl,
                progress,
                executionDetails: executionResult.details
            });
        } else {
            res.status(200).json({
                status: 'error',
                message: 'Решение неверно',
                error: executionResult.error,
                executionDetails: executionResult.details
            });
        }
    };


    async function executeCode(code, languageId, testCases, JUDGE0_URL, JUDGE0_API_KEY) {
        try {
            if (JUDGE0_API_KEY) {
                return await executeWithJudge0(code, languageId, testCases, JUDGE0_URL, JUDGE0_API_KEY);
            }
            if (languageId === 63) {
                return await executeJavaScriptLocally(code, testCases);
            }
            throw new Error('Сервис выполнения кода не настроен');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: null
            };
        }
    }

    async function executeWithJudge0(code, languageId, testCases, JUDGE0_URL, JUDGE0_API_KEY) {
        const axios = await import('axios');
        try {
            const results = [];
            let allPassed = true;

            for (const testCase of testCases) {
                const response = await axios.default.post(
                    `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
                    {
                        source_code: code,
                        language_id: languageId,
                        stdin: testCase.input || '',
                        expected_output: testCase.expectedOutput
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-RapidAPI-Key': JUDGE0_API_KEY,
                            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                        }
                    }
                );
                const result = response.data;
                const passed = result.status.id === 3;
                results.push({
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: result.stdout,
                    passed: passed,
                    status: result.status.description
                });
                if (!passed) {
                    allPassed = false;
                }
            }
            return {
                success: allPassed,
                error: allPassed ? null : 'Некоторые тесты не прошли',
                details: results
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: null
            };
        }
    }

    async function executeJavaScriptLocally(code, testCases) {
        const vmModule = await import('vm');
        const vm = vmModule.default;
        const results = [];
        let allPassed = true;

        try {
            for (const testCase of testCases) {
                const sandbox = {
                    input: testCase.input,
                    result: null,
                    console: {
                        log: (...args) => {
                            sandbox.result = args.join(' ');
                        }
                    }
                };

                const context = vm.createContext(sandbox);
                vm.runInContext(code, context, { timeout: 5000 });

                const passed = sandbox.result?.toString().trim() === testCase.expectedOutput?.toString().trim();

                results.push({
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: sandbox.result,
                    passed: passed
                });

                if (!passed) {
                    allPassed = false;
                }
            }

            return {
                success: allPassed,
                error: allPassed ? null : 'Некоторые тесты не прошли',
                details: results
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: results
            };
        }
    }

    const getLessonContent = async (req, res) => {
        const { lessonId } = req.params;
        const lesson = await client.db("main").collection("lessons").findOne({ _id: new ObjectId(lessonId) });
        if (!lesson) {
            throw AppError.notFound('Урок не найден');
        }

        res.status(200).json({
            theory: lesson.theory,
            practice: lesson.practiceTask,
            interactiveUrl: lesson.interactiveUrl,
            media: lesson.media || [],
        });
    };

    const markLessonCompleted = async (req, res) => {
        const { lessonId } = req.params;
        const { userId } = req.user || {};
        if (!userId) {
            throw AppError.unauthorized("Необходимо авторизоваться");
        }

        const lesson = await client.db("main").collection("lessons").findOne({ _id: new ObjectId(lessonId) });
        if (!lesson) {
            throw AppError.notFound("Урок не найден");
        }

        await client.db("main").collection("user_lessons").updateOne(
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
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );

        await client.db("main").collection("user").updateOne(
            { _id: new ObjectId(userId) },
            {
                $addToSet: { completedLessons: new ObjectId(lessonId) },
                $set: { lastActivityDate: new Date(), updatedAt: new Date() },
            }
        );

        res.status(200).json({ message: "Урок отмечен как завершенный" });
    };

    return {
        createLesson,
        getAllLessons,
        getLesson,
        updateLesson,
        deleteLesson,
        submitLesson,
        getLessonContent,
        markLessonCompleted,
    };
};
