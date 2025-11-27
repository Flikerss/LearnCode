# Схема базы данных LearnCode

## Коллекции MongoDB

### `users`
Основная информация о пользователях.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String, // "user", "admin", "moderator"
  avatar: String (URL или base64),
  progress: Number (0-100),
  experience: Number,
  level: Number,
  streak: Number,
  lastActivityDate: Date,
  completedLessons: [ObjectId],
  settings: {
    theme: String, // "light", "dark"
    language: String, // "ru", "en"
    notifications: Boolean
  },
  privacy: {
    showProfile: Boolean,
    showProgress: Boolean,
    showAchievements: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### `profiles`
Детальная информация профиля (отделена от аутентификации).

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  bio: String,
  socials: {
    github: String,
    telegram: String,
    email: String
  },
  preferences: Object, // Дополнительные настройки
  createdAt: Date,
  updatedAt: Date
}
```

### `lessons`
Контент уроков.

```javascript
{
  _id: ObjectId,
  title: String,
  theory: [{ body: String }], // Массив блоков теории
  chapterId: ObjectId (ref: chapters),
  chapterTitle: String,
  order: Number,
  duration: String,
  interactiveUrl: String,
  practiceTask: {
    description: String,
    expectedOutput: String,
    languageId: Number, // 63 для JavaScript
    testCases: [{
      input: String,
      expectedOutput: String
    }]
  },
  media: [{
    type: String, // "image", "video", "animation"
    url: String
  }],
  hints: [String],
  completedBy: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### `chapters` / `courses`
Группировка уроков по главам/курсам.

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  order: Number,
  lessons: [ObjectId], // ref: lessons
  unlockRequirements: {
    previousChapterId: ObjectId,
    minLevel: Number,
    minProgress: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### `user_lessons`
Индивидуальный прогресс по урокам.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  lessonId: ObjectId (ref: lessons),
  chapterId: ObjectId (ref: chapters),
  status: String, // "started", "completed", "skipped"
  score: Number (0-100),
  completedAt: Date,
  timeSpent: Number (миллисекунды),
  bestAttempt: Boolean,
  attempts: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### `achievements`
Каталог достижений.

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  icon: String (URL),
  condition: {
    type: String, // "lessons_completed", "streak", "level", "custom"
    value: Number
  },
  reward: {
    type: String, // "coins", "gems"
    amount: Number
  },
  createdAt: Date
}
```

### `user_achievements`
Связка пользователей и достижений.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  achievementId: ObjectId (ref: achievements),
  earnedAt: Date
}
```

### `currencies`
Описания валют.

```javascript
{
  _id: ObjectId,
  type: String, // "coins", "gems"
  name: String,
  description: String,
  exchangeRate: Number, // Курс обмена
  createdAt: Date
}
```

### `user_wallets`
Валютные балансы пользователей.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  currencyId: ObjectId (ref: currencies),
  balance: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### `wallet_transactions`
Журнал транзакций.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  currencyId: ObjectId (ref: currencies),
  type: String, // "earn", "spend", "exchange"
  amount: Number,
  reason: String, // "lesson_completion", "achievement", "purchase"
  createdAt: Date
}
```

### `submissions`
Попытки практических задач.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  lessonId: ObjectId (ref: lessons),
  code: String,
  languageId: Number,
  status: String, // "accepted", "rejected"
  testResults: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    status: String
  }],
  executionTime: Number,
  memoryUsed: Number,
  error: String,
  createdAt: Date
}
```

### `feedback`
Обращения и отзывы.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, optional),
  name: String,
  email: String,
  message: String,
  type: String, // "general", "bug", "feature", "review"
  rating: Number (1-5, optional),
  status: String, // "new", "read", "replied"
  createdAt: Date
}
```

### `content_blocks`
Динамический контент для CMS.

```javascript
{
  _id: ObjectId,
  type: String, // "about", "faq", "stats", "socials"
  data: Object, // Структура зависит от типа
  createdAt: Date,
  updatedAt: Date
}
```

### `notifications`
Уведомления пользователям.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, null для всех),
  type: String, // "feedback", "achievement", "lesson", "reminder"
  title: String,
  message: String,
  data: Object, // Дополнительные данные
  read: Boolean,
  createdAt: Date
}
```

### `sessions`
Refresh токены для аутентификации.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  refreshToken: String,
  expiresAt: Date,
  createdAt: Date
}
```

## Индексы (рекомендуемые)

```javascript
// users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// lessons
db.lessons.createIndex({ chapterId: 1 });
db.lessons.createIndex({ order: 1 });

// user_lessons
db.user_lessons.createIndex({ userId: 1, lessonId: 1 }, { unique: true });
db.user_lessons.createIndex({ userId: 1, status: 1 });

// submissions
db.submissions.createIndex({ userId: 1, lessonId: 1 });
db.submissions.createIndex({ createdAt: -1 });

// sessions
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ refreshToken: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```


