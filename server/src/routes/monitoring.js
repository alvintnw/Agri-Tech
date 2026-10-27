const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/monitoringController');
router.use(authenticate);
router.get('/soil', controller.readings);
router.post('/soil', controller.createReading);
router.get('/alerts', controller.alerts);
router.put('/alerts/:id/resolve', controller.closeAlert);
module.exports = router;
