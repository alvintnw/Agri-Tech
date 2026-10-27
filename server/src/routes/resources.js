const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const resourceController = require('../controllers/resourceController');
const { Farm, Crop, Product } = require('../models/schemas');

function mount(path, Model, options, roles = ['farmer', 'admin']) {
  const controller = resourceController(Model, options);
  router.route(path).get(authenticate, controller.list).post(authenticate, authorize(...roles), controller.create);
  router.route(`${path}/:id`).get(authenticate, controller.get).put(authenticate, authorize(...roles), controller.update).delete(authenticate, authorize('admin'), controller.remove);
}
mount('/farms', Farm, { owner: true, validate: 'farm' });
mount('/crops', Crop, { owner: true, validate: 'crop' });
mount('/products', Product, {}, ['admin']);
module.exports = router;
