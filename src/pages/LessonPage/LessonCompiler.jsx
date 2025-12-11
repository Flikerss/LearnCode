import React, { useEffect, useState } from "react";
import { createSubmission } from "../../api/submissions";
import "./LessonCompiler.css";

const LANGUAGE_MAP = {
  63: {
    label: "JavaScript (Node.js)",
    snippet: `function solution(input) {\n  // TODO: ваш код\n  return input;\n}\n\nconsole.log(solution("Hello"));\n`,
  },
};

export default function LessonCompiler({ lesson, lessonId }) {
  const effectiveLessonId = lesson?.id || lessonId;
  const defaultLanguage = lesson?.practiceTask?.languageId || 63;
  const [languageId, setLanguageId] = useState(defaultLanguage);
  const [code, setCode] = useState(
    () =>
      LANGUAGE_MAP[defaultLanguage]?.snippet || "// Напишите решение здесь\n"
  );
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLanguageId(defaultLanguage);
    setCode(
      LANGUAGE_MAP[defaultLanguage]?.snippet || "// Напишите решение здесь\n"
    );
    setResult(null);
    setError(null);
  }, [defaultLanguage, effectiveLessonId]);
                                                                  
  async function handleRun() {
    if (!code.trim() || !effectiveLessonId) {
      setError("Добавьте код и попробуйте снова");
      return;
    }
    setIsRunning(true);
    setError(null);
    try {
      const payload = {
        lessonId: effectiveLessonId,
        code,
        languageId,
      };
      const data = await createSubmission(payload);
      setResult({
        status: data?.submission?.status,
        testResults:
          data?.submission?.testResults || data?.executionDetails || [],
        error: data?.submission?.error,
        success: data?.success,
      });
    } catch (err) {
      setError(err?.message || "Не удалось отправить решение");
    } finally {
      setIsRunning(false);
    }
  }

  const status =
    result?.status ||
    (result?.success === false ? "error" : result?.success ? "success" : null);
  const testResults = result?.testResults;

  const availableLanguageIds = Array.from(new Set([defaultLanguage]))
    .filter(Boolean)
    .map((id) => Number(id));
  const languageDisabled = availableLanguageIds.length === 1;

  return (
    <section className="lesson-compiler">
      <div className="compiler-header">
        <div className="compiler-meta">
          <span>{lesson?.title || "Компилятор"}</span>
        </div>
        <div className="compiler-lang">
          <select
            value={languageId}
            onChange={(e) => setLanguageId(Number(e.target.value))}
            disabled={languageDisabled}
          >
            {availableLanguageIds.map((id) => (
              <option key={id} value={id}>
                {LANGUAGE_MAP[id]?.label || `Language ${id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="compiler-body">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="compiler-editor"
          aria-label="Редактор кода"
        />
      </div>

      <div className="compiler-actions">
        <button type="button" onClick={handleRun} disabled={isRunning}>
          {isRunning ? "Выполняется..." : "Отправить решение"}
        </button>
        {error && <span className="compiler-error">{error}</span>}
      </div>

      {status && (
        <div className={`compiler-status compiler-status--${status}`}>
          <strong>Результат:</strong>{" "}
          {status === "accepted" || status === "success"
            ? "✔ Решение принято"
            : "✖ Ошибка"}
        </div>
      )}

      {Array.isArray(testResults) && testResults.length > 0 && (
        <div className="compiler-results">
          <div className="results-header">
            <strong>Тесты</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Ввод</th>
                <th>Ожидалось</th>
                <th>Фактически</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((test, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{test.input ?? "—"}</td>
                  <td>{test.expectedOutput ?? "—"}</td>
                  <td>{test.actualOutput ?? test.stdout ?? "—"}</td>
                  <td
                    className={
                      test.passed || test.status === "Accepted"
                        ? "passed"
                        : "failed"
                    }
                  >
                    {test.passed || test.status === "Accepted"
                      ? "Passed"
                      : test.status || "Failed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
