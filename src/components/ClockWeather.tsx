import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from 'lucide-react'

interface WeatherData {
  temperature: number
  weatherCode: number
  humidity: number
  location: string
}

interface CacheEntry {
  data: WeatherData
  location: string
  timestamp: number
  lat: number
  lon: number
}

const CACHE_DURATION = 10 * 60 * 1000
const CACHE_PREFIX = 'weather-cache'

const labels: Record<number, string> = {
  0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing Rime Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
  56: 'Light Freezing Drizzle', 57: 'Dense Freezing Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
  80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
  85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with Slight Hail', 99: 'Thunderstorm with Heavy Hail',
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const cls = className || 'w-9 h-9 sm:w-10 sm:h-10'

  if (code === 0) return <Sun className={cls} stroke="#FF9500" fill="#FF9500" fillOpacity={0.15} strokeWidth={1.5} />
  if (code <= 2) return <CloudSun className={cls} stroke="#AEAEB2" fill="#AEAEB2" fillOpacity={0.15} strokeWidth={1.5} />
  if (code === 3) return <Cloud className={cls} stroke="#8E8E93" fill="#8E8E93" fillOpacity={0.15} strokeWidth={1.5} />
  if (code >= 45 && code <= 48) return <CloudFog className={cls} stroke="#AEAEB2" fill="#AEAEB2" fillOpacity={0.15} strokeWidth={1.5} />
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 86)) return <CloudDrizzle className={cls} stroke="#5AC8FA" fill="#5AC8FA" fillOpacity={0.1} strokeWidth={1.5} />
  if (code >= 61 && code <= 67) return <CloudRain className={cls} stroke="#007AFF" fill="#007AFF" fillOpacity={0.1} strokeWidth={1.5} />
  if (code >= 71 && code <= 77) return <CloudSnow className={cls} stroke="#F2F2F7" fill="#F2F2F7" fillOpacity={0.15} strokeWidth={1.5} />
  if (code >= 95) return <CloudLightning className={cls} stroke="#FF9500" fill="#636366" fillOpacity={0.2} strokeWidth={1.5} />
  return null
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`,
    )
    const d = await r.json()
    if (!d.current) return null
    return {
      temperature: d.current.temperature_2m,
      weatherCode: d.current.weather_code,
      humidity: d.current.relative_humidity_2m,
      location: '',
    }
  } catch {
    return null
  }
}

async function geocode(city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    )
    const d = await r.json()
    if (d.results?.[0]) return { lat: d.results[0].latitude, lon: d.results[0].longitude }
  } catch {}
  return null
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=en`,
      { headers: { 'User-Agent': 'RDJ-Dashboard/1.0' } },
    )
    const d = await r.json()
    return d.address?.city || d.address?.town || d.address?.county || ''
  } catch {
    return ''
  }
}

async function locateByIP(): Promise<{ lat: number; lon: number; city: string } | null> {
  try {
    const r = await fetch('https://ip-api.com/json/?fields=lat,lon,city')
    const d = await r.json()
    if (d.lat && d.lon) return { lat: d.lat, lon: d.lon, city: d.city || '' }
  } catch {}
  return null
}

function greeting(h: number): string {
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function cacheKey(cityName: string): string {
  return `${CACHE_PREFIX}-${cityName || 'auto'}`
}

function loadCache(cityName: string): { entry: CacheEntry | null; fresh: boolean } {
  try {
    const raw = localStorage.getItem(cacheKey(cityName))
    if (!raw) return { entry: null, fresh: false }
    const entry: CacheEntry = JSON.parse(raw)
    const age = Date.now() - entry.timestamp
    return { entry, fresh: age < CACHE_DURATION }
  } catch {
    return { entry: null, fresh: false }
  }
}

function saveCache(cityName: string, data: WeatherData, location: string, lat: number, lon: number) {
  const entry: CacheEntry = { data, location, timestamp: Date.now(), lat, lon }
  try {
    localStorage.setItem(cacheKey(cityName), JSON.stringify(entry))
  } catch {}
}

export default function ClockWeather() {
  const { settings } = useSettings()
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [locationName, setLocationName] = useState('')
  const mounted = useRef(true)
  const cachedCoords = useRef<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    mounted.current = true
    setLoading(true)
    setError('')

    const manual = settings.cityName.trim()

    const { entry, fresh } = loadCache(manual || 'auto')
    if (entry && fresh) {
      setWeather(entry.data)
      setLocationName(entry.location)
      setLoading(false)
      return
    }

    if (entry) {
      setWeather(entry.data)
      setLocationName(entry.location)
    }

    async function fetchAndSave(lat: number, lon: number, loc: string) {
      const w = await fetchWeather(lat, lon)
      if (!mounted.current) return
      if (w) {
        w.location = loc
        setWeather(w)
        setLocationName(loc)
        setError('')
        saveCache(manual || 'auto', w, loc, lat, lon)
      } else if (!entry) {
        setError('No weather data')
      }
      setLoading(false)
    }

    async function fromCoords(lat: number, lon: number) {
      cachedCoords.current = { lat, lon }
      const loc = await reverseGeocode(lat, lon)
      await fetchAndSave(lat, lon, loc)
    }

    async function fromIP() {
      const ip = await locateByIP()
      if (!mounted.current) return
      if (ip) {
        cachedCoords.current = { lat: ip.lat, lon: ip.lon }
        await fetchAndSave(ip.lat, ip.lon, ip.city)
      } else if (!entry) {
        setError('Could not detect location')
        setLoading(false)
      }
    }

    if (manual) {
      geocode(manual).then((coords) => {
        if (!mounted.current) return
        if (!coords) {
          if (!entry) {
            setError(`City "${manual}" not found`)
            setLoading(false)
          }
          return
        }
        cachedCoords.current = coords
        fetchAndSave(coords.lat, coords.lon, manual)
      })
      return
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fromCoords(pos.coords.latitude, pos.coords.longitude),
        () => fromIP(),
        { timeout: 5000, enableHighAccuracy: false },
      )
    } else {
      fromIP()
    }

    return () => { mounted.current = false }
  }, [settings.cityName])

  return (
    <div className="flex items-center justify-between select-none">
      <div>
        <div className="text-[11px] text-gray-400 font-medium mb-2">
          {greeting(time.getHours())}
        </div>
        <div className="text-3xl sm:text-4xl font-extralight text-gray-100 tabular-nums tracking-tight leading-none">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-xs text-gray-500 mt-1.5">
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="text-right">
        {error && !weather && (
          <div className="text-xs text-gray-600">{error}</div>
        )}
        {weather && (
          <>
            <div className="flex items-center gap-2 justify-end">
              <WeatherIcon code={weather.weatherCode} className="w-9 h-9 sm:w-10 sm:h-10" />
              <span className="text-2xl sm:text-3xl font-light text-gray-100 tabular-nums">
                {Math.round(weather.temperature)}°
              </span>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              {loading ? (
                <span className="text-gray-600">Updating...</span>
              ) : (
                <>
                  {labels[weather.weatherCode] || 'Unknown'}
                  {locationName && <span> · {locationName}</span>}
                </>
              )}
            </div>
          </>
        )}
        {!weather && loading && (
          <div className="text-xs text-gray-500 animate-pulse">Loading weather...</div>
        )}
      </div>
    </div>
  )
}
