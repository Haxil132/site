const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { db } = require('../db');
const { sanitizeText, ensureDir, actorKey } = require('./shared');
const { verifyChallenge } = require('../utils/pow');
const { addReputation } = require('../utils/reputation');
const { award, maybeGlobalAchievements, getUnlocked } = require('../utils/achievements');

function mapPostRow(row) {
  const author = row.user_id
    ? db.prepare('SELECT id, username, avatar_url, reputation FROM users WHERE id = ?').get(row.user_id)
    : null;
  const media = JSON.parse(row.media_json || '[]');
  const comments = db.prepare(`
    SELECT c.*, u.username, u.avatar_url
    FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
    LIMIT 6
  `).all(row.id).map(c => ({
    id: c.id,
    text: c.text,
    createdAt: c.created_at,
    author: c.user_id ? { id: c.user_id, username: c.username, avatarUrl: c.avatar_url } : null
  }));
  return {
    id: row.id,
    text: row.text,
    media,
    createdAt: row.created_at,
    likesCount: row.likes_count,
    dislikesCount: row.dislikes_count,
    commentsCount: row.comments_count,
    reportsCount: row.reports_count,
    nightPost: !!row.night_post,
    author: author ? { id: author.id, username: author.username, avatarUrl: author.avatar_url, reputation: author.reputation } : null,
    comments
  };
}

async function createPost(req, res) {
  const text = sanitizeText(req.body?.text || '');
  const powChallenge = req.body?.powChallenge;
  const powNonce = req.body?.powNonce;
  if (!verifyChallenge(powChallenge, powNonce)) return res.status(400).json({ error: 'PoW не пройдена' });
  if (!text && (!req.files || Object.values(req.files).flat().length === 0)) {
    return res.status(400).json({ error: 'Добавь текст или медиа' });
  }

  const now = Date.now();
  const nightPost = new Date(now).getHours() >= 0 && new Date(now).getHours() < 5 ? 1 : 0;
  const isAuth = !!req.user;
  const info = db.prepare('INSERT INTO posts (user_id, session_id, text, media_json, created_at, night_post) VALUES (?, ?, ?, ?, ?, ?)').run(
    isAuth ? req.user.id : null,
    req.sessionId,
    text,
    '[]',
    now,
    nightPost
  );

  const postId = info.lastInsertRowid;
  const baseDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'data', 'uploads');
  const postDir = path.join(baseDir, 'posts', String(postId));
  ensureDir(postDir);

  const media = [];
  const imageFiles = req.files?.images || [];
  const videoFiles = req.files?.video || [];
  const audioFiles = req.files?.audio || [];

  if (imageFiles.length > 10) return res.status(400).json({ error: 'Максимум 10 фото' });
  if (videoFiles.length > 1) return res.status(400).json({ error: 'Максимум 1 видео' });
  if (audioFiles.length > 1) return res.status(400).json({ error: 'Максимум 1 аудио' });

  for (const file of imageFiles) {
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const filePath = path.join(postDir, filename);
    await sharp(file.buffer).resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(filePath);
    media.push({ type: 'image', url: `/uploads/posts/${postId}/${filename}`, mime: 'image/webp' });
  }

  for (const file of videoFiles) {
    const ext = path.extname(file.originalname) || '.mp4';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(postDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    media.push({ type: 'video', url: `/uploads/posts/${postId}/${filename}`, mime: file.mimetype });
  }

  for (const file of audioFiles) {
    const ext = path.extname(file.originalname) || '.mp3';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(postDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    media.push({ type: 'audio', url: `/uploads/posts/${postId}/${filename}`, mime: file.mimetype });
  }

  db.prepare('UPDATE posts SET media_json = ? WHERE id = ?').run(JSON.stringify(media), postId);

  if (isAuth) {
    db.prepare('UPDATE users SET posts_count = posts_count + 1 WHERE id = ?').run(req.user.id);
    maybeGlobalAchievements(req.user.id);
    if (nightPost) award(req.user.id, 'night_owl');
  }

  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  const payload = mapPostRow(row);
  return res.json({ post: payload, achievements: isAuth ? getUnlocked(req.user.id) : [] });
}

function listPosts(req, res) {
  const limit = Math.min(parseInt(req.query.limit || '8', 10), 20);
  const cursor = Number(req.query.cursor || 0);
  const where = cursor ? 'WHERE id < ?' : '';
  const rows = cursor
    ? db.prepare(`SELECT * FROM posts ${where} ORDER BY id DESC LIMIT ?`).all(cursor, limit)
    : db.prepare('SELECT * FROM posts ORDER BY id DESC LIMIT ?').all(limit);
  const posts = rows.map(mapPostRow);
  const nextCursor = rows.length ? rows[rows.length - 1].id : null;
  res.json({ posts, nextCursor, hasMore: rows.length === limit });
}

function react(req, res) {
  const postId = Number(req.params.id);
  const reaction = req.body?.reaction;
  if (!['like', 'dislike'].includes(reaction)) return res.status(400).json({ error: 'Некорректная реакция' });
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) return res.status(404).json({ error: 'Пост не найден' });

  const actor = actorKey(req);
  const existing = db.prepare('SELECT * FROM reactions WHERE post_id = ? AND actor_key = ?').get(postId, actor);
  const postOwnerId = post.user_id;

  if (!existing) {
    db.prepare('INSERT INTO reactions (post_id, actor_key, user_id, session_id, reaction, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      postId,
      actor,
      req.user ? req.user.id : null,
      req.sessionId,
      reaction,
      Date.now()
    );
    if (reaction === 'like') {
      db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
      if (postOwnerId) addReputation(postOwnerId, 1);
      if (req.user) {
        db.prepare('UPDATE users SET likes_given = likes_given + 1 WHERE id = ?').run(req.user.id);
      }
    } else {
      db.prepare('UPDATE posts SET dislikes_count = dislikes_count + 1 WHERE id = ?').run(postId);
      if (postOwnerId) addReputation(postOwnerId, -1);
    }
  } else if (existing.reaction !== reaction) {
    db.prepare('UPDATE reactions SET reaction = ? WHERE id = ?').run(reaction, existing.id);
    if (existing.reaction === 'like') {
      db.prepare('UPDATE posts SET likes_count = MAX(likes_count - 1, 0), dislikes_count = dislikes_count + 1 WHERE id = ?').run(postId);
      if (postOwnerId) addReputation(postOwnerId, -2);
      if (req.user) {
        db.prepare('UPDATE users SET likes_given = MAX(likes_given - 1, 0) WHERE id = ?').run(req.user.id);
      }
    } else {
      db.prepare('UPDATE posts SET dislikes_count = MAX(dislikes_count - 1, 0), likes_count = likes_count + 1 WHERE id = ?').run(postId);
      if (postOwnerId) addReputation(postOwnerId, 2);
      if (req.user) {
        db.prepare('UPDATE users SET likes_given = likes_given + 1 WHERE id = ?').run(req.user.id);
      }
    }
  }

  const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (updated.likes_count >= 10 && !updated.like_bonus_awarded && postOwnerId) {
    db.prepare('UPDATE posts SET like_bonus_awarded = 1 WHERE id = ?').run(postId);
    addReputation(postOwnerId, 5);
    award(postOwnerId, 'liked_10');
  }
  if (updated.likes_count >= 50 && postOwnerId) {
    award(postOwnerId, 'liked_50');
  }
  return res.json({ post: mapPostRow(db.prepare('SELECT * FROM posts WHERE id = ?').get(postId)) });
}

