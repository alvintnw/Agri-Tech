const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('agritech_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Request failed.')
  return body
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  dashboard: () => request('/dashboard'),
  farms: () => request('/farms'),
  createFarm: (farm) => request('/farms', { method: 'POST', body: JSON.stringify(farm) }),
  crops: () => request('/crops'),
  createCrop: (crop) => request('/crops', { method: 'POST', body: JSON.stringify(crop) }),
  products: () => request('/products'),
  createBooking: (booking) => request('/bookings', { method: 'POST', body: JSON.stringify(booking) }),
  bookings: () => request('/bookings'),
  soil: () => request('/monitoring/soil'),
  createSoil: (reading) => request('/monitoring/soil', { method: 'POST', body: JSON.stringify(reading) }),
  alerts: () => request('/monitoring/alerts'),
  resolveAlert: (id) => request(`/monitoring/alerts/${id}/resolve`, { method: 'PUT' }),
  adminOverview: () => request('/admin/overview'),
  adminUsers: () => request('/admin/users')
  ,adminBookings: () => request('/admin/bookings')
  ,updateAdminBooking: (id, status) => request(`/admin/bookings/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
  ,discussions: () => request('/community')
  ,createDiscussion: (discussion) => request('/community', { method: 'POST', body: JSON.stringify(discussion) })
}

export async function fetchWeather(city = 'Madurai') {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY
  if (!key) throw new Error('OpenWeatherMap API key is not configured.')
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`)
  const body = await response.json()
  if (!response.ok) throw new Error(body.message || 'Unable to load weather.')
  return body
}
