import { useState, useCallback } from 'react'

interface FaviconImgProps {
  domain: string
  size: number
  color?: string
  className?: string
}

const OVERRIDES: Record<string, string> = {
  'mail.google.com': 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
  'calendar.google.com': 'https://ssl.gstatic.com/calendar/favicon.ico',
  'drive.google.com': 'https://ssl.gstatic.com/docs/doclist/images/drive.ico',
  'docs.google.com': 'https://ssl.gstatic.com/docs/documents/images/kix-favicon-2023q4.ico',
  'sheets.google.com': 'https://ssl.gstatic.com/docs/spreadsheets/images/favicon-2023q4.ico',
  'slides.google.com': 'https://ssl.gstatic.com/docs/presentations/images/favicon-2023q4.ico',
  'meet.google.com': 'https://ssl.gstatic.com/meet/favicon.ico',
  'chat.google.com': 'https://ssl.gstatic.com/chat/favicon.ico',
  'photos.google.com': 'https://ssl.gstatic.com/photos/favicon.ico',
  'keep.google.com': 'https://ssl.gstatic.com/keep/favicon.ico',
}

function getSources(domain: string): string[] {
  const d = domain.replace(/^www\./, '')
  const srcs: string[] = []
  if (OVERRIDES[d]) srcs.push(OVERRIDES[d])
  srcs.push(`https://www.google.com/s2/favicons?domain=${d}&sz=64`)
  srcs.push(`https://${d}/favicon.ico`)
  srcs.push(`https://icons.duckduckgo.com/ip3/${d}.ico`)
  return srcs
}

export default function FaviconImg({ domain, size, color, className = '' }: FaviconImgProps) {
  const [srcIndex, setSrcIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  const sources = getSources(domain)

  const advance = useCallback(() => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(srcIndex + 1)
    } else {
      setFailed(true)
    }
  }, [srcIndex, sources.length])

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
      advance()
    }
  }, [advance])

  if (failed) {
    const initial = (domain[0] || 'B').toUpperCase()
    const bgColor = color || '#3b82f6'
    return (
      <div
        className={`flex items-center justify-center flex-shrink-0 font-semibold ${className}`}
        style={{ width: size, height: size, borderRadius: size * 0.25, background: `linear-gradient(135deg, ${bgColor}, ${bgColor.replace('500', '600')})` }}
      >
        <span className="text-white select-none" style={{ fontSize: size * 0.4 }}>{initial}</span>
      </div>
    )
  }

  return (
    <img
      key={srcIndex}
      src={sources[srcIndex]}
      alt=""
      width={size}
      height={size}
      className={`flex-shrink-0 ${className}`}
      style={{ borderRadius: size * 0.25, minWidth: size }}
      onError={advance}
      onLoad={handleLoad}
      loading="lazy"
    />
  )
}
