# AgriTech API

CommonJS Express MVC backend for the AgriTech application. It runs immediately with an in-memory data store; set `MONGODB_URI` to use MongoDB through Mongoose instead.

## Run

```bash
cd server
npm install
copy .env.example .env
npm start
```

The API listens on `http://localhost:5000` by default. `GET /api/health` is public.

## Endpoints

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET|POST /api/farms`, `GET|PUT|DELETE /api/farms/:id`
- `GET|POST /api/crops`, `GET|PUT|DELETE /api/crops/:id`
- `GET|POST /api/products`, `GET|PUT|DELETE /api/products/:id` (writes require admin)
- `GET|POST /api/bookings`, `PUT /api/bookings/:id`
- `GET /api/dashboard`
- `GET /api/admin/overview`, `GET /api/admin/users`, `PUT /api/admin/users/:id` (admin only)
- `GET /api/admin/bookings`, `PUT /api/admin/bookings/:id` (admin only)
- `GET|POST /api/monitoring/soil`
- `GET /api/monitoring/alerts`, `PUT /api/monitoring/alerts/:id/resolve`
- `GET|POST /api/community`

Protected routes use `Authorization: Bearer <token>`. Seed users are
`farmer@agritech.local` and `admin@agritech.local`, both with password
`password123`. Seed data is only created for the in-memory fallback.

For production, set a strong `JWT_SECRET`, `NODE_ENV=production`, and
`CORS_ORIGIN` to the frontend origin. The API enables Helmet security headers
and request rate limiting. Run `npm test` to execute API regression tests.
