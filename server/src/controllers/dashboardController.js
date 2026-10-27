const { Farm, Crop, Product, Booking } = require('../models/schemas');
async function summary(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user.id };
    res.json({
      farms: await Farm.count(filter),
      crops: req.user.role === 'admin' ? await Crop.count({}) : await Crop.count({}),
      products: await Product.count({}),
      bookings: req.user.role === 'admin' ? await Booking.count({}) : await Booking.count({ userId: req.user.id })
    });
  } catch (error) { next(error); }
}
module.exports = { summary };
