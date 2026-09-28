import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { setStored } from '../lib/storage'

export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ThemeKey = 'midnight' | 'slate' | 'emerald' | 'amber' | 'ruby' | 'ocean'

export interface Theme {
  name: string
  gradientFrom: string
  gradientVia: string
  gradientTo: string
  accent: string
  accentText: string
}

export const themes: Record<ThemeKey, Theme> = {
  midnight: {
    name: 'Midnight',
    gradientFrom: '#0a0a0f',
    gradientVia: '#0d0d14',
    gradientTo: '#0a0a0f',
    accent: '#3b82f6',
    accentText: '#60a5fa',
  },
  slate: {
    name: 'Slate',
    gradientFrom: '#0f172a',
    gradientVia: '#1e293b',
    gradientTo: '#0f172a',
    accent: '#64748b',
    accentText: '#94a3b8',
  },
  emerald: {
    name: 'Emerald',
    gradientFrom: '#022c22',
    gradientVia: '#064e3b',
    gradientTo: '#022c22',
    accent: '#10b981',
    accentText: '#34d399',
  },
  amber: {
    name: 'Amber',
    gradientFrom: '#1c1917',
    gradientVia: '#292524',
    gradientTo: '#1c1917',
    accent: '#f59e0b',
    accentText: '#fbbf24',
  },
  ruby: {
    name: 'Ruby',
    gradientFrom: '#1f0a0a',
    gradientVia: '#2d0f0f',
    gradientTo: '#1f0a0a',
    accent: '#ef4444',
    accentText: '#f87171',
  },
  ocean: {
    name: 'Ocean',
    gradientFrom: '#0a1628',
    gradientVia: '#0f1f3d',
    gradientTo: '#0a1628',
    accent: '#06b6d4',
    accentText: '#22d3ee',
  },
}

export const radiusOptions: { key: BorderRadius; label: string; preview: string }[] = [
  { key: 'none', label: 'None', preview: 'rounded-none' },
  { key: 'sm', label: 'Sm', preview: 'rounded-sm' },
  { key: 'md', label: 'Md', preview: 'rounded-md' },
  { key: 'lg', label: 'Lg', preview: 'rounded-lg' },
  { key: 'xl', label: 'XL', preview: 'rounded-xl' },
  { key: '2xl', label: '2XL', preview: 'rounded-2xl' },
]

export const defaultWidgetOrder = ['clock', 'search', 'pinned', 'quicklinks', 'todos']

export const defaultSpans: Record<string, number> = {
  clock: 2,
  search: 2,
}

interface Settings {
  theme: ThemeKey
  borderRadius: BorderRadius
  widgetOrder: string[]
  hiddenWidgets: string[]
  widgetSpan: Record<string, number>
  cityName: string
}

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem('dashboard-settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      const order = Array.isArray(parsed.widgetOrder) ? [...parsed.widgetOrder] : [...defaultWidgetOrder]
      for (const id of defaultWidgetOrder) {
        if (!order.includes(id)) order.push(id)
      }
      return {
        theme: parsed.theme ?? 'midnight',
        borderRadius: parsed.borderRadius ?? '2xl',
        widgetOrder: order,
        hiddenWidgets: Array.isArray(parsed.hiddenWidgets) ? parsed.hiddenWidgets : [],
        widgetSpan: typeof parsed.widgetSpan === 'object' && parsed.widgetSpan ? parsed.widgetSpan : {},
        cityName: typeof parsed.cityName === 'string' ? parsed.cityName : '',
      }
    }
  } catch {}
  return {
    theme: 'midnight',
    borderRadius: '2xl',
    widgetOrder: [...defaultWidgetOrder],
    hiddenWidgets: [],
    widgetSpan: {},
    cityName: '',
  }
}

interface SettingsContextValue {
  settings: Settings
  updateSettings: (partial: Partial<Settings>) => void
  theme: Theme
  radiusClass: string
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    setStored('dashboard-settings', settings)
  }, [settings])

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }))
  }, [])

  const theme = themes[settings.theme]
  const radiusClass = radiusOptions.find((r) => r.key === settings.borderRadius)!.preview

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, theme, radiusClass }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
