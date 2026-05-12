const { db } = require('../db');

function award(userId, achievementId) {
  if (!userId || !achievementId) return false;
  const exists = db.prepare('SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(userId, achievementId);
  if (exists) return false;
  db.prepare('INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)').run(userId, achievementId, Date.now());
  return true;
}

function getUnlocked(userId) {
  if (!userId) return [];
  return db.prepare(`
    SELECT a.*, ua.unlocked_at
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = ?
    ORDER BY ua.unlocked_at ASC
  `).all(userId);
}

function countUnlocked(userId) {
  return db.prepare('SELECT COUNT(*) as c FROM user_achievements WHERE user_id = ?').get(userId).c;
}

function maybeGlobalAchievements(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return [];
  const unlocked = [];
  if (user.posts_count >= 1 && award(userId, 'first_post')) unlocked.push('first_post');
  if (user.posts_count >= 5 && award(userId, 'five_posts')) unlocked.push('five_posts');
  if (user.posts_count >= 10 && award(userId, 'ten_posts')) unlocked.push('ten_posts');
  if (user.comments_count >= 1 && award(userId, 'first_comment')) unlocked.push('first_comment');
  if (user.comments_count >= 10 && award(userId, 'ten_comments')) unlocked.push('ten_comments');
  if (user.likes_given >= 1 && award(userId, 'first_reaction')) unlocked.push('first_reaction');
  if (user.avatar_set && award(userId, 'avatar_set')) unlocked.push('avatar_set');
  if (user.last_login_date && award(userId, 'first_login')) unlocked.push('first_login');
  if (user.reputation >= 50 && award(userId, 'rep_50')) unlocked.push('rep_50');
  if (user.reputation >= 200 && award(userId, 'rep_200')) unlocked.push('rep_200');

  const videoCount = db.prepare(`SELECT COUNT(*) as c FROM posts WHERE user_id = ? AND EXISTS (
    SELECT 1 FROM json_each(posts.media_json) WHERE json_extract(value, '$.type') = 'video'
  )`).get(userId).c;
  const audioCount = db.prepare(`SELECT COUNT(*) as c FROM posts WHERE user_id = ? AND EXISTS (
    SELECT 1 FROM json_each(posts.media_json) WHERE json_extract(value, '$.type') = 'audio'
  )`).get(userId).c;
  if (videoCount >= 5 && award(userId, 'five_video_posts')) unlocked.push('five_video_posts');
  if (audioCount >= 10 && award(userId, 'ten_audio_posts')) unlocked.push('ten_audio_posts');

  const commentsReceived = db.prepare(`
    SELECT COALESCE(SUM(p.comments_count), 0) as c
    FROM posts p
    WHERE p.user_id = ?
  `).get(userId).c;
  if (commentsReceived >= 20 && award(userId, 'received_20_comments')) unlocked.push('received_20_comments');

  return unlocked;
}

function maybePostAchievements(postId, userId, createdAt) {
  if (!userId) return [];
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) return [];
  const unlocked = [];
  const media = JSON.parse(post.media_json || '[]');
  if (media.some(m => m.type === 'video')) {
    const c = db.prepare(`SELECT COUNT(*) as c FROM posts WHERE user_id = ? AND EXISTS (
      SELECT 1 FROM json_each(posts.media_json) WHERE json_extract(value, '$.type') = 'video'
    )`).get(userId).c;
    if (c >= 5 && award(userId, 'five_video_posts')) unlocked.push('five_video_posts');
  }
  if (media.some(m => m.type === 'audio')) {
    const c = db.prepare(`SELECT COUNT(*) as c FROM posts WHERE user_id = ? AND EXISTS (
      SELECT 1 FROM json_each(posts.media_json) WHERE json_extract(value, '$.type') = 'audio'
    )`).get(userId).c;
    if (c >= 10 && award(userId, 'ten_audio_posts')) unlocked.push('ten_audio_posts');
  }
  const d = new Date(createdAt);
  const h = d.getHours();
  if (h >= 0 && h < 5 && award(userId, 'night_owl')) unlocked.push('night_owl');
  return unlocked;
}

module.exports = { award, getUnlocked, countUnlocked, maybeGlobalAchievements, maybePostAchievements };
