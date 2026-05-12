const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { db } = require('../db');
const { sanitizeText, ensureDir } = require('./shared');
const { buildUserResponse } = require('./authController');
const { award, getUnlocked } = require('../utils/achievements');
const { addReputation } = require('../utils/reputation');

async function uploadAvatar(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ error: 'Файл не найден' });

  const baseDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'data', 'uploads');
  const dir = path.join(baseDir, 'avatars');
  ensureDir(dir);
  const filename = `user-${req.user.id}-${Date.now()}.webp`;
  const filePath = path.join(dir, filename);
  await sharp(req.file.buffer).resize(256, 256, { fit: 'cover' }).webp({ quality: 82 }).toFile(filePath);
  const publicUrl = `/uploads/avatars/${filename}`;
  db.prepare('UPDATE users SET avatar_url = ?, avatar_set = 1 WHERE id = ?').run(publicUrl, req.user.id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  award(req.user.id, 'avatar_set');
  return res.json({ user: buildUserResponse(user), achievements: getUnlocked(req.user.id) });
}

function profile(req, res) {
  const username = sanitizeText(req.params.username || '').toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const posts = db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(user.id).c;
  const likesReceived = db.prepare('SELECT COALESCE(SUM(likes_count),0) as c FROM posts WHERE user_id = ?').get(user.id).c;
  const commentsReceived = db.prepare('SELECT COALESCE(SUM(comments_count),0) as c FROM posts WHERE user_id = ?').get(user.id).c;
  const unlocked = getUnlocked(user.id);
  res.json({
    user: buildUserResponse(user),
    stats: { posts, likesReceived, commentsReceived, achievements: unlocked.length },
    achievements: unlocked
  });
}

module.exports = { uploadAvatar, profile };
