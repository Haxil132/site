const { db } = require('../db');
const { award, maybeGlobalAchievements } = require('./achievements');

function addReputation(userId, delta) {
  if (!userId || !delta) return;
  db.prepare('UPDATE users SET reputation = ROUND(reputation + ?, 1) WHERE id = ?').run(delta, userId);
  maybeGlobalAchievements(userId);
}

function recordLoginReward(userId) {
  const user = db.prepare('SELECT id, last_login_date, reputation FROM users WHERE id = ?').get(userId);
  if (!user) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (user.last_login_date !== today) {
    db.prepare('UPDATE users SET last_login_date = ?, reputation = ROUND(reputation + 1, 1) WHERE id = ?').run(today, userId);
    award(userId, 'daily_login');
    maybeGlobalAchievements(userId);
    return true;
  }
  return false;
}

function rankFromRep(rep) {
  if (rep >= 200) return { name: 'Бог', min: 200, max: null };
  if (rep >= 50) return { name: 'Легенда', min: 50, max: 199 };
  if (rep >= 10) return { name: 'Бывалый', min: 10, max: 49 };
  return { name: 'Новичок', min: 0, max: 9 };
}

module.exports = { addReputation, recordLoginReward, rankFromRep };
