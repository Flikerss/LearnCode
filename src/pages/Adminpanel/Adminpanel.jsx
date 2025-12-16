import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Adminpanel.css";
import {
  fetchLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../api/lessons";

const INITIAL_FORM_STATE = {
  title: "",
  chapter: "",
  duration: "",
  theory: "",
  interactiveUrl: "",
  practiceTask: "",
  expectedOutput: "",
  languageId: "63",
  testCases: [{ input: "", expectedOutput: "" }],
};

function mapLessonToForm(lesson) {
  const practice = lesson?.practiceTask || {};
  const theoryBlocks = Array.isArray(lesson?.theory)
    ? lesson.theory.map((block) =>
        typeof block === "string" ? block : block?.body || ""
      )
    : [typeof lesson?.theory === "string" ? lesson.theory : ""];

  return {
    title: lesson?.title || "",
    chapter:
      typeof lesson?.chapter === "string"
        ? lesson.chapter
        : lesson?.chapter?.title || lesson?.chapterTitle || "",
    duration: lesson?.duration || "",
    theory: theoryBlocks.filter(Boolean).join("\n\n"),
    interactiveUrl: lesson?.interactiveUrl || "",
    practiceTask: practice?.description || "",
    expectedOutput: practice?.expectedOutput || "",
    languageId: practice?.languageId ? String(practice.languageId) : "63",
    testCases:
      Array.isArray(practice?.testCases) && practice.testCases.length > 0
        ? practice.testCases.map((test) => ({
            input: test?.input || "",
            expectedOutput: test?.expectedOutput || "",
          }))
        : [{ input: "", expectedOutput: "" }],
  };
}

function buildLessonPayload(formState) {
  const theoryCandidate = formState.theory.trim();
  const theoryBlocks = theoryCandidate
    ? theoryCandidate
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
    : [];

  const sanitizedTestCases = formState.testCases
    .map((test) => ({
      input: (test.input || "").trim(),
      expectedOutput: (test.expectedOutput || "").trim(),
    }))
    .filter((test) => test.input || test.expectedOutput);

  const chapterValue = formState.chapter.trim();
  const durationValue = formState.duration.trim();
  const interactiveUrlValue = formState.interactiveUrl.trim();
  const expectedOutputValue = formState.expectedOutput.trim();
  const language = Number.parseInt(formState.languageId, 10);

  const payload = {
    title: formState.title.trim(),
    theory:
      theoryBlocks.length > 1
        ? theoryBlocks
        : theoryBlocks.length === 1
        ? theoryBlocks[0]
        : theoryCandidate,
    interactiveUrl: interactiveUrlValue || null,
    practiceTask: formState.practiceTask.trim(),
    expectedOutput: expectedOutputValue || null,
    languageId: Number.isNaN(language) ? 63 : language,
    testCases: sanitizedTestCases,
    chapter: chapterValue || null,
    chapterTitle: chapterValue || null,
    duration: durationValue || null,
  };

  if (!payload.testCases.length) {
    payload.testCases = [];
  }

  return payload;
}

function getErrorMessage(error, fallback) {
  return (
    error?.body?.error || error?.body?.message || error?.message || fallback
  );
}

export default function AdminPanel() {
  const [lessons, setLessons] = useState([]);
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLessons();
      setLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Не удалось загрузить список уроков", err);
      setError(getErrorMessage(err, "Ошибка загрузки уроков"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const filteredLessons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return lessons;
    }
    return lessons.filter((lesson) => {
      const title = (lesson?.title || "").toLowerCase();
      const chapterCandidate =
        typeof lesson?.chapter === "string"
          ? lesson.chapter
          : lesson?.chapter?.title || lesson?.chapterTitle || "";
      const chapter = (chapterCandidate || "").toLowerCase();
      return title.includes(query) || chapter.includes(query);
    });
  }, [lessons, searchQuery]);

  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    setSelectedLessonId(null);
  }, []);

  const cancelEditing = useCallback(() => {
    resetForm();
    setError(null);
    setFeedback(null);
  }, [resetForm]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setFeedback(null);
  };

  const handleTestCaseChange = (index, field, value) => {
    setFormState((prev) => {
      const next = prev.testCases.map((testCase, idx) =>
        idx === index ? { ...testCase, [field]: value } : testCase
      );
      return { ...prev, testCases: next };
    });
  };

  const addTestCase = () => {
    setFormState((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", expectedOutput: "" }],
    }));
  };

  const removeTestCase = (index) => {
    setFormState((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, idx) => idx !== index),
    }));
  };

  const startEditLesson = (lesson) => {
    setSelectedLessonId(lesson.id);
    setFormState(mapLessonToForm(lesson));
    setFeedback(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!lessonId) {
      return;
    }
    const confirmed = window.confirm(
      "Удалить урок? Действие невозможно отменить."
    );
    if (!confirmed) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);
    try {
      await deleteLesson(lessonId);
      setFeedback("Урок удален");
      if (selectedLessonId === lessonId) {
        resetForm();
      }
      await loadLessons();
    } catch (err) {
      console.error("Ошибка при удалении урока", err);
      setError(getErrorMessage(err, "Не удалось удалить урок"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const payload = buildLessonPayload(formState);

      if (!payload.title || !payload.theory || !payload.practiceTask) {
        throw new Error(
          "Название, теория и описание практики обязательны для заполнения"
        );
      }

      if (selectedLessonId) {
        await updateLesson(selectedLessonId, payload);
        setFeedback("Урок обновлен");
      } else {
        await createLesson(payload);
        setFeedback("Урок создан");
      }

      await loadLessons();
      resetForm();
    } catch (err) {
      console.error("Ошибка при сохранении урока", err);
      setError(getErrorMessage(err, "Не удалось сохранить урок"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLessonTitle = useMemo(() => {
    if (!selectedLessonId) {
      return null;
    }
    const lesson = lessons.find((item) => item.id === selectedLessonId);
    return lesson?.title || null;
  }, [lessons, selectedLessonId]);

  return (
    <div className="admin-panel">
      <div className="admin-panel__layout">
        <section className="admin-panel__form" aria-label="Форма урока">
          <header className="admin-panel__header">
            <h1>Администрирование уроков</h1>
            {currentLessonTitle ? (
              <p className="admin-panel__subtitle">
                Редактирование: <strong>{currentLessonTitle}</strong>
              </p>
            ) : (
              <p className="admin-panel__subtitle">
                Создавайте и обновляйте учебные материалы в одном месте.
              </p>
            )}
          </header>

          {(error || feedback) && (
            <div
              className={`admin-panel__alert ${error ? "error" : "success"}`}
            >
              {error || feedback}
            </div>
          )}

          <form className="admin-panel__form-fields" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>Название *</span>
                <input
                  type="text"
                  name="title"
                  value={formState.title}
                  onChange={handleFieldChange}
                  placeholder="Введите название урока"
                  required
                />
              </label>

              <label className="form-field">
                <span>Глава</span>
                <input
                  type="text"
                  name="chapter"
                  value={formState.chapter}
                  onChange={handleFieldChange}
                  placeholder="Например, Основы JavaScript"
                />
              </label>

              <label className="form-field">
                <span>Длительность</span>
                <input
                  type="text"
                  name="duration"
                  value={formState.duration}
                  onChange={handleFieldChange}
                  placeholder="Например, 20 минут"
                />
              </label>

              <label className="form-field">
                <span>Ссылка на интерактив</span>
                <input
                  type="url"
                  name="interactiveUrl"
                  value={formState.interactiveUrl}
                  onChange={handleFieldChange}
                  placeholder="https://..."
                />
              </label>

              <label className="form-field">
                <span>Язык исполнения</span>
                <input
                  type="number"
                  min="1"
                  name="languageId"
                  value={formState.languageId}
                  onChange={handleFieldChange}
                />
              </label>
            </div>

            <label className="form-field">
              <span>Теория *</span>
              <textarea
                name="theory"
                value={formState.theory}
                onChange={handleFieldChange}
                placeholder={
                  "Разделяйте абзацы пустой строкой. Каждый абзац станет блоком."
                }
                rows={6}
                required
              />
            </label>

            <label className="form-field">
              <span>Практика *</span>
              <textarea
                name="practiceTask"
                value={formState.practiceTask}
                onChange={handleFieldChange}
                placeholder="Опишите практическое задание"
                rows={4}
                required
              />
            </label>

            <label className="form-field">
              <span>Ожидаемый вывод</span>
              <textarea
                name="expectedOutput"
                value={formState.expectedOutput}
                onChange={handleFieldChange}
                placeholder="Используется во время проверки решений"
                rows={3}
              />
            </label>

            <div className="testcases">
              <div className="testcases__header">
                <span>Тестовые случаи</span>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="btn-secondary"
                >
                  Добавить тест
                </button>
              </div>

              {formState.testCases.map((testCase, index) => (
                <div className="testcase" key={index}>
                  <label className="form-field">
                    <span>Ввод #{index + 1}</span>
                    <textarea
                      value={testCase.input}
                      onChange={(event) =>
                        handleTestCaseChange(index, "input", event.target.value)
                      }
                      rows={2}
                      placeholder="Данные, передаваемые в STDIN"
                    />
                  </label>
                  <label className="form-field">
                    <span>Ожидаемый вывод #{index + 1}</span>
                    <textarea
                      value={testCase.expectedOutput}
                      onChange={(event) =>
                        handleTestCaseChange(
                          index,
                          "expectedOutput",
                          event.target.value
                        )
                      }
                      rows={2}
                      placeholder="Результат, ожидаемый от программы"
                    />
                  </label>
                  {formState.testCases.length > 1 && (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => removeTestCase(index)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Сохранение..."
                  : selectedLessonId
                  ? "Обновить урок"
                  : "Создать урок"}
              </button>
              {selectedLessonId && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={cancelEditing}
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-panel__list" aria-label="Список уроков">
          <header className="list-header">
            <h2>Доступные уроки</h2>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск по названию или главе"
              className="search-input"
            />
          </header>

          {isLoading ? (
            <p className="placeholder">Загрузка уроков...</p>
          ) : filteredLessons.length === 0 ? (
            <p className="placeholder">Уроки не найдены</p>
          ) : (
            <ul className="lesson-list">
              {filteredLessons.map((lesson) => {
                const chapterInfo =
                  typeof lesson?.chapter === "string"
                    ? lesson.chapter
                    : lesson?.chapter?.title || lesson?.chapterTitle;
                return (
                  <li key={lesson.id} className="lesson-item">
                    <div className="lesson-item__info">
                      <h3>{lesson.title}</h3>
                      {chapterInfo && (
                        <p className="lesson-item__meta">
                          Глава: {chapterInfo}
                        </p>
                      )}
                      {lesson.updatedAt && (
                        <p className="lesson-item__meta">
                          Обновлено:{" "}
                          {new Date(lesson.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="lesson-item__actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => startEditLesson(lesson)}
                        disabled={isSubmitting}
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        disabled={isSubmitting}
                      >
                        Удалить
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
