import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import dotenv from 'dotenv'

dotenv.config()

console.log('Current working directory:', process.cwd())
console.log('API_KEY:', process.env.API_KEY)

const API_KEY = process.env.API_KEY
const BASE_URL = process.env.BASE_URL || 'https://api.openweathermap.org/data/2.5'

if (!API_KEY) {
  console.error('Please set API_KEY in .env file')
  process.exit(1)
}

const app = new Hono()

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 1分

app.use('*', cors({ origin: '*' }))

app.get('/compare', async (c) => {
  const citiesParam = c.req.query('cities')
  if (!citiesParam) {
    return c.json({ error: 'Cities parameter is required' }, { status: 400 })
  }

  const cities = citiesParam.split(',')
  const results: Record<string, any> = {}

  try {
    const weatherPromises = cities.map(async (city) => {
      const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      console.log('[COMPARE] Fetching:', url)
      const res = await fetch(url)
      if (!res.ok) {
        console.error(`[COMPARE] Failed to fetch weather data for city: ${city}, status: ${res.status}`)
        results[city] = { error: 'Failed to fetch weather data' }
        return
      }
      const data = await res.json()
      results[city] = {
        city: data.name,
        temp: data.main.temp,
        weather: data.weather[0].description,
        humidity: data.main.humidity,
      }
    })

    await Promise.all(weatherPromises)
    return c.json(results)
  } catch (error) {
    console.error('[COMPARE] Internal Server Error:', error)
    return c.json({ error: 'Internal Server Error' }, { status: 500 })
  }
})

const userFavorites: Record<string, string[]> = {}

app.get('/favorites', (c) => {
  const userId = c.req.query('userId') || 'default'
  return c.json({ favorites: userFavorites[userId] || [] })
})

app.post('/favorites', async (c) => {
  const body = await c.req.json<{ userId?: string; city?: string }>()
  const userId = body.userId || 'default'
  const city = body.city

  if (!city) {
    return c.json({ error: 'City name is required' }, { status: 400 })
  }

  if (!userFavorites[userId]) {
    userFavorites[userId] = []
  }

  if (!userFavorites[userId].includes(city)) {
    userFavorites[userId].push(city)
  }

  return c.json({ favorites: userFavorites[userId] })
})

app.delete('/favorites', async (c) => {
  const body = await c.req.json<{ userId?: string; city?: string }>()
  const userId = body.userId || 'default'
  const city = body.city

  if (!city) {
    return c.json({ error: 'City name is required' }, { status: 400 })
  }

  if (!userFavorites[userId]) {
    return c.json({ favorites: [] })
  }

  userFavorites[userId] = userFavorites[userId].filter((fav) => fav !== city)
  return c.json({ favorites: userFavorites[userId] })
})

// 先に現在地用エンドポイントを定義
app.get('/weather/current', async (c) => {
  const lat = c.req.query('lat')
  const lon = c.req.query('lon')

  if (!lat || !lon) {
    return c.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  console.log('[CURRENT WEATHER] Fetching:', url)

  try {
    const res = await fetch(url)
    console.log('[CURRENT WEATHER] Status:', res.status)

    if (res.status === 404) {
      console.error('[CURRENT WEATHER] City not found for coordinates:', lat, lon)
      return c.json({ error: 'City not found' }, { status: 404 })
    }

    if (!res.ok) {
      console.error('[CURRENT WEATHER] Failed to fetch weather data:', res.status)
      return c.json({ error: 'Failed to fetch weather data' }, { status: res.status })
    }

    const data = await res.json()
    return c.json({
      city: data.name,
      temp: data.main.temp,
      weather: data.weather[0].description,
      humidity: data.main.humidity,
    })
  } catch (error) {
    console.error('[CURRENT WEATHER] Internal Server Error:', error)
    return c.json({ error: 'Internal Server Error' }, { status: 500 })
  }
})

// 次に都市指定用エンドポイントを定義
app.get('/weather/:city', async (c) => {
  const city = c.req.param('city')
  if (!city) {
    return c.json({ error: 'City name is required' }, { status: 400 })
  }

  const now = Date.now()
  if (cache.has(city)) {
    const cached = cache.get(city)!
    if (now - cached.timestamp < CACHE_DURATION) {
      return c.json(cached.data)
    }
  }

  try {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    console.log('[WEATHER BY CITY] Fetching:', url)
    const res = await fetch(url)

    console.log('[WEATHER BY CITY] Status:', res.status)
    if (res.status === 404) {
      console.error('[WEATHER BY CITY] City not found for:', city)
      return c.json({ error: 'City not found' }, { status: 404 })
    }

    if (!res.ok) {
      console.error('[WEATHER BY CITY] Failed to fetch weather data:', res.status)
      return c.json({ error: 'Failed to fetch weather data' }, { status: 500 })
    }

    const data = await res.json()
    const result = {
      city: data.name,
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      weather: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
    }

    cache.set(city, { data: result, timestamp: now })
    return c.json(result)
  } catch (error) {
    console.error('[WEATHER BY CITY] Internal Server Error:', error)
    return c.json({ error: 'Internal Server Error' }, { status: 500 })
  }
})

app.get('/', (c) => c.text('Weather Backend API is running!'))

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`)
})
