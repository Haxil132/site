
# Анонимная Медиа-Лента

Монорепозиторий с фронтендом на React/Vite/Tailwind/Redux Toolkit и сервером на Node.js/Express/SQLite.

## Фичи
- анонимные посты без регистрации
- фото / видео / аудио / текст
- JWT-авторизация
- репутация и уровни
- ачивки с уведомлениями
- infinite scroll
- PoW-защита
- тёмная и светлая тема
- Docker Compose

## Локальный запуск

### 1. Создай `.env` в корне проекта
```bash
cp .env.example .env
```

### 2. Сервер
```bash
cd server
npm install
npm run dev
```

Сервер по умолчанию поднимется на `http://localhost:8080`.

### 3. Клиент
```bash
cd client
npm install
npm run dev
```

Клиент по умолчанию будет на `http://localhost:5173`.

## Запуск через Docker
```bash
cp .env.example .env
docker compose up --build
```

Фронтенд будет на `http://localhost`, API проксируется через Nginx на `/api`.

## Структура
- `server/` — Express API, SQLite, загрузка медиа
- `client/` — React/Vite фронтенд
- `data/` — база и загруженные файлы

## Важно
- Локально для загрузки медиа папка `data/uploads` создаётся автоматически.
- Файлы хранятся в SQLite-базе `data/app.db` и на диске в `data/uploads`.
