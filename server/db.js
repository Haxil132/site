const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbFile = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'app.db');
const dbDir = path.dirname(dbFile);
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      reputation REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      last_login_date TEXT,
      posts_count INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      likes_given INTEGER NOT NULL DEFAULT 0,
      likes_received INTEGER NOT NULL DEFAULT 0,
      dislikes_received INTEGER NOT NULL DEFAULT 0,
      avatar_set INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      is_anon INTEGER NOT NULL DEFAULT 1,
      ip TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL,
      last_seen INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      session_id TEXT,
      text TEXT,
      media_json TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      likes_count INTEGER NOT NULL DEFAULT 0,
      dislikes_count INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      reports_count INTEGER NOT NULL DEFAULT 0,
      night_post INTEGER NOT NULL DEFAULT 0,
      like_bonus_awarded INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER,
      session_id TEXT,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      actor_key TEXT NOT NULL UNIQUE,
      user_id INTEGER,
      session_id TEXT,
      reaction TEXT NOT NULL CHECK(reaction IN ('like', 'dislike')),
      created_at INTEGER NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      actor_key TEXT NOT NULL,
      reason TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      user_id INTEGER NOT NULL,
      achievement_id TEXT NOT NULL,
      unlocked_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, achievement_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pow_challenges (
      challenge TEXT PRIMARY KEY,
      difficulty INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
  `);

  const ach = db.prepare('SELECT COUNT(*) as c FROM achievements').get();
  if (!ach.c) {
    const stmt = db.prepare('INSERT INTO achievements (id, title, description, icon, category) VALUES (?, ?, ?, ?, ?)');
    const achievements = [
      ['first_post','Первый блин','Опубликуй свой первый пост.','spark','posts'],
      ['five_posts','Пять историй','Создай 5 постов.','layers','posts'],
      ['ten_posts','Контент-машина','Создай 10 постов.','badge-plus','posts'],
      ['first_comment','Голос в ленте','Напиши первый комментарий.','message-square','social'],
      ['ten_comments','Комментатор','Напиши 10 комментариев.','messages-square','social'],
      ['first_reaction','Первый клик','Поставь свою первую реакцию.','heart-handshake','social'],
      ['avatar_set','Лицо ленты','Загрузи аватарку.','image-plus','profile'],
      ['first_login','Добро пожаловать','Войди в аккаунт впервые.','log-in','profile'],
      ['daily_login','Стабильность','Зайди в аккаунт в новый день.','calendar-heart','profile'],
      ['five_video_posts','Кинорежиссёр','Опубликуй 5 видео-постов.','film','media'],
      ['ten_audio_posts','Аудиофил','Опубликуй 10 аудио-постов.','audio-lines','media'],
      ['night_owl','Сова','Создай пост ночью (00:00–05:00).','moon-star','media'],
      ['liked_10','Сердцеед','Пост набрал 10 лайков.','thumbs-up','posts'],
      ['liked_50','Звезда ленты','Пост набрал 50 лайков.','crown','posts'],
      ['rep_50','Легенда','Достигни репутации 50.','flame','profile'],
      ['rep_200','Бог','Достигни репутации 200.','sparkles','profile'],
      ['received_20_comments','Обсуждаемый','Твои посты собрали 20 комментариев.','speech','social']
    ];
    db.transaction(() => achievements.forEach(a => stmt.run(...a)))();
  }
}

module.exports = { db, initDb };
