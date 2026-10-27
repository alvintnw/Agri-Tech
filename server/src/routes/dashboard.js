const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { summary } = require('../controllers/dashboardController');
router.get('/', authenticate, summary);
module.exports = router;
