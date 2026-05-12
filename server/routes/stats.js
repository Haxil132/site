const router = require('express').Router();
const { stats } = require('../controllers/statsController');
router.get('/', stats);
module.exports = router;
