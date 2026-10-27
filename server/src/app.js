require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./config/database');
const { seed } = require('./config/store');
const { User, Farm, Crop, Product, Booking, SoilReading, Alert, Discussion } = require('./models/schemas');
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const bookingRoutes = require('./routes/bookings');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const monitoringRoutes = require('./routes/monitoring');
const communityRoutes = require('./routes/community');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : null;
app.use(helmet());
app.use(cors({
  origin: allowedOrigins
    ? (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin))
    : true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'agritech-api', database: process.env.MONGODB_URI ? 'mongodb' : 'memory' }));
app.use('/api/auth', authRoutes);
app.use('/api', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/community', communityRoutes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  const mongo = await connectDatabase();
  [User, Farm, Crop, Product, Booking, SoilReading, Alert, Discussion].forEach(model => model.useMongo(mongo));
  if (!mongo) await seed();
  const port = process.env.PORT || 5000;
  return app.listen(port, () => console.log(`AgriTech API listening on port ${port}`));
}

if (require.main === module) start().catch(error => { console.error(error); process.exit(1); });
module.exports = { app, start };
