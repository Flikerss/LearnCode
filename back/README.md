# LearnCode Backend

## 📌 Описание
Backend сервер для платформы LearnCode — интерактивной обучалки программированию.

## 🛠 Стек технологий
- **Node.js** с Express
- **MongoDB** (нативный драйвер)
- **JWT** для аутентификации
- **bcrypt** для хеширования паролей
- **Judge0 API** (опционально) для выполнения кода

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env` в корне проекта:
```env
DB_CONNECTION=mongodb://localhost:27017/learncode
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Опционально: Judge0 API для выполнения кода
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key_here
```

### 3. Запуск сервера
```bash
npm start
```

Для разработки с автоперезагрузкой:
```bash
npm run dev
```

## 📡 API Endpoints

### Пользователи (`/user`)
- `POST /user` - Регистрация нового пользователя
- `POST /user/login` - Вход в систему
- `POST /user/logout` - Выход из системы (требует авторизации)
- `GET /user/profile` - Получить профиль текущего пользователя (требует авторизации)
- `GET /user` - Получить всех пользователей (требует авторизации)
- `PUT /user/:id` - Обновить имя пользователя (требует авторизации)
- `PUT /user/:id/progress/:lessonId` - Обновить прогресс пользователя (требует авторизации)

### Уроки (`/lessons`)
- `GET /lessons` - Получить все уроки (публичный, опциональная авторизация)
- `GET /lessons/:id` - Получить урок по ID (публичный, опциональная авторизация)
- `POST /lessons` - Создать новый урок (требует авторизации)
- `PUT /lessons/:id` - Обновить урок (требует авторизации)
- `DELETE /lessons/:id` - Удалить урок (требует авторизации)
- `POST /lessons/:lessonId/submit` - Отправить решение задачи (требует авторизации)

## 🔐 Аутентификация
Аутентификация происходит через JWT токены, которые передаются:
- В cookie `token` (httpOnly)
- В заголовке `Authorization: Bearer <token>`

## 📊 Структура данных

### Пользователь
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (хешированный),
  progress: Number (0-100),
  completedLessons: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Урок
```javascript
{
  _id: ObjectId,
  title: String,
  theory: [{ body: String }],
  chapter: String,
  chapterTitle: String,
  duration: String,
  interactiveUrl: String,
  practiceTask: {
    description: String,
    expectedOutput: String,
    languageId: Number,
    testCases: [{ input: String, expectedOutput: String }]
  },
  completedBy: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Особенности
- Хеширование паролей с помощью bcrypt
- Опциональная авторизация для публичных endpoints
- Локальное выполнение JavaScript кода (без Judge0)
- Поддержка Judge0 API для других языков программирования
- Автоматическое обновление прогресса при завершении урока
- Обработка ошибок и валидация данных



