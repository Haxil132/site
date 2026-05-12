const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

function sessionMiddleware(req, res, next) {
  let sid = req.cookies?.sid;
  if (!sid) {
    sid = uuidv4();
    res.cookie('sid', sid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
  }

  const now = Date.now();
  const found = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sid);
  if (!found) {
    db.prepare('INSERT INTO sessions (id, user_id, is_anon, ip, user_agent, created_at, last_seen) VALUES (?, NULL, 1, ?, ?, ?, ?)').run(
      sid,
      req.ip || req.headers['x-forwarded-for'] || '',
      req.headers['user-agent'] || '',
      now,
      now
    );
  } else {
    db.prepare('UPDATE sessions SET last_seen = ?, ip = ?, user_agent = ? WHERE id = ?').run(
      now,
      req.ip || req.headers['x-forwarded-for'] || '',
      req.headers['user-agent'] || '',
      sid
    );
  }

  req.sessionId = sid;
  req.session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sid);
  next();
}

module.exports = { sessionMiddleware };
