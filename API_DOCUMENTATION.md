# API Документация LearnCode

## Базовый URL
```
http://localhost:3000
```

## Аутентификация
Большинство endpoints требуют JWT токен, который передается:
- В cookie `token` (httpOnly)
- В заголовке `Authorization: Bearer <token>`

Refresh токен передается в cookie `refreshToken`.

---

## Пользователи (`/user`)

### `POST /user`
Регистрация нового пользователя.

**Тело запроса:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "password123"
}
```

**Ответ:** `201 Created`
```json
{
  "message": "Пользователь 'Иван Иванов' успешно зарегистрировался",
  "user": { ... }
}
```

### `POST /user/login`
Вход в систему.

**Тело запроса:**
```json
{
  "email": "ivan@example.com",
  "password": "password123"
}
```

**Ответ:** `200 OK`
```json
{
  "message": "Пользователь 'Иван Иванов' успешно вошел в аккаунт",
  "user": { ... }
}
```

### `POST /user/logout`
Выход из системы. Работает даже с просроченным токеном.

**Ответ:** `200 OK`

### `GET /user/profile`
Получить профиль текущего пользователя.

**Требует авторизации:** Да

**Ответ:** `200 OK`
```json
{
  "user": {
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "avatar": "https://...",
    "currency": { "coins": 100, "gems": 50 },
    "achievements": [...],
    "progressSummary": [...],
    "streak": 5,
    "lastLesson": { "id": "...", "title": "..." },
    "settings": { ... },
    "completedLessonsCount": 10
  }
}
```

### `GET /user/settings`
Получить настройки пользователя.

**Требует авторизации:** Да

### `PUT /user/settings`
Обновить настройки.

**Тело запроса:**
```json
{
  "settings": { "theme": "dark", "language": "en" },
  "privacy": { "showProfile": false }
}
```

### `PUT /user/avatar`
Обновить аватар.

**Тело запроса:**
```json
{
  "avatar": "https://example.com/avatar.jpg"
}
```

### `PUT /user/password`
Изменить пароль.

**Тело запроса:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

### `GET /user/preferences`
Получить предпочтения профиля.

### `PUT /user/preferences`
Обновить предпочтения.

**Тело запроса:**
```json
{
  "bio": "О себе...",
  "socials": { "github": "username", "telegram": "@username" },
  "preferences": { ... }
}
```

### `GET /user/progress`
Получить прогресс обучения.

**Ответ:**
```json
{
  "overallProgress": 45,
  "experience": 500,
  "level": 2,
  "streak": 5,
  "lastActivityDate": "2024-01-15T10:00:00Z",
  "lastLessons": [...],
  "chapterProgress": [...]
}
```

### `GET /user/achievements`
Получить достижения пользователя.

---

## Уроки (`/lessons`)

### `GET /lessons`
Получить все уроки (публичный endpoint).

**Query параметры:**
- `chapterId` - фильтр по главе
- `limit` - лимит результатов
- `offset` - смещение для пагинации

**Ответ:** `200 OK`
```json
[
  {
    "id": "...",
    "title": "Введение в JavaScript",
    "chapter": { "id": "...", "title": "Глава 1" },
    "duration": "5 мин",
    "isCompleted": false
  }
]
```

### `GET /lessons/:id`
Получить урок по ID.

**Ответ:** `200 OK`

### `GET /lessons/:lessonId/content`
Получить контент урока (теория, практика, медиа).

**Ответ:**
```json
{
  "theory": [...],
  "practice": { ... },
  "interactiveUrl": "...",
  "media": [...]
}
```

### `POST /lessons/:lessonId/completion`
Отметить урок как завершенный вручную.

**Требует авторизации:** Да

### `POST /lessons/:lessonId/submit`
Отправить решение задачи.

**Требует авторизации:** Да

**Тело запроса:**
```json
{
  "code": "console.log('Hello');",
  "languageId": 63
}
```

**Ответ:**
```json
{
  "submission": {
    "id": "...",
    "status": "accepted",
    "testResults": [...]
  },
  "success": true
}
```

### `POST /lessons`
Создать урок (только для админов).

### `PUT /lessons/:id`
Обновить урок (только для админов).

### `DELETE /lessons/:id`
Удалить урок (только для админов).

---

## Отправка кода (`/submissions`)

### `POST /submissions`
Отправить код на проверку.

**Требует авторизации:** Да

**Тело запроса:**
```json
{
  "lessonId": "...",
  "code": "console.log('Hello');",
  "languageId": 63
}
```

**Ответ:** `201 Created`
```json
{
  "submission": {
    "id": "...",
    "status": "accepted",
    "testResults": [...],
    "error": null
  },
  "success": true
}
```

### `GET /submissions`
Получить историю отправок.

**Query параметры:**
- `lessonId` - фильтр по уроку
- `limit` - лимит
- `offset` - смещение

---

## Достижения (`/achievements`)

### `GET /achievements`
Получить каталог всех достижений.

**Ответ:** `200 OK`
```json
{
  "achievements": [
    {
      "id": "...",
      "title": "Первые шаги",
      "description": "Завершите первый урок",
      "icon": "...",
      "reward": { "type": "coins", "amount": 10 }
    }
  ]
}
```

### `GET /achievements/:id`
Получить достижение по ID.

---

## Кошелек (`/wallet`)

### `GET /wallet`
Получить баланс валют.

**Требует авторизации:** Да

**Ответ:**
```json
{
  "balance": {
    "coins": { "amount": 100, "currencyName": "Монеты" },
    "gems": { "amount": 50, "currencyName": "Кристаллы" }
  }
}
```

### `GET /wallet/transactions`
Получить историю транзакций.

**Query параметры:**
- `limit` - лимит
- `offset` - смещение

### `POST /wallet/earn`
Начислить валюту (для тестирования или админ-панели).

**Тело запроса:**
```json
{
  "currencyType": "coins",
  "amount": 10,
  "reason": "manual"
}
```

---

## Контент (`/content`)

### `GET /content/:type`
Получить динамический контент.

**Типы:** `about`, `faq`, `stats`, `socials`

**Ответ:**
```json
{
  "content": { ... }
}
```

### `PUT /content/:type`
Обновить контент (только для админов).

---

## Обратная связь (`/feedback`)

### `POST /feedback`
Отправить обращение.

**Тело запроса:**
```json
{
  "name": "Иван",
  "email": "ivan@example.com",
  "message": "Сообщение",
  "type": "general",
  "rating": 5
}
```

**Ответ:** `201 Created`
```json
{
  "message": "Обращение успешно отправлено",
  "feedbackId": "..."
}
```

### `GET /feedback`
Получить обращения пользователя.

---

## Коды ошибок

- `200` - Успешно
- `201` - Создано
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `409` - Конфликт (например, email уже существует)
- `500` - Внутренняя ошибка сервера

---

## Защита Judge0 API

Ключи Judge0 хранятся в переменных окружения и не передаются клиенту. Если ключ не указан, используется локальное выполнение JavaScript через Node.js VM (только для JavaScript).

## Лимиты и очереди

Рекомендуется добавить:
- Rate limiting для API endpoints
- Очередь для выполнения кода (например, Bull/BullMQ)
- Лимиты на количество запросов к Judge0 API


