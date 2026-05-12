const router = require('express').Router();
const { db } = require('../db');
const { getUnlocked } = require('../utils/achievements');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  const all = db.prepare('SELECT * FROM achievements ORDER BY id ASC').all();
  res.json({ all, unlocked: getUnlocked(req.user.id) });
});

module.exports = router;
