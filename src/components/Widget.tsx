import { type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSettings, defaultSpans } from '../context/SettingsContext'

interface WidgetProps {
  id: string
  title?: string
  children: ReactNode
  className?: string
}

export default function Widget({ id, title, children, className = '' }: WidgetProps) {
  const { radiusClass, settings, updateSettings } = useSettings()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const span = settings.widgetSpan?.[id] ?? defaultSpans[id] ?? 1
  const spanClass = span === 2 ? 'md:col-span-2' : ''

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  }

  function toggleSpan() {
    const next = span >= 2 ? 1 : span + 1
    updateSettings({
      widgetSpan: { ...settings.widgetSpan, [id]: next },
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white/[0.03] backdrop-blur-xl border transition-all ${radiusClass} ${spanClass} ${className} ${
        isDragging ? 'border-white/[0.12] shadow-xl z-10' : 'border-white/[0.06]'
      }`}
    >
      <div className="flex items-center justify-between p-4 pb-0">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title || ''}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSpan}
            className="text-gray-600 hover:text-gray-300 transition-colors text-xs leading-none px-1 py-0.5 rounded hover:bg-white/[0.06]"
            title={span >= 2 ? 'Collapse' : 'Expand'}
          >
            {span >= 2 ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </button>
          <button
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing select-none text-gray-600 hover:text-gray-300 transition-colors text-sm leading-none"
          >
            ⠿
          </button>
        </div>
      </div>
      <div className="p-4 pt-3">{children}</div>
    </div>
  )
}
