import { useState, useRef, useEffect } from 'react'
import { useSettings, themes, radiusOptions, defaultWidgetOrder, type ThemeKey, type BorderRadius } from '../context/SettingsContext'

interface CityResult {
  name: string
  admin1?: string
  country: string
  country_code: string
  latitude: number
  longitude: number
}

const widgetLabels: Record<string, string> = {
  clock: 'Clock + Weather',
  search: 'Search',
  pinned: 'Pinned Bookmarks',
  quicklinks: 'Quick Links',
  todos: 'Todos',
}

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`cursor-pointer relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-blue-500' : 'bg-white/[0.12] hover:bg-white/[0.18]'
      }`}
      aria-label={checked ? 'Disable' : 'Enable'}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const { settings, updateSettings } = useSettings()

  const [cityQuery, setCityQuery] = useState(settings.cityName)
  const [suggestions, setSuggestions] = useState<CityResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [fetching, setFetching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCityQuery(settings.cityName)
  }, [settings.cityName, open])

  useEffect(() => {
    const trimmed = cityQuery.trim()
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setFetching(true)
      try {
        const r = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`,
        )
        const d = await r.json()
        setSuggestions(d.results || [])
        setShowDropdown(true)
      } catch {
        setSuggestions([])
      }
      setFetching(false)
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [cityQuery])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function isHidden(id: string) {
    return settings.hiddenWidgets.includes(id)
  }

  function toggleWidget(id: string) {
    const hidden = [...settings.hiddenWidgets]
    const idx = hidden.indexOf(id)
    if (idx === -1) {
      hidden.push(id)
    } else {
      hidden.splice(idx, 1)
    }
    updateSettings({ hiddenWidgets: hidden })
  }

  function resetSettings() {
    updateSettings({
      theme: 'midnight',
      borderRadius: '2xl',
      widgetOrder: [...defaultWidgetOrder],
      hiddenWidgets: [],
      widgetSpan: {},
      cityName: '',
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer fixed top-4 right-4 z-40 w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-gray-200 hover:bg-white/[0.10] hover:border-white/[0.16] transition-all"
        aria-label="Open settings"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-0 h-full w-80 bg-[#12121c] border-l border-white/[0.08] p-6 overflow-y-auto shadow-2xl"
            style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Settings</h2>
              <button
                onClick={() => setOpen(false)}
                className="cursor-pointer text-gray-500 hover:text-gray-200 transition-colors rounded-lg p-1 hover:bg-white/[0.08]"
                aria-label="Close settings"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <style>{`
              @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}</style>

            <div className="mb-6">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Customize your dashboard appearance and behavior.
              </p>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Color Theme
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(themes) as ThemeKey[]).map((key) => {
                    const t = themes[key]
                    return (
                      <button
                        key={key}
                        onClick={() => updateSettings({ theme: key })}
                        className={`cursor-pointer relative p-3 rounded-xl border transition-all ${
                          settings.theme === key
                            ? 'border-white/[0.2] bg-white/[0.08]'
                            : 'border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientVia}, ${t.gradientTo})`,
                          }}
                        />
                        <span className="text-xs text-gray-400">{t.name}</span>
                        {settings.theme === key && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Corner Radius
                </h3>
                <div className="flex gap-2">
                  {radiusOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateSettings({ borderRadius: opt.key as BorderRadius })}
                      className={`cursor-pointer flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                        settings.borderRadius === opt.key
                          ? 'border-white/[0.2] bg-white/[0.08]'
                          : 'border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div
                        className={`w-full h-6 bg-white/[0.1] ${opt.preview}`}
                      />
                      <span className="text-[10px] text-gray-500">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Weather
                </h3>
                <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">
                  Enter a city for manual weather, or leave empty to use your location.
                </p>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value)
                      updateSettings({ cityName: e.target.value })
                    }}
                    placeholder="e.g. London, Tokyo..."
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                  {fetching && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 animate-pulse">
                      ...
                    </span>
                  )}
                  {showDropdown && suggestions.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a24] border border-white/[0.08] rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50"
                    >
                      {suggestions.map((city, i) => (
                        <button
                          key={`${city.latitude}-${city.longitude}-${i}`}
                          onClick={() => {
                            setCityQuery(city.name)
                            updateSettings({ cityName: city.name })
                            setShowDropdown(false)
                          }}
                          className="cursor-pointer w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.06] transition-colors border-b border-white/[0.05] last:border-0"
                        >
                          <span>{city.name}</span>
                          {city.admin1 && <span className="text-gray-500">, {city.admin1}</span>}
                          <span className="text-gray-600"> · {city.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Widgets
                </h3>
                <div className="space-y-1.5">
                  {defaultWidgetOrder.map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      <span className="text-sm text-gray-300">{widgetLabels[id]}</span>
                      <Toggle checked={!isHidden(id)} onChange={() => toggleWidget(id)} />
                    </div>
                  ))}
                </div>
              </section>

              <button
                onClick={resetSettings}
                className="cursor-pointer w-full px-4 py-2.5 text-sm text-gray-500 hover:text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.12] rounded-xl border border-white/[0.06] transition-all"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
