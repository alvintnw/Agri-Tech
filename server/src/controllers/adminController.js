const { User, Product, Booking, Farm, Crop } = require('../models/schemas');

async function users(req, res, next) {
  try { res.json(await User.find({})); } catch (error) { next(error); }
}

async function updateUser(req, res, next) {
  try {
    const allowed = {};
    if (typeof req.body.name === 'string' && req.body.name.trim()) allowed.name = req.body.name.trim();
    if (req.body.role === 'farmer' || req.body.role === 'admin') allowed.role = req.body.role;
    const user = await User.update(req.params.id, allowed);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) { next(error); }
}

async function overview(req, res, next) {
  try {
    res.json({
      users: await User.count({}), farms: await Farm.count({}), crops: await Crop.count({}),
      products: await Product.count({}), bookings: await Booking.count({})
    });
  } catch (error) { next(error); }
}

async function bookings(req, res, next) {
  try { res.json(await Booking.find({})); } catch (error) { next(error); }
}

module.exports = { users, updateUser, overview, bookings };
