import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'

interface WeatherData {
  temperature: number
  weatherCode: number
  humidity: number
  location: string
}

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

function icon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2) return '⛅'
  if (code === 3) return '☁️'
  if (code >= 45 && code <= 48) return '🌫'
  if (code >= 51 && code <= 67) return '🌧'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 80 && code <= 86) return '🌦'
  if (code >= 95) return '⛈'
  return '❓'
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

export default function ClockWeather() {
  const { settings } = useSettings()
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [locationName, setLocationName] = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    mounted.current = true
    setLoading(true)
    setError('')

    async function fromCoords(lat: number, lon: number) {
      const [wthr, loc] = await Promise.all([
        fetchWeather(lat, lon),
        reverseGeocode(lat, lon),
      ])
      if (!mounted.current) return
      if (wthr) {
        wthr.location = loc
        setWeather(wthr)
        setLocationName(loc)
      } else {
        setError('No weather data')
      }
      setLoading(false)
    }

    async function fromIP() {
      const ip = await locateByIP()
      if (!mounted.current) return
      if (ip) {
        setLocationName(ip.city)
        const w = await fetchWeather(ip.lat, ip.lon)
        if (mounted.current) {
          if (w) {
            w.location = ip.city
            setWeather(w)
          } else {
            setError('No weather data')
          }
          setLoading(false)
        }
      } else {
        setError('Could not detect location')
        setLoading(false)
      }
    }

    const manual = settings.cityName.trim()
    if (manual) {
      setLoading(true)
      geocode(manual).then((coords) => {
        if (!mounted.current) return
        if (!coords) {
          setError(`City "${manual}" not found`)
          setLoading(false)
          return
        }
        fetchWeather(coords.lat, coords.lon).then((w) => {
          if (!mounted.current) return
          if (w) {
            w.location = manual
            setWeather(w)
            setLocationName(manual)
          } else {
            setError('No weather data')
          }
          setLoading(false)
        })
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
        {loading && (
          <div className="text-xs text-gray-500 animate-pulse">Loading weather...</div>
        )}
        {error && !loading && (
          <div className="text-xs text-gray-600">{error}</div>
        )}
        {weather && !loading && (
          <>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl sm:text-3xl">{icon(weather.weatherCode)}</span>
              <span className="text-2xl sm:text-3xl font-light text-gray-100 tabular-nums">
                {Math.round(weather.temperature)}°
              </span>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              {labels[weather.weatherCode] || 'Unknown'}
              {locationName && <span> · {locationName}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
