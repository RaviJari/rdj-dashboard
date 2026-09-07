import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'

const PHOTOS = [
  'photo-1506744038136-46273834b3fb', // river valley at sunset
  'photo-1470071459604-3b5ec3a7fe05', // foggy lake sunrise
  'photo-1469474968028-56623f02e42e', // mountain lake sunrise
  'photo-1441974231531-c6227db76b6e', // forest sun rays
  'photo-1506905925346-21bda4d32df4', // mountain dusk
  'photo-1519681393784-d120267933ba', // snowy peaks under stars
  'photo-1501785888041-af3ef285b470', // mountain lake, summer
  'photo-1472214103451-9374bd1c798e', // grass field at sunset
  'photo-1433086966358-54859d0ed716', // waterfall in forest
  'photo-1508739773434-c26b3d09e071', // northern lights
  'photo-1475924156734-496f6cac6ec1', // ocean waves
  'photo-1458668383970-8ddd3927deed', // starry mountain night
  'photo-1447752875215-b2761acb3c5d', // morning forest path
  'photo-1480714378408-67cf0d13bc1b', // city at night
  'photo-1497436072909-60f360e1d4b1', // open field sunset
  'photo-1493246507139-91e8fad9978e', // misty mountains
]

function dailyIndex(): number {
  const now = new Date()
  const d = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  return d % PHOTOS.length
}

function photoUrl(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2880&q=80`
}

export default function Background() {
  const { theme } = useSettings()
  const [index, setIndex] = useState(dailyIndex)
  const [loaded, setLoaded] = useState(false)

  const photoId = PHOTOS[((index % PHOTOS.length) + PHOTOS.length) % PHOTOS.length]

  function refresh() {
    setLoaded(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
        }}
      />
      <img
        key={photoId}
        src={photoUrl(photoId)}
        alt=""
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          loaded ? 'opacity-55' : 'opacity-0'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />
      <div className="absolute inset-0 bg-black/10" />
      <button
        onClick={refresh}
        className="absolute bottom-4 right-4 z-30 cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.14] text-gray-300 hover:bg-white/[0.16] hover:text-white backdrop-blur-xl transition-all"
        title="Change photo"
        aria-label="Change background photo"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      </button>
    </div>
  )
}