import { ObjectId } from 'mongodb';

const PROGRESS_INCREMENT = 4;

export default (client, JUDGE0_URL, JUDGE0_API_KEY) => {
    // --- CRUD ---
    const createLesson = async (req, res) => {
        const { title, theory, interactiveUrl, practiceTask, expectedOutput, languageId, testCases } = req.body;
        try {
            if (!title || !theory || !practiceTask) {
                return res.status(400).json({ error: 'Название, теория и практика обязательны' });
            }

            const newLesson = {
                title,
                theory,
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
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const getAllLessons = async (req, res) => {
        try {
            const lessons = await client.db("main").collection("lessons").find({}).toArray();
            res.status(200).json(lessons);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const getLesson = async (req, res) => {
        const { id } = req.params;
        try {
            const lesson = await client.db("main").collection("lessons").findOne({ _id: new ObjectId(id) });
            if (!lesson) {
                return res.status(404).json({ message: 'Урок не найден' });
            }
            res.status(200).json(lesson);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const updateLesson = async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        try {
            updateData.updatedAt = new Date();

            const result = await client.db("main").collection("lessons").updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            if (result.modifiedCount === 0) {
                return res.status(404).json({ message: 'Урок не найден' });
            }

            res.status(200).json({ message: 'Урок обновлен', lessonId: id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const deleteLesson = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await client.db("main").collection("lessons").deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Урок не найден' });
            }
            res.status(200).json({ message: 'Урок удален', lessonId: id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // --- SUBMIT PRACTICE ---
    const submitLesson = async (req, res) => {
        const { lessonId } = req.params;
        const { code } = req.body;
        const userId = req.user.userId;

        try {
            const lesson = await client.db("main").collection("lessons").findOne({ _id: new ObjectId(lessonId) });
            if (!lesson) {
                return res.status(404).json({ error: 'Урок не найден' });
            }
            if (!code) {
                return res.status(400).json({ error: 'Код решения обязателен' });
            }

            const executionResult = await executeCode(
                code,
                lesson.practiceTask.languageId,
                lesson.practiceTask.testCases,
                JUDGE0_URL,
                JUDGE0_API_KEY
            );

            if (executionResult.success) {
                const alreadyCompleted = lesson.completedBy.some(
                    id => id.toString() === userId
                );

                let progress = null;
                if (!alreadyCompleted) {
                    const user = await client.db("main").collection("user").findOne({ _id: new ObjectId(userId) });

                    const currentProgress = typeof user.progress === 'string'
                        ? parseInt(user.progress.replace('%', '')) || 0
                        : user.progress || 0;

                    const newProgress = Math.min(currentProgress + PROGRESS_INCREMENT, 100);

                    await client.db("main").collection("user").updateOne(
                        { _id: new ObjectId(userId) },
                        { $set: { progress: newProgress } }
                    );

                    await client.db("main").collection("lessons").updateOne(
                        { _id: new ObjectId(lessonId) },
                        { $addToSet: { completedBy: new ObjectId(userId) } }
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
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // ----------------------------------------------------
    // --- Вспомогательные функции ---
    // ----------------------------------------------------

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

    return {
        createLesson,
        getAllLessons,
        getLesson,
        updateLesson,
        deleteLesson,
        submitLesson,
    };
};
