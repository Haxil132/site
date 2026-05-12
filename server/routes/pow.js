const router = require('express').Router();
const { getChallenge } = require('../controllers/powController');
router.get('/challenge', getChallenge);
module.exports = router;
