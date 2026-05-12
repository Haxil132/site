const crypto = require('crypto');
const { db } = require('../db');

function createChallenge() {
  const challenge = crypto.randomBytes(16).toString('hex');
  const difficulty = 3;
  const expiresAt = Date.now() + 5 * 60 * 1000;
  db.prepare('INSERT INTO pow_challenges (challenge, difficulty, expires_at, used) VALUES (?, ?, ?, 0)').run(challenge, difficulty, expiresAt);
  return { challenge, difficulty, expiresAt };
}

function verifyChallenge(challenge, nonce) {
  if (!challenge || nonce === undefined || nonce === null) return false;
  const row = db.prepare('SELECT * FROM pow_challenges WHERE challenge = ?').get(challenge);
  if (!row || row.used || row.expires_at < Date.now()) return false;
  const hash = crypto.createHash('sha256').update(`${challenge}:${nonce}`).digest('hex');
  const ok = hash.startsWith('0'.repeat(row.difficulty));
  if (ok) {
    db.prepare('UPDATE pow_challenges SET used = 1 WHERE challenge = ?').run(challenge);
  }
  return ok;
}

module.exports = { createChallenge, verifyChallenge };
