const sanitizeHtml = require('sanitize-html');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');

function sanitizeText(text) {
  return sanitizeHtml(String(text || ''), {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function actorKey(req) {
  return req.user ? `user:${req.user.id}` : `session:${req.sessionId}`;
}

function userForPost(post) {
  const author = post.user_id
    ? db.prepare('SELECT id, username, avatar_url, reputation FROM users WHERE id = ?').get(post.user_id)
    : null;
  return author ? { id: author.id, username: author.username, avatarUrl: author.avatar_url, reputation: author.reputation } : null;
}

function mediaPublicUrl(rel) {
  return rel.replace(/\\/g, '/');
}

module.exports = { sanitizeText, ensureDir, actorKey, userForPost, mediaPublicUrl };
