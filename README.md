# Online Gallery

Онлайн-галерея для загрузки, хранения и просмотра изображений.  
Проект разработан с использованием **React, TypeScript, NestJS, Node.js, MongoDB и Docker**.  

---

## 🚀 Стек технологий

### Frontend
- React + TypeScript
- React Router
- Axios для запросов к API
- TailwindCSS (или другой UI-фреймворк)

### Backend
- NestJS (Node.js)
- Express (внутри Nest)
- JWT авторизация
- Multer (для загрузки файлов)
- MongoDB (хранение данных)

### DevOps
- Docker, Docker Compose
- Volume для MongoDB
- Возможность интеграции с S3-хранилищем для картинок

---

## 📂 Архитектура проекта

- **Frontend (React SPA)** – отображение галереи, страница входа/регистрации, личный кабинет пользователя, фильтрация по тегам и авторам.  
- **Backend (NestJS)** – REST API, модули:
  - `AuthModule` – регистрация, вход, JWT refresh/access токены
  - `UsersModule` – управление пользователями
  - `GalleryModule` – CRUD для изображений
  - `UploadModule` – загрузка файлов  
- **Database (MongoDB)** – хранение пользователей, метаданных изображений, тегов.  
- **Docker** – контейнеризация всех сервисов.  

---

## 🔧 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-org/online-gallery.git
cd online-gallery
