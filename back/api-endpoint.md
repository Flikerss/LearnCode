POST /user	Проверяет name, email, password (пароль ≥ 6 символов). Проверяет уникальность email. Хеширует пароль (bcrypt), создаёт документ в user. Генерирует access- и refresh-JWT, создаёт сессию в sessions, выставляет cookie token и refreshToken. В ответе - сообщение и пользователь без пароля.
POST /user/login	Проверяет email и password. Ищет пользователя по email, проверяет пароль (bcrypt или старый формат; при старом - перехеширует и сохраняет). Выдаёт JWT и cookie, создаёт запись в sessions. Возвращает сообщение и пользователя без пароля.
POST /user/logout	Если есть пользователь по токену - удаляет его записи из sessions. Очищает cookie token и refreshToken. Отдаёт сообщение о выходе.
GET /user/profile	По userId из токена загружает пользователя (без пароля), завершённые уроки, последний урок, достижения из user_achievements и achievements, записи user_lessons, главы. Считает прогресс по главам и балансы из user_wallets. Возвращает один объект user со всеми этими полями.
GET /user	Возвращает список всех пользователей из коллекции user с проекцией без поля password.
PUT /user/:id	Обновляет у пользователя с _id = id поле name и updatedAt. Возвращает сообщение, userId и новое имя.
PUT /user/:id/progress/:lessonId	Проверяет существование урока и пользователя. Увеличивает progress пользователя на 4 (макс. 100), обновляет пользователя. Добавляет пользователя в массив completedBy урока. Не меняет completedLessons у пользователя. Возвращает сообщение и старый/новый прогресс.
GET /user/settings	По токену достаёт у пользователя только settings и privacy (с дефолтами) и отдаёт их.
PUT /user/settings	По токену обновляет у пользователя переданные settings и/или privacy и updatedAt. Возвращает сообщение.
PUT /user/avatar	По токену записывает в документ пользователя поле avatar из тела и updatedAt. Возвращает сообщение и значение аватара.
PUT /user/password	Проверяет currentPassword и newPassword (≥ 6 символов). Сверяет текущий пароль с БД, хеширует новый, обновляет в БД. При неверном текущем пароле - 401.
GET /user/preferences	По токену ищет документ в profiles и отдаёт preferences, bio, socials (или пустые значения).
PUT /user/preferences	По токену обновляет/создаёт запись в profiles: preferences, bio, socials, updatedAt. Возвращает сообщение.
GET /user/progress	По токену отдаёт общий прогресс, опыт, уровень, стрик, дату активности; последние 5 записей из user_lessons с данными уроков; по каждой главе - сколько уроков завершено и процент.
PUT /user/progress	В коде тот же обработчик, что и для /:id/progress/:lessonId, но вызывается без id и lessonId, поэтому в обработчике они undefined - запрос по факту приводит к ошибке (урок/пользователь не найдутся).
GET /user/achievements	Загружает достижения пользователя и все достижения в системе; для каждого помечает получено ли и когда. Возвращает массив с полями earned и earnedAt.
GET /lessons	Опционально фильтрует по chapterId, пагинация limit/offset. Берёт уроки, при авторизации добавляет isCompleted по массиву completedLessons пользователя. Дополняет уроки данными глав. Возвращает массив с полем id.
GET /lessons/:id	Находит урок по id; при авторизации добавляет флаг isCompleted. Возвращает документ урока.
GET /lessons/:lessonId/content	Возвращает только theory, practiceTask, interactiveUrl, media урока для отображения контента.
POST /lessons	Проверяет title, theory, practiceTask. Нормализует теорию в массив { body }. Создаёт урок с практикой, тест-кейсами, главой и сохраняет в lessons. Возвращает созданный урок.
PUT /lessons/:id	Обновляет урок переданными полями (без _id), нормализует theory, выставляет updatedAt. Возвращает сообщение и lessonId.
DELETE /lessons/:id	Удаляет этот урок из массивов completedLessons у всех пользователей, затем удаляет документ урока. Возвращает сообщение и id.
POST /lessons/:lessonId/submit	Находит урок и проверяет код (Judge0 или локальный vm для JS) по тест-кейсам. При успехе: обновляет прогресс пользователя (+4%), добавляет урок в completedLessons и пользователя в completedBy. Возвращает статус, сообщение, прогресс и детали тестов.
POST /lessons/:lessonId/completion	Без проверки кода записывает в user_lessons статус completed, обновляет completedLessons и lastActivityDate у пользователя. Возвращает сообщение.
POST /submissions	Требует lessonId и code. Запускает код (Judge0/локально), сохраняет отправку в submissions. При успехе: обновляет прогресс в user_lessons и у пользователя (прогресс, опыт, уровень, стрик), начисляет валюту (coins +10), проверяет и начисляет достижения. Возвращает объект отправки и флаг success.
GET /submissions	Фильтрует по текущему пользователю и опционально по lessonId; пагинация limit/offset. Сортировка по дате. Возвращает массив своих отправок.
GET /achievements	Возвращает все документы из коллекции achievements (справочник достижений).
GET /achievements/:id	Возвращает одно достижение по id в виде { achievement }.
GET /wallet	По токену берёт записи из user_wallets и справочник currencies, собирает баланс по типам валют (amount, currencyId, currencyName). Возвращает объект balance.
GET /wallet/transactions	По токену возвращает транзакции пользователя из wallet_transactions с пагинацией и сортировкой по дате.
POST /wallet/earn	Требует currencyType и amount. Находит валюту в currencies, увеличивает баланс в user_wallets (upsert), создаёт запись в wallet_transactions (type: earn, reason из тела или "manual"). Возвращает сообщение и сумму.
GET /content/:type	Ищет в content_blocks документ с полем type и отдаёт его поле data как content.
PUT /content/:type	Требует в теле data. Обновляет или создаёт документ в content_blocks по type, записывает data и updatedAt. Возвращает сообщение.
POST /feedback	Проверяет name, email, message и формат email. Создаёт запись в feedback (при авторизации пишет userId), создаёт уведомление в notifications. Возвращает сообщение и feedbackId.
GET /feedback	Если пользователь авторизован - возвращает только его обращения из feedback; иначе - все. Пагинация limit/offset, сортировка по дате.

