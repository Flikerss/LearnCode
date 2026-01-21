# Backend tests overview

## Набор тестов
- `tests/setup.mjs` — инициализация `mongodb-memory-server`, подключение клиента и очистка коллекций между тестами.
- `tests/database/database.test.mjs` — CRUD для основных коллекций: `user`, `lessons`, `submissions`, `sessions`, `user_lessons`, `achievements`, `user_achievements`, `chapters`.
- `tests/controllers/userController.test.mjs` — регистрации/дубликаты, вход с bcrypt, выход (очистка сессий и cookies), профиль с последним уроком, обновление прогресса.
- `tests/controllers/lessonsController.test.mjs` — создание урока с нормализацией теории, `getLesson` c флагом `isCompleted`, `getAllLessons` с признаком завершения.
- `tests/controllers/submissionsController.test.mjs` — создание submission (успех, прогресс и `user_lessons`), ошибка при отсутствии тесткейсов, выборка пользовательских submissions с пагинацией.
- `jest.config.js` — CommonJS-конфиг для Jest; `package.json` скрипты используют `cross-env NODE_OPTIONS=--experimental-vm-modules jest` (совместимо с Windows).

## Как запустить
```
cmd /c "cd back\back && npm test"
```

## Что покрыто
- Подключение к тестовой MongoDB и изоляция данных между тестами.
- Ключевые CRUD-операции БД.
- Основные пользовательские сценарии: регистрация, логин/логаут, профиль, прогресс.
- Основные сценарии уроков: создание, получение, список с меткой завершения.
- Основной флоу отправки решений: успешный сабмит с обновлением прогресса, валидация отсутствия тесткейсов, получение списка сабмитов.

## Что можно добавить
- Негативные кейсы контроллеров (валидация входных данных, 404 для отсутствующих сущностей).
- Ошибочные сценарии интеграции с Judge0 (таймауты/ошибки API) и локального исполнения кода.
- Тесты middleware (`authMiddleware`): refresh-token, просроченные токены, `requireRole`.
- Логика кошельков/достижений (`walletController`, `achievementsController`) и уведомлений/feedback.
- Конкурентные обновления прогресса/кошельков (идемпотентность).

