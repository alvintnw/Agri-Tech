const assert = require('node:assert/strict');
const { before, after, test } = require('node:test');

process.env.PORT = '5101';
const { start } = require('../src/app');

let server;
let farmerToken;
let adminToken;

async function request(path, options = {}) {
  const response = await fetch(`http://localhost:5101${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) }
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

before(async () => {
  server = await start();
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'farmer@agritech.local', password: 'password123' })
  });
  farmerToken = login.body.token;
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@agritech.local', password: 'password123' })
  });
  adminToken = adminLogin.body.token;
});

after(() => new Promise(resolve => server.close(resolve)));

test('creates a crop for the authenticated farmer', async () => {
  const result = await request('/api/crops', {
    method: 'POST',
    token: farmerToken,
    body: JSON.stringify({ name: 'Test Rice', type: 'Rice', status: 'planned' })
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.name, 'Test Rice');
});

test('rejects out-of-range soil readings', async () => {
  const result = await request('/api/monitoring/soil', {
    method: 'POST',
    token: farmerToken,
    body: JSON.stringify({ moisture: 120, ph: 7, nitrogen: 1, phosphorus: 1, potassium: 1 })
  });
  assert.equal(result.status, 400);
});

test('rejects bookings above available stock', async () => {
  const products = await request('/api/products', { token: farmerToken });
  const result = await request('/api/bookings', {
    method: 'POST',
    token: farmerToken,
    body: JSON.stringify({ productId: products.body[0].id, quantity: products.body[0].stock + 1 })
  });
  assert.equal(result.status, 400);
});

test('allows admin to list and update booking status', async () => {
  const products = await request('/api/products', { token: farmerToken });
  const created = await request('/api/bookings', {
    method: 'POST',
    token: farmerToken,
    body: JSON.stringify({ productId: products.body[0].id, quantity: 1 })
  });
  assert.equal(created.status, 201);
  const orders = await request('/api/admin/bookings', { token: adminToken });
  assert.equal(orders.status, 200);
  const updated = await request(`/api/admin/bookings/${created.body.id}`, {
    method: 'PUT',
    token: adminToken,
    body: JSON.stringify({ status: 'confirmed' })
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.status, 'confirmed');
});
