const { SoilReading, Alert } = require('../models/schemas');

async function readings(req, res, next) {
  try { res.json(await SoilReading.find({ recordedBy: req.user.id })); } catch (error) { next(error); }
}

async function createReading(req, res, next) {
  try {
    const { farmId, moisture, ph, nitrogen, phosphorus, potassium, notes } = req.body;
    if ([moisture, ph, nitrogen, phosphorus, potassium].some(value => value === undefined || value === '' || !Number.isFinite(Number(value)))) {
      return res.status(400).json({ message: 'All soil measurements must be numeric.' });
    }
    if (Number(moisture) < 0 || Number(moisture) > 100 || Number(ph) < 0 || Number(ph) > 14 || [nitrogen, phosphorus, potassium].some(value => Number(value) < 0)) {
      return res.status(400).json({ message: 'Soil measurements are outside the allowed range.' });
    }
    res.status(201).json(await SoilReading.create({ farmId, moisture: Number(moisture), ph: Number(ph), nitrogen: Number(nitrogen), phosphorus: Number(phosphorus), potassium: Number(potassium), notes, recordedBy: req.user.id }));
  } catch (error) { next(error); }
}

async function alerts(req, res, next) {
  try { res.json(await Alert.find({ status: 'open' })); } catch (error) { next(error); }
}

async function closeAlert(req, res, next) {
  try {
    const alert = await Alert.update(req.params.id, { status: 'resolved' });
    if (!alert) return res.status(404).json({ message: 'Alert not found.' });
    res.json(alert);
  } catch (error) { next(error); }
}

module.exports = { readings, createReading, alerts, closeAlert };
