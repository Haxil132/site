const router = require('express').Router();
const { profile } = require('../controllers/userController');
router.get('/:username', profile);
module.exports = router;
