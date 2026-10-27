import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  AlertTriangle, ArrowRight, Bell, BookOpen, Bookmark, CalendarDays, CheckCircle2, ChevronDown,
  CloudRain, Droplets, LayoutDashboard, Leaf, LogOut, Menu, MessageCircle, Package,
  Plus, Search, Settings, ShieldCheck, ShoppingCart, Sprout, Sun, TrendingUp, Users,
  X, Wind, Wheat, Zap
} from 'lucide-react'
import './styles.css'
import { api, fetchWeather } from './api'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'farms', label: 'My farms', icon: Sprout },
  { id: 'crops', label: 'Crop health', icon: Wheat },
  { id: 'soil', label: 'Soil & alerts', icon: Droplets },
  { id: 'weather', label: 'Weather', icon: Sun },
  { id: 'resources', label: 'Resources', icon: Package },
  { id: 'community', label: 'Community', icon: MessageCircle },
]

const crops = [
  { name: 'Golden Rice', field: 'North field · 3.2 ha', stage: 'Flowering', progress: 72, color: 'gold' },
  { name: 'Winter Wheat', field: 'East field · 2.4 ha', stage: 'Vegetative', progress: 48, color: 'blue' },
  { name: 'Tomatoes', field: 'Greenhouse 01 · 0.8 ha', stage: 'Harvesting', progress: 89, color: 'red' },
]

