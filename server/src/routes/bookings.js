const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/bookingController');
router.get('/', authenticate, controller.list);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, authorize('admin'), controller.update);
module.exports = router;
