const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/communityController');
router.use(authenticate);
router.get('/', controller.list);
router.post('/', controller.create);
module.exports = router;
