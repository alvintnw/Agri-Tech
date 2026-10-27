const { Booking, Product } = require('../models/schemas');

async function list(req, res, next) {
  try { res.json(await Booking.find(req.user.role === 'admin' ? {} : { userId: req.user.id })); } catch (error) { next(error); }
}
async function create(req, res, next) {
  try {
    const { productId, quantity = 1, bookingDate } = req.body;
    if (!productId || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({ message: 'A valid product and positive whole quantity are required.' });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (!Number.isFinite(Number(product.stock)) || Number(quantity) > Number(product.stock)) {
      return res.status(400).json({ message: 'Requested quantity is unavailable.' });
    }
    const totalAmount = Number(product.price || 0) * Number(quantity);
    res.status(201).json(await Booking.create({ userId: req.user.id, productId, quantity, bookingDate: bookingDate || new Date().toISOString(), totalAmount, status: 'pending' }));
  } catch (error) { next(error); }
}
async function update(req, res, next) {
  try {
    const allowed = {};
    if (req.body.status && ['pending', 'confirmed', 'delivered', 'cancelled'].includes(req.body.status)) allowed.status = req.body.status;
    if (!Object.keys(allowed).length) return res.status(400).json({ message: 'A valid booking status is required.' });
    const item = await Booking.update(req.params.id, allowed);
    if (!item) return res.status(404).json({ message: 'Booking not found.' });
    res.json(item);
  } catch (error) { next(error); }
}
module.exports = { list, create, update };