function comment(req, res) {
  const postId = Number(req.params.id);
  const text = sanitizeText(req.body?.text || '');
  if (text.length < 1) return res.status(400).json({ error: 'Комментарий пустой' });
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) return res.status(404).json({ error: 'Пост не найден' });

  db.prepare('INSERT INTO comments (post_id, user_id, session_id, text, created_at) VALUES (?, ?, ?, ?, ?)').run(
    postId,
    req.user ? req.user.id : null,
    req.sessionId,
    text,
    Date.now()
  );
  db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(postId);
  if (req.user) {
    db.prepare('UPDATE users SET comments_count = comments_count + 1 WHERE id = ?').run(req.user.id);
    addReputation(req.user.id, 0.2);
    award(req.user.id, 'first_comment');
    maybeGlobalAchievements(req.user.id);
  }
  if (post.user_id) {
    addReputation(post.user_id, 0.5);
    maybeGlobalAchievements(post.user_id);
  }
  const row = db.prepare('SELECT c.*, u.username, u.avatar_url FROM comments c LEFT JOIN users u ON u.id = c.user_id WHERE c.post_id = ? ORDER BY c.id DESC LIMIT 1').get(postId);
  return res.json({
    comment: {
      id: row.id,
      text: row.text,
      createdAt: row.created_at,
      author: row.user_id ? { id: row.user_id, username: row.username, avatarUrl: row.avatar_url } : null
    }
  });
}

function report(req, res) {
  const postId = Number(req.params.id);
  const reason = sanitizeText(req.body?.reason || 'spam');
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) return res.status(404).json({ error: 'Пост не найден' });
  db.prepare('INSERT INTO reports (post_id, actor_key, reason, created_at) VALUES (?, ?, ?, ?)').run(postId, actorKey(req), reason, Date.now());
  db.prepare('UPDATE posts SET reports_count = reports_count + 1 WHERE id = ?').run(postId);
  return res.json({ ok: true });
}

function myPosts(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const rows = db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY id DESC LIMIT 20').all(req.user.id);
  res.json({ posts: rows.map(mapPostRow) });
}

module.exports = { createPost, listPosts, react, comment, report, myPosts, mapPostRow };
