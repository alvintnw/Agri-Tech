const mongoose = require('mongoose');
const { createModel } = require('./modelFactory');

const userSchema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, unique: true, required: true }, password: { type: String, required: true }, role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' } }, { timestamps: true });
const farmSchema = new mongoose.Schema({ name: { type: String, required: true }, location: String, size: Number, unit: { type: String, default: 'acres' }, owner: String, description: String }, { timestamps: true });
const cropSchema = new mongoose.Schema({ name: { type: String, required: true }, type: String, farmId: String, owner: String, sowingDate: String, harvestDate: String, status: { type: String, default: 'planned' }, notes: String }, { timestamps: true });
const productSchema = new mongoose.Schema({ name: { type: String, required: true }, category: String, price: Number, unit: String, stock: Number, description: String }, { timestamps: true });
const bookingSchema = new mongoose.Schema({ userId: String, productId: String, quantity: Number, bookingDate: String, totalAmount: Number, status: { type: String, default: 'pending' } }, { timestamps: true });
const soilSchema = new mongoose.Schema({ farmId: String, moisture: Number, ph: Number, nitrogen: Number, phosphorus: Number, potassium: Number, notes: String, recordedBy: String }, { timestamps: true });
const alertSchema = new mongoose.Schema({ title: String, type: String, severity: String, message: String, status: { type: String, default: 'open' }, farmId: String }, { timestamps: true });
const discussionSchema = new mongoose.Schema({ title: { type: String, required: true }, body: { type: String, required: true }, authorId: String, authorName: String, replies: { type: Number, default: 0 } }, { timestamps: true });

module.exports = {
  User: createModel('users', mongoose.models.User || mongoose.model('User', userSchema)),
  Farm: createModel('farms', mongoose.models.Farm || mongoose.model('Farm', farmSchema)),
  Crop: createModel('crops', mongoose.models.Crop || mongoose.model('Crop', cropSchema)),
  Product: createModel('products', mongoose.models.Product || mongoose.model('Product', productSchema)),
  Booking: createModel('bookings', mongoose.models.Booking || mongoose.model('Booking', bookingSchema)),
  SoilReading: createModel('soilReadings', mongoose.models.SoilReading || mongoose.model('SoilReading', soilSchema)),
  Alert: createModel('alerts', mongoose.models.Alert || mongoose.model('Alert', alertSchema)),
  Discussion: createModel('discussions', mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema))
};
