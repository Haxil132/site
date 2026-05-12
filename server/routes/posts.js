const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const writeLimiter = rateLimit({ windowMs: 60 * 1000, limit: 6, standardHeaders: true, legacyHeaders: false });
const { createPost, listPosts, react, comment, report, myPosts } = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listPosts);
router.get('/mine', requireAuth, myPosts);
router.post('/', writeLimiter, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), createPost);
router.post('/:id/react', writeLimiter, react);
router.post('/:id/comment', writeLimiter, comment);
router.post('/:id/report', writeLimiter, report);

module.exports = router;
