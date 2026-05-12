const jwt = require('jsonwebtoken');
const { db } = require('../db');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT id, username, avatar_url, reputation, created_at, last_login_date, posts_count, comments_count, likes_given, likes_received, dislikes_received, avatar_set FROM users WHERE id = ?').get(payload.userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { requireAuth };