function App() {
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAddFarm, setShowAddFarm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState('')
  const [farmRefreshKey, setFarmRefreshKey] = useState(0)
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('agritech_user') || 'null'))
  const [role, setRole] = useState(() => JSON.parse(localStorage.getItem('agritech_user') || 'null')?.role || 'farmer')
  const [city, setCity] = useState('')

  const pageTitle = useMemo(() => [...navItems, { id: 'admin', label: 'Admin centre' }].find(item => item.id === active)?.label || 'Overview', [active])
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800) }
  const visibleNav = role === 'admin' ? [...navItems, { id: 'admin', label: 'Admin centre', icon: ShieldCheck }] : navItems
  const logout = () => { localStorage.removeItem('agritech_token'); localStorage.removeItem('agritech_user'); setUser(null) }

  if (!user) return <LoginScreen onLogin={(nextUser) => { setUser(nextUser); setRole(nextUser.role) }} />

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Leaf size={21} strokeWidth={2.5} /></div>
          <span>agri<span>tech</span></span>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {visibleNav.map(item => {
            const Icon = item.icon
            return <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => { setActive(item.id); setMobileOpen(false) }}>
              <Icon size={18} /><span>{item.label}</span>{item.id === 'community' && <span className="nav-count">4</span>}
            </button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><BookOpen size={17} /></div>
            <strong>Need a hand?</strong>
            <p>Talk to an agriculture expert.</p>
            <button onClick={() => { setActive('community'); notify('Expert consultation request opened') }}>Get advice <ArrowRight size={14} /></button>
          </div>
          <button className="nav-item" onClick={() => setShowSettings(true)}><Settings size={18} /><span>Settings</span></button>
          <button className="nav-item" onClick={logout}><LogOut size={18} /><span>Sign out</span></button>
          <div className="sidebar-profile"><div className="avatar small">{user.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div><div><strong>{user.name}</strong><span>{user.role === 'admin' ? 'Administrator' : 'Farmer account'}</span></div><ChevronDown size={16} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{pageTitle}</strong></div>
          <div className="top-actions">
            <button className="icon-button notification"><Bell size={19} /><i /></button>
            <div className="top-profile"><div className="avatar">{user.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div><div><strong>{user.name}</strong><span>My account</span></div><ChevronDown size={15} /></div>
          </div>
        </header>

        <div className="page">
          {active === 'overview' && <Overview onAddFarm={() => setShowAddFarm(true)} notify={notify} refreshKey={farmRefreshKey} />}
          {active === 'farms' && <Farms onAddFarm={() => setShowAddFarm(true)} notify={notify} refreshKey={farmRefreshKey} />}
          {active === 'crops' && <Crops notify={notify} />}
          {active === 'soil' && <SoilMonitoring notify={notify} />}
          {active === 'weather' && <Weather city={city} setCity={setCity} notify={notify} />}
          {active === 'resources' && <Resources notify={notify} />}
          {active === 'community' && <Community notify={notify} />}
          {active === 'admin' && <Admin notify={notify} />}
        </div>
      </main>
      {showAddFarm && <AddFarmModal close={() => setShowAddFarm(false)} notify={notify} onCreated={() => setFarmRefreshKey(key => key + 1)} />}
      {showSettings && <SettingsModal user={user} close={() => setShowSettings(false)} notify={notify} />}
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  )
}

function PageIntro({ eyebrow, title, description, action }) {
  return <div className="page-intro"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function Overview({ onAddFarm, notify, refreshKey }) {
  const [summary, setSummary] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  useEffect(() => {
    Promise.all([api.dashboard(), api.farms(), api.bookings(), api.products()])
      .then(([dashboard, farms, bookings, products]) => {
        setSummary({ ...dashboard, area: farms.reduce((total, farm) => total + (Number(farm.size) || 0), 0) })
        setRecentOrders(bookings.slice(-3).reverse().map(order => ({ ...order, productName: products.find(product => (product.id || product._id) === order.productId)?.name || 'Farm resource' })))
      })
      .catch(() => {})
  }, [refreshKey])
  const area = summary ? `${summary.area.toFixed(1)} ha` : '6.4 ha'
  const activeCrops = summary ? String(summary.crops).padStart(2, '0') : '08'
  return <><PageIntro eyebrow="Wednesday, 22 October 2026" title={<>Good morning, Ravi <span className="wave">✦</span></>} description="Here’s what’s happening with your farms today." action={<button className="primary-button" onClick={onAddFarm}><Plus size={17} /> Add farm</button>} />
    <div className="stats-grid">
      <Stat icon={<Sprout />} label="Total farm area" value={area} detail="+0.8 ha this season" trend="up" />
      <Stat icon={<Wheat />} label="Active crops" value={activeCrops} detail="3 need attention" trend="warn" />
      <Stat icon={<Droplets />} label="Water usage" value="68%" detail="12% below target" trend="up" />
      <Stat icon={<TrendingUp />} label="Estimated yield" value="4.8 t" detail="+18.4% vs last year" trend="up" />
    </div>
    <div className="dashboard-grid">
      <section className="panel weather-panel">
        <div className="panel-header"><div><span className="section-kicker">LOCAL CONDITIONS</span><h2>Weather today</h2></div><button className="text-button" onClick={() => notify('Opening detailed weather forecast')}>View forecast <ArrowRight size={15} /></button></div>
        <div className="weather-main"><div className="weather-icon"><Sun size={37} /></div><div><strong>28°</strong><span>Partly cloudy</span></div><div className="weather-location">📍 Madurai, TN<br /><small>Feels like 30°</small></div></div>
        <div className="weather-details"><div><Droplets size={16} /><span>Humidity</span><strong>64%</strong></div><div><Wind size={16} /><span>Wind</span><strong>12 km/h</strong></div><div><CloudRain size={16} /><span>Rain chance</span><strong>20%</strong></div></div>
      </section>
      <section className="panel insight-panel"><div className="insight-top"><div className="insight-icon"><Zap size={18} /></div><span>SMART INSIGHT</span></div><h2>Great day for irrigation</h2><p>Low rain probability and dry soil conditions detected in North field. Consider watering before 10:00 AM.</p><button className="dark-button" onClick={() => notify('Irrigation task added to your activity log')}>Add to activities <ArrowRight size={15} /></button></section>
    </div>
    <div className="content-grid">
      <section className="panel"><div className="panel-header"><div><span className="section-kicker">FIELD OVERVIEW</span><h2>Crop health</h2></div><button className="text-button" onClick={() => notify('Crop health report downloaded')}>View report <ArrowRight size={15} /></button></div><div className="crop-list">{crops.map(crop => <CropRow key={crop.name} crop={crop} />)}</div></section>
      <section className="panel activity-panel"><div className="panel-header"><div><span className="section-kicker">YOUR FARM LOG</span><h2>Recent activity</h2></div><button className="icon-button" onClick={() => notify('Activity log refreshed')}><CalendarDays size={18} /></button></div>{recentOrders.length ? recentOrders.map(order => <Activity key={order.id || order._id} icon={<ShoppingCart />} title="Order placed" desc={`${order.productName} · Qty ${order.quantity || 1}`} time={new Date(order.bookingDate || order.createdAt).toLocaleDateString('en-IN')} />) : <><Activity icon={<Droplets />} title="Irrigation completed" desc="North field · 1,200 L" time="Today, 08:42 AM" /><Activity icon={<Sprout />} title="Crop inspection added" desc="Tomatoes · Greenhouse 01" time="Yesterday, 04:15 PM" /><Activity icon={<ShoppingCart />} title="Order delivered" desc="Organic NPK fertilizer" time="20 Oct, 11:30 AM" /></>}</section>
    </div>
  </>
}

function Stat({ icon, label, value, detail, trend }) { return <div className="stat-card"><div className="stat-icon">{icon}</div><span className="stat-label">{label}</span><strong>{value}</strong><span className={`stat-detail ${trend}`}>{trend === 'up' ? '↗' : '●'} {detail}</span></div> }
function CropRow({ crop }) { return <div className="crop-row"><div className={`crop-thumb ${crop.color}`}><Sprout size={20} /></div><div className="crop-name"><strong>{crop.name}</strong><span>{crop.field}</span></div><span className="stage">{crop.stage}</span><div className="progress-wrap"><div className="progress"><i style={{ width: `${crop.progress}%` }} /></div><span>{crop.progress}%</span></div><button className="more-button">•••</button></div> }
function Activity({ icon, title, desc, time }) { return <div className="activity"><div className="activity-icon">{icon}</div><div><strong>{title}</strong><span>{desc}</span></div><time>{time}</time></div> }

function Farms({ onAddFarm, notify, refreshKey }) {
  const [farms, setFarms] = useState([])
  useEffect(() => { api.farms().then(setFarms).catch(() => setFarms([])) }, [refreshKey])
  return <><PageIntro eyebrow="FARM MANAGEMENT" title="My farms" description="Keep your fields, crops, and irrigation plans in one place." action={<button className="primary-button" onClick={onAddFarm}><Plus size={17} /> Add farm</button>} /><div className="farm-cards">{farms.length ? farms.map(farm => <FarmCard key={farm.id} name={farm.name} location={farm.location || 'Location not set'} area={`${farm.size || 0} ${farm.unit || 'ha'}`} crops="Active crops" status="Healthy" />) : <FarmCard name="Ravi Organic Estate" location="Madurai, Tamil Nadu" area="4.8 ha" crops="5 active crops" status="Healthy" />}</div><section className="panel table-panel"><div className="panel-header"><div><span className="section-kicker">FARM ACTIVITIES</span><h2>Upcoming tasks</h2></div><button className="text-button" onClick={() => notify('Task manager opened')}>Manage tasks <ArrowRight size={15} /></button></div><div className="task-row"><CheckCircle2 size={19} className="done" /><div><strong>Apply organic fertilizer</strong><span>North field · Golden Rice</span></div><time>Today · 10:30 AM</time><span className="tag green">Scheduled</span></div><div className="task-row"><AlertTriangle size={19} className="warning" /><div><strong>Check soil moisture</strong><span>East field · Winter Wheat</span></div><time>Tomorrow · 07:00 AM</time><span className="tag amber">Pending</span></div></section></>
}
function FarmCard({ name, location, area, crops: cropCount, status, warn }) { return <div className="farm-card"><div className="farm-cover"><div className="farm-cover-icon"><Sprout size={25} /></div><button className="more-button">•••</button></div><div className="farm-info"><div className="farm-title"><h2>{name}</h2><span className={`tag ${warn ? 'amber' : 'green'}`}>{status}</span></div><p>📍 {location}</p><div className="farm-meta"><span><RulerIcon /> {area}</span><span><Wheat size={15} /> {cropCount}</span></div></div></div> }
function RulerIcon() { return <span className="ruler">↔</span> }

function Crops({ notify }) {
  const [items, setItems] = useState(crops)
  const [showForm, setShowForm] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [form, setForm] = useState({ name: '', type: '', farmId: '', status: 'planned' })
  useEffect(() => { api.crops().then(result => { if (result.length) setItems(result.map((item, index) => ({ ...item, field: item.farmId || 'Farm field', stage: item.status || 'Growing', progress: Math.min(95, 35 + index * 15), color: ['gold', 'blue', 'red'][index % 3] }))) }).catch(() => {}) }, [])
  const submit = async event => {
    event.preventDefault()
    try {
      const created = await api.createCrop(form)
      setItems(current => [...current, { ...created, field: created.farmId || 'Farm field', stage: created.status || 'planned', progress: 15, color: ['gold', 'blue', 'red'][current.length % 3] }])
      setForm({ name: '', type: '', farmId: '', status: 'planned' })
      setShowForm(false)
      notify('Crop added successfully')
    } catch (error) { notify(error.message) }
  }
  return <><PageIntro eyebrow="CROP MONITORING" title="Crop health" description="Monitor growth, soil conditions, and yield predictions across your fields." action={<button className="primary-button" onClick={() => setShowForm(true)}><Plus size={17} /> Add crop</button>} /><div className="health-banner"><div className="health-icon"><ShieldCheck size={23} /></div><div><strong>All systems look healthy</strong><p>Your crops are performing 12% better than the seasonal average.</p></div><div className="health-score"><span>Overall health</span><strong>84<span>/100</span></strong></div></div><div className="crop-card-grid">{items.map(c => <div className="crop-card" key={c.id || c.name}><div className={`crop-card-head ${c.color}`}><Sprout size={28} /><button className="more-button">•••</button></div><div className="crop-card-body"><span className="section-kicker">{c.stage.toUpperCase()}</span><h2>{c.name}</h2><p>{c.field}</p><div className="crop-card-progress"><div className="progress"><i style={{width:`${c.progress}%`}} /></div><strong>{c.progress}%</strong></div><div className="crop-foot"><span>Last checked today</span><button className="text-button" onClick={() => setSelectedCrop(c)}>Details <ArrowRight size={14} /></button></div></div></div>)}</div>{selectedCrop && <div className="modal-backdrop" onMouseDown={() => setSelectedCrop(null)}><div className="modal" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">CROP DETAILS</span><h2>{selectedCrop.name}</h2></div><button onClick={() => setSelectedCrop(null)}><X size={20} /></button></div><p className="detail-copy">Field: {selectedCrop.field}</p><p className="detail-copy">Stage: {selectedCrop.stage}</p><p className="detail-copy">Growth progress: {selectedCrop.progress}%</p><div className="modal-actions"><button className="primary-button" onClick={() => setSelectedCrop(null)}>Close</button></div></div></div>}{showForm && <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="modal" onSubmit={submit} onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">CROP MONITORING</span><h2>Add crop</h2></div><button type="button" onClick={() => setShowForm(false)}><X size={20} /></button></div><label>Crop name<input required maxLength="100" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Golden Rice" /></label><label>Crop type<input value={form.type} onChange={event => setForm({ ...form, type: event.target.value })} placeholder="e.g. Rice" /></label><label>Field or farm<input value={form.farmId} onChange={event => setForm({ ...form, farmId: event.target.value })} placeholder="North field" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button">Save crop <ArrowRight size={15} /></button></div></form></div>}</>
}

function Weather({ city, setCity, notify }) {
  const [data, setData] = useState(null)
  const [weatherError, setWeatherError] = useState('')
  const search = async () => { try { setWeatherError(''); setData(await fetchWeather(city || 'Madurai')) } catch (error) { setWeatherError(error.message); notify('Showing demo weather because live weather is unavailable') } }
  useEffect(() => { search() }, [])
  const temperature = data ? Math.round(data.main.temp) : 28
  const location = data ? `${data.name}, ${data.sys.country}` : 'Madurai, TN'
  return <><PageIntro eyebrow="LOCAL CONDITIONS" title="Weather forecast" description="Plan irrigation and protect your crops with live conditions." action={<div className="search-box"><Search size={17} /><input value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Search city..." /><button onClick={search}>Search</button></div>} />{weatherError && <div className="form-error weather-error">{weatherError} Add <code>VITE_OPENWEATHER_API_KEY</code> to use live weather.</div>}<div className="weather-hero"><div><span className="section-kicker">CURRENT LOCATION · {location.toUpperCase()}</span><div className="hero-temp"><Sun size={50} /><strong>{temperature}°</strong><span>{data?.weather?.[0]?.description || 'Partly cloudy'}</span></div><p>Live conditions for irrigation and field planning.</p></div><div className="hero-advice"><Zap size={19} /><strong>Good conditions for field work</strong><span>Light wind and low rain probability today.</span></div></div><div className="forecast-row">{['Thu','Fri','Sat','Sun','Mon'].map((day, i) => <div className="forecast-card" key={day}><strong>{day}</strong><Sun size={24} /><b>{temperature + 1 - i}°</b><span>{i + 15}% rain</span></div>)}</div><div className="weather-metrics"><Metric icon={<Droplets />} label="Humidity" value={`${data?.main?.humidity || 64}%`} /><Metric icon={<Wind />} label="Wind speed" value={`${data?.wind?.speed ? Math.round(data.wind.speed * 3.6) : 12} km/h`} /><Metric icon={<CloudRain />} label="Rainfall" value="0.4 mm" /><Metric icon={<Zap />} label="Pressure" value={`${data?.main?.pressure || 1012} hPa`} /></div></>
}
function Metric({ icon, label, value }) { return <div className="metric"><div>{icon}</div><span>{label}</span><strong>{value}</strong></div> }
function Resources({ notify }) {
  const fallback = [
    { name: 'Organic NPK Fertilizer', description: 'Improves soil health and crop growth', price: 1280, category: 'fertilizer', stock: 50 },
    { name: 'Neem Oil Concentrate', description: 'Natural pest protection for vegetables', price: 650, category: 'pest', stock: 20 },
    { name: 'Premium Rice Seeds', description: 'High-yield, climate resilient variety', price: 2400, category: 'seeds', stock: 100 },
  ]
  const [products, setProducts] = useState(fallback)
  const [ordering, setOrdering] = useState('')
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('recommended')
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('agritech_saved_products') || '[]'))
  useEffect(() => { api.products().then(result => { if (result.length) setProducts(result) }).catch(() => {}) }, [])
  useEffect(() => { if (activeTab === 'orders') api.bookings().then(setBookings).catch(error => notify(error.message)) }, [activeTab])
  const order = async product => {
    const productId = product.id || product._id
    if (!productId) return notify('This demo product is unavailable for ordering.')
    try {
      setOrdering(productId)
      await api.createBooking({ productId, quantity: 1 })
      notify(`${product.name} order placed`)
      if (activeTab === 'orders') setBookings(await api.bookings())
    } catch (error) {
      notify(error.message)
    } finally {
      setOrdering('')
    }
  }
  const toggleSaved = product => { const id = product.id || product._id || product.name; const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id]; setSaved(next); localStorage.setItem('agritech_saved_products', JSON.stringify(next)) }
  const visibleProducts = activeTab === 'saved' ? products.filter(product => saved.includes(product.id || product._id || product.name)) : products
  return <><PageIntro eyebrow="RESOURCE CENTRE" title="Farm resources" description="Order supplies and track your upcoming deliveries." action={<button className="primary-button" onClick={() => setActiveTab('recommended')}><ShoppingCart size={17} /> Browse store</button>} /><div className="resource-tabs"><button className={activeTab === 'recommended' ? 'selected' : ''} onClick={() => setActiveTab('recommended')}>Recommended</button><button className={activeTab === 'orders' ? 'selected' : ''} onClick={() => setActiveTab('orders')}>My orders <span>{bookings.length}</span></button><button className={activeTab === 'saved' ? 'selected' : ''} onClick={() => setActiveTab('saved')}>Saved products <span>{saved.length}</span></button></div>{activeTab === 'orders' ? <section className="panel orders-panel">{bookings.length ? bookings.map(booking => { const product = products.find(item => (item.id || item._id) === booking.productId); return <div className="order-row" key={booking.id || booking._id}><div className="activity-icon"><Package size={16} /></div><div><strong>{product?.name || 'Farm resource'}</strong><span>Quantity {booking.quantity || 1} · {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString('en-IN')}</span></div><div className="order-total"><strong>₹ {Number(booking.totalAmount || 0).toLocaleString('en-IN')}</strong><span className="tag green">{booking.status || 'pending'}</span></div></div> }) : <p className="empty-state">No orders yet. Browse the recommended resources to place your first order.</p>}</section> : <div className="product-grid">{visibleProducts.length ? visibleProducts.map(product => { const productId = product.id || product._id; const inStock = Number(product.stock) > 0; return <div className="product-card" key={productId || product.name}><div className={`product-image ${product.category || 'seeds'}`}><Package size={30} /></div><div><button className="save-product" onClick={() => toggleSaved(product)} aria-label={saved.includes(productId) ? `Remove ${product.name} from saved products` : `Save ${product.name}`}><Bookmark size={16} fill={saved.includes(productId) ? 'currentColor' : 'none'} /></button><span className={`tag ${inStock ? 'light' : 'amber'}`}>{inStock ? 'IN STOCK' : 'OUT OF STOCK'}</span><h2>{product.name}</h2><p>{product.description || 'Farm resource for your growing operation.'}</p><div className="product-bottom"><strong>₹ {Number(product.price || 0).toLocaleString('en-IN')}</strong><button disabled={!inStock || ordering === productId} onClick={() => order(product)}><ShoppingCart size={16} /> {ordering === productId ? 'Ordering...' : 'Order'}</button></div></div></div> }) : <p className="empty-state">No saved products yet. Save resources from the Recommended tab.</p>}</div>}</>
}

function SettingsModal({ user, close, notify }) {
  const [name, setName] = useState(user.name)
  const save = event => { event.preventDefault(); const updated = { ...user, name: name.trim() || user.name }; localStorage.setItem('agritech_user', JSON.stringify(updated)); notify('Profile settings saved'); close(); window.location.reload() }
  return <div className="modal-backdrop" onMouseDown={close}><form className="modal" onSubmit={save} onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">ACCOUNT</span><h2>Settings</h2></div><button type="button" onClick={close}><X size={20} /></button></div><label>Display name<input required maxLength="80" value={name} onChange={event => setName(event.target.value)} /></label><p className="detail-copy">Signed in as {user.email}</p><div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button">Save settings</button></div></form></div>
}
function Community({ notify }) {
  const [discussions, setDiscussions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })
  useEffect(() => { api.discussions().then(setDiscussions).catch(() => {}) }, [])
  const submit = async event => { event.preventDefault(); try { const created = await api.createDiscussion(form); setDiscussions([created, ...discussions]); setForm({ title: '', body: '' }); setShowForm(false); notify('Discussion published') } catch (error) { notify(error.message) } }
  return <><PageIntro eyebrow="FARMER COMMUNITY" title="Learn together" description="Ask questions, share what works, and connect with agricultural experts." action={<button className="primary-button" onClick={() => setShowForm(true)}><Plus size={17} /> Start discussion</button>} /><div className="community-grid"><section className="panel discussions"><div className="panel-header"><div><span className="section-kicker">RECENT DISCUSSIONS</span><h2>From the community</h2></div><button className="text-button" onClick={() => api.discussions().then(setDiscussions)}>Refresh <ArrowRight size={15} /></button></div>{discussions.length ? discussions.map(discussion => <div className="discussion" key={discussion.id}><div className="avatar pastel">{(discussion.authorName || 'Farmer').split(' ').map(x => x[0]).join('').slice(0, 2)}</div><div><strong>{discussion.title}</strong><span>{discussion.authorName || 'Farmer'} · {discussion.replies || 0} replies</span></div><time>Recent</time><ArrowRight size={16} /></div>) : <p className="empty-state">No discussions yet. Start the first one.</p>}</section><section className="expert-card"><div className="expert-illustration"><Users size={30} /></div><span className="section-kicker">EXPERT CONSULTATION</span><h2>Get advice from a specialist</h2><p>Have a question about your crops? Book a 1:1 consultation with a verified agricultural expert.</p><button className="dark-button" onClick={() => notify('Showing available experts')}>Find an expert <ArrowRight size={15} /></button></section></div>{showForm && <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="modal" onSubmit={submit} onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">COMMUNITY</span><h2>Start a discussion</h2></div><button type="button" onClick={() => setShowForm(false)}><X size={20} /></button></div><label>Title<input required maxLength="140" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="What would you like to ask?" /></label><label>Message<textarea required maxLength="2000" value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} placeholder="Share details with other farmers..." /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button">Publish <ArrowRight size={15} /></button></div></form></div>}</>
}
function SoilMonitoring({ notify }) {
  const [readings, setReadings] = useState([])
  const [alerts, setAlerts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ farmId: '', moisture: '', ph: '', nitrogen: '', phosphorus: '', potassium: '' })
  const load = () => Promise.all([api.soil(), api.alerts()]).then(([soil, activeAlerts]) => { setReadings(soil); setAlerts(activeAlerts) }).catch(() => notify('Monitoring data is unavailable; showing guidance'))
  useEffect(() => { load() }, [])
  const submit = async event => { event.preventDefault(); try { await api.createSoil(form); setShowForm(false); setForm({ farmId: '', moisture: '', ph: '', nitrogen: '', phosphorus: '', potassium: '' }); await load(); notify('Soil reading saved') } catch (error) { notify(error.message) } }
  const resolve = async alert => { try { await api.resolveAlert(alert.id || alert._id); await load(); notify('Alert marked as resolved') } catch (error) { notify(error.message) } }
  return <><PageIntro eyebrow="FIELD INTELLIGENCE" title="Soil & alerts" description="Track soil health and act early on crop risks." action={<button className="primary-button" onClick={() => setShowForm(true)}><Plus size={17} /> Add reading</button>} /><div className="health-banner"><div className="health-icon"><Droplets size={23} /></div><div><strong>Soil monitoring is active</strong><p>{readings.length ? `${readings.length} readings synced from your account.` : 'Record moisture and nutrients to improve recommendations.'}</p></div><div className="health-score"><span>Latest moisture</span><strong>{readings[0]?.moisture ? `${readings[0].moisture}%` : '—'}</strong></div></div><div className="content-grid"><section className="panel"><div className="panel-header"><div><span className="section-kicker">OPEN ALERTS</span><h2>Needs attention</h2></div><span className="tag amber">{alerts.length} active</span></div>{alerts.length ? alerts.map(alert => <div className="task-row" key={alert.id || alert._id}><AlertTriangle size={19} className="warning" /><div><strong>{alert.title}</strong><span>{alert.message}</span></div><span className="tag amber">{alert.severity}</span><button className="text-button" onClick={() => resolve(alert)}>Resolve</button></div>) : <p className="empty-state">No open pest, disease, or soil alerts.</p>}</section><section className="panel"><div className="panel-header"><div><span className="section-kicker">LATEST READINGS</span><h2>Soil health</h2></div></div>{readings.length ? readings.slice(0, 4).map(reading => <div className="activity" key={reading.id}><div className="activity-icon"><Droplets size={16} /></div><div><strong>Moisture {reading.moisture}% · pH {reading.ph}</strong><span>N {reading.nitrogen} · P {reading.phosphorus} · K {reading.potassium}</span></div></div>) : <p className="empty-state">Add a reading to start your soil history.</p>}</section></div>{showForm && <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="modal" onSubmit={submit} onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">SOIL HEALTH</span><h2>Record reading</h2></div><button type="button" onClick={() => setShowForm(false)}><X size={20} /></button></div><label>Field or farm<input value={form.farmId} onChange={event => setForm({ ...form, farmId: event.target.value })} placeholder="North field" /></label><div className="form-row"><label>Moisture %<input required type="number" value={form.moisture} onChange={event => setForm({ ...form, moisture: event.target.value })} /></label><label>pH<input required type="number" step="0.1" value={form.ph} onChange={event => setForm({ ...form, ph: event.target.value })} /></label></div><div className="form-row"><label>Nitrogen<input required type="number" value={form.nitrogen} onChange={event => setForm({ ...form, nitrogen: event.target.value })} /></label><label>Phosphorus<input required type="number" value={form.phosphorus} onChange={event => setForm({ ...form, phosphorus: event.target.value })} /></label></div><label>Potassium<input required type="number" value={form.potassium} onChange={event => setForm({ ...form, potassium: event.target.value })} /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button">Save reading <ArrowRight size={15} /></button></div></form></div>}</>
}
function AddFarmModal({ close, notify, onCreated }) {
  const [form, setForm] = useState({ name: '', location: '', size: '', unit: 'hectares' })
  const submit = async event => { event.preventDefault(); try { await api.createFarm(form); onCreated(); close(); notify('Farm added successfully') } catch (error) { notify(error.message) } }
  return <div className="modal-backdrop" onMouseDown={close}><form className="modal" onSubmit={submit} onMouseDown={e => e.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">NEW FARM</span><h2>Add your farm</h2></div><button type="button" onClick={close}><X size={20} /></button></div><label>Farm name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Ravi Organic Estate" /></label><label>Location<input required value={form.location} onChange={event => setForm({ ...form, location: event.target.value })} placeholder="City, state" /></label><div className="form-row"><label>Farm size<input required value={form.size} onChange={event => setForm({ ...form, size: event.target.value })} placeholder="0.0" type="number" /></label><label>Unit<select value={form.unit} onChange={event => setForm({ ...form, unit: event.target.value })}><option value="hectares">Hectares</option><option value="acres">Acres</option></select></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button">Save farm <ArrowRight size={15} /></button></div></form></div>
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('farmer@agritech.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const result = await api.login(email, password)
      localStorage.setItem('agritech_token', result.token)
      localStorage.setItem('agritech_user', JSON.stringify(result.user))
      onLogin(result.user)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }
  return <div className="login-shell"><div className="login-card"><div className="brand login-brand"><div className="brand-mark"><Leaf size={21} /></div><span>agri<span>tech</span></span></div><span className="section-kicker">FARMER WORKSPACE</span><h1>Welcome back</h1><p>Sign in to manage your farms with confidence.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button login-submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={15} /></button></form><small>Demo farmer: farmer@agritech.local / password123<br />Demo admin: admin@agritech.local / password123</small></div></div>
}

function Admin({ notify }) {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const load = () => Promise.all([api.adminOverview(), api.adminUsers(), api.adminBookings()]).then(([summary, list, orders]) => { setStats(summary); setUsers(list); setBookings(orders) }).catch(requestError => setError(requestError.message))
  useEffect(() => { load() }, [])
  const updateBooking = async (booking, status) => { try { await api.updateAdminBooking(booking.id || booking._id, status); await load(); notify('Order status updated') } catch (requestError) { notify(requestError.message) } }
  return <><PageIntro eyebrow="ADMINISTRATION" title="Admin centre" description="Monitor platform activity, users, and resources." action={<button className="primary-button" onClick={load}>Refresh data</button>} />{error && <div className="form-error">{error}</div>}<div className="stats-grid">{[['Users', stats?.users ?? '—', Users], ['Farms', stats?.farms ?? '—', Sprout], ['Crops', stats?.crops ?? '—', Wheat], ['Bookings', stats?.bookings ?? '—', CalendarDays]].map(([label, value, Icon]) => <Stat key={label} icon={<Icon />} label={label} value={value} detail="Live from API" trend="up" />)}</div><section className="panel admin-users"><div className="panel-header"><div><span className="section-kicker">ORDER MANAGEMENT</span><h2>Recent orders</h2></div><span className="tag green">{bookings.length} orders</span></div>{bookings.length ? bookings.map(booking => <div className="discussion" key={booking.id || booking._id}><div className="avatar pastel"><ShoppingCart size={15} /></div><div><strong>Order {String(booking.id || booking._id).slice(0, 8)}</strong><span>Quantity {booking.quantity || 1} · ₹ {Number(booking.totalAmount || 0).toLocaleString('en-IN')}</span></div><select value={booking.status || 'pending'} onChange={event => updateBooking(booking, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></div>) : <p className="empty-state">No orders yet.</p>}</section><section className="panel admin-users"><div className="panel-header"><div><span className="section-kicker">USER MANAGEMENT</span><h2>Registered users</h2></div><span className="tag green">{users.length} accounts</span></div>{users.map(account => <div className="discussion" key={account.id}><div className="avatar pastel">{account.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div><div><strong>{account.name}</strong><span>{account.email}</span></div><span className={`tag ${account.role === 'admin' ? 'amber' : 'green'}`}>{account.role}</span></div>)}</section></>
}

createRoot(document.getElementById('root')).render(<App />)
