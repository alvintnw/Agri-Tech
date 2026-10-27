# AgriTech

AgriTech is a responsive farm-management workspace for farmers and administrators. The project is based on the supplied case study and includes a React dashboard plus an Express MVC API.

## Run locally

### Frontend

```powershell
npm install
npm run dev
```

The Vite app opens at `http://localhost:5173`.

### Backend

```powershell
cd server
npm install
copy .env.example .env
npm start
```

The API runs at `http://localhost:5000`. It starts with an in-memory store, so MongoDB is optional for local demos. Set `MONGODB_URI` in `server/.env` to enable persistence.

## Included product areas

- Farmer overview dashboard with farm KPIs, crop health, weather, smart irrigation insight, and activity log.
- Farm setup and task tracking.
- Crop monitoring with growth progress and overall health.
- Weather forecast workspace with city search, location conditions, metrics, and multi-day forecast.
- Resource catalogue and order actions for seeds, fertilizer, and pest control.
- Farmer community discussions and expert consultation entry point.
- Express MVC API with JWT authentication, farmer/admin role authorization, farms, crops, products, bookings, dashboard, and health endpoints.
- Frontend login now uses the API JWT and persists the signed-in user; admin users receive an admin centre with live API counts and user listing.
- Soil and alerts endpoints provide the first monitoring layer for moisture, pH, NPK readings, and open farm alerts.
- Community discussions now persist through authenticated `GET|POST /api/community` endpoints and are rendered from API data.
- Farm and crop screens now attempt to load authenticated API data, farm creation persists through the API, and soil readings can be submitted from the UI.
- Weather search uses OpenWeatherMap when `VITE_OPENWEATHER_API_KEY` is configured and gives an explicit fallback message when it is not.
- Responsive layout for mobile, tablet, and desktop screens.
- Admin order management supports listing bookings and updating their status.
- Backend validation, ownership checks, security headers, CORS allowlisting,
  rate limiting, and API regression tests are included.

For live weather, create a frontend `.env` file with `VITE_OPENWEATHER_API_KEY=your_key`. Without that key, the weather workspace deliberately retains its demo conditions and explains how to enable live data.