Пользователи — /user					
1	POST http://localhost:3000/user - {"name": "Иван","email": "ivan@test.com","password": "123456"}	После ответа Postman сохранит cookie.
2	POST http://localhost:3000/user/login - {"email": "ivan@test.com","password": "123456"}	Дальнейшие запросы к этому хосту будут с cookie.
3	POST http://localhost:3000/user/logout -	просто очищаются cookie.
4	GET	http://localhost:3000/user/profile	Без заголовков - (cookie уйдут сами) или Authorization: Bearer <токен> - Нужна авторизация (cookie или Bearer).
5	GET	http://localhost:3000/user	Как выше - Список всех пользователей.
6	PUT	http://localhost:3000/user/64a1b2c3d4e5f6789012345	Как выше - {"name": "Иван Петров"}	Замените id на реальный ObjectId пользователя.
7	PUT	http://localhost:3000/user/64a1b2c3d4e5f6789012345/progress/64a1b2c3d4e5f6789012346	Как выше - id - пользователь, lessonId - урок (ObjectId).
8	GET	http://localhost:3000/user/settings	Как выше - Только с авторизацией.
9	PUT	http://localhost:3000/user/settings	Как выше - {"settings":{"theme":"dark","language":"ru","notifications":false},"privacy":{"showProfile":true,"showProgress":true,"showAchievements":false}}	Можно передать только settings или только privacy.
10	PUT	http://localhost:3000/user/avatar	Как выше - {"avatar": "https://example.com/avatar.png"}	Любая строка или данные аватара.
11	PUT	http://localhost:3000/user/password	Как выше - {"currentPassword": "123456","newPassword": "newpass123"}	newPassword не короче 6 символов.
12	GET	http://localhost:3000/user/preferences	Как выше - С авторизацией.
13	PUT	http://localhost:3000/user/preferences	Как выше - {"preferences":{},"bio": "О себе","socials":{"vk":"https://vk.com/id"}}	Поля опциональны.
14	GET	http://localhost:3000/user/progress	Как выше - С авторизацией.
15	GET	http://localhost:3000/user/achievements	Как выше - С авторизацией.
Уроки — /lessons					
16	GET	http://localhost:3000/lessons - или с авторизацией - Без query - все уроки.
17	GET	http://localhost:3000/lessons?chapterId=64a1b2c3d4e5f6789012345&limit=10&offset=0 - или с авторизацией - Фильтр по главе, пагинация.
18	GET	http://localhost:3000/lessons/64a1b2c3d4e5f6789012346 - или с авторизацией - Один урок по id (ObjectId).
19	GET	http://localhost:3000/lessons/64a1b2c3d4e5f6789012346/content - или с авторизацией - Теория и практика урока.
20	POST http://localhost:3000/lessons	С авторизацией - {"title": "Первая программа","theory": "Текст теории или [{\"body\":\"абзац\"}]","practiceTask": "Выведите Hello","expectedOutput": "Hello","languageId": 63,"testCases": [{"input": "","expectedOutput": "Hello"}],"chapter": "Введение","chapterTitle": "Введение","duration": 10}	Минимум: title, theory, practiceTask.
21	PUT	http://localhost:3000/lessons/64a1b2c3d4e5f6789012346	С авторизацией	- {"title": "Обновлённое название","duration": 15}