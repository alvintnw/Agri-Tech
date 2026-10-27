const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');

const collections = {
  users: [],
  farms: [],
  crops: [],
  products: [],
  bookings: [],
  soilReadings: [],
  alerts: []
  ,discussions: []
};

function id() { return randomUUID(); }
function now() { return new Date().toISOString(); }

async function seed() {
  if (collections.users.length) return;
  const password = await bcrypt.hash('password123', 10);
  collections.users.push({ _id: id(), name: 'Demo Farmer', email: 'farmer@agritech.local', password, role: 'farmer', createdAt: now() });
  collections.users.push({ _id: id(), name: 'AgriTech Admin', email: 'admin@agritech.local', password, role: 'admin', createdAt: now() });
  collections.products.push(
    { _id: id(), name: 'Premium Rice Seeds', category: 'seeds', price: 24.99, unit: 'kg', stock: 100, description: 'High-yield rice seeds.' },
    { _id: id(), name: 'Organic Fertilizer', category: 'fertilizer', price: 18.50, unit: 'bag', stock: 50, description: 'Nutrient-rich organic fertilizer.' }
  );
  collections.alerts.push({
    _id: id(), title: 'Check soil moisture', type: 'soil', severity: 'medium',
    message: 'East field moisture is below the recommended range.', status: 'open',
    farmId: '', createdAt: now(), updatedAt: now()
  });
  collections.discussions.push(
    { _id: id(), title: 'Best natural treatment for leaf curl?', body: 'What has worked for your vegetable crops this season?', authorId: collections.users[0]._id, authorName: 'Demo Farmer', replies: 12, createdAt: now(), updatedAt: now() },
    { _id: id(), title: 'How often should I irrigate tomatoes?', body: 'Looking for advice from greenhouse growers.', authorId: collections.users[0]._id, authorName: 'Demo Farmer', replies: 8, createdAt: now(), updatedAt: now() }
  );
}

function getCollection(name) { return collections[name]; }
module.exports = { collections, getCollection, id, now, seed };
