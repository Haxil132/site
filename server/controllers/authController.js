const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { sanitizeText } = require('./shared');
const { verifyChallenge } = require('../utils/pow');
const { recordLoginReward } = require('../utils/reputation');
const { getUnlocked } = require('../utils/achievements');

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function buildUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatar_url,
    reputation: user.reputation,
    createdAt: user.created_at,
    postsCount: user.posts_count,
    commentsCount: user.comments_count,
    likesGiven: user.likes_given,
    likesReceived: user.likes_received,
    dislikesReceived: user.dislikes_received,
    avatarSet: !!user.avatar_set
  };
}

function register(req, res) {
  const { username, password, powChallenge, powNonce } = req.body || {};
  const cleanUsername = sanitizeText(username).toLowerCase();
  if (cleanUsername.length < 3) return res.status(400).json({ error: 'Логин минимум 3 символа' });
  if (!password || String(password).length < 4) return res.status(400).json({ error: 'Пароль минимум 4 символа' });
  if (!verifyChallenge(powChallenge, powNonce)) return res.status(400).json({ error: 'PoW не пройдена' });

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
  if (exists) return res.status(409).json({ error: 'Логин занят' });

  const hash = bcrypt.hashSync(String(password), 10);
  const now = Date.now();
  const info = db.prepare('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)').run(cleanUsername, hash, now);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = signToken(user.id);
  db.prepare('UPDATE sessions SET user_id = ?, is_anon = 0 WHERE id = ?').run(user.id, req.sessionId);
  award(user.id, 'first_login');
  recordLoginReward(user.id);
  const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return res.json({
    token,
    user: buildUserResponse(fresh),
    achievements: getUnlocked(user.id)
  });
}

function login(req, res) {
  const { username, password } = req.body || {};
  const cleanUsername = sanitizeText(username).toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername);
  if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });
  const ok = bcrypt.compareSync(String(password || ''), user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' });
  db.prepare('UPDATE sessions SET user_id = ?, is_anon = 0 WHERE id = ?').run(user.id, req.sessionId);
  award(user.id, 'first_login');
  recordLoginReward(user.id);
  const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  const token = signToken(user.id);
  return res.json({
    token,
    user: buildUserResponse(fresh),
    achievements: getUnlocked(user.id)
  });
}

function me(req, res) {
  if (!req.user) {
    return res.json({ user: null, achievements: [] });
  }
  return res.json({
    user: buildUserResponse(req.user),
    achievements: getUnlocked(req.user.id)
  });
}

function updateAvatar(req, res) {
  return res.json({ ok: true });
}

module.exports = { register, login, me, updateAvatar, buildUserResponse, signToken };
