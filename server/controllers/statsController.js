const { db } = require('../db');

function stats(req, res) {
  const now = Date.now();
  const activeWindow = now - 15 * 60 * 1000;
  const anon = db.prepare('SELECT COUNT(*) as c FROM sessions WHERE is_anon = 1 AND last_seen >= ?').get(activeWindow).c;
  const users = db.prepare('SELECT COUNT(DISTINCT user_id) as c FROM sessions WHERE is_anon = 0 AND user_id IS NOT NULL AND last_seen >= ?').get(activeWindow).c;
  const totalPosts = db.prepare('SELECT COUNT(*) as c FROM posts').get().c;
  res.json({ anon, users, totalPosts });
}

module.exports = { stats };
