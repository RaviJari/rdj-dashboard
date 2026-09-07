import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Fuse from 'fuse.js'
import { useBookmarks } from '../hooks/useBookmarks'
import { flattenBookmarks, getDomain } from '../utils/bookmarkHelpers'
import FaviconImg from './FaviconImg'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const bookmarks = useBookmarks()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const flatList = useMemo(() => flattenBookmarks(bookmarks), [bookmarks])

  const fuse = useMemo(
    () =>
      new Fuse(flatList, {
        keys: ['title', 'url'],
        threshold: 0.3,
      }),
    [flatList],
  )

  const results = useMemo(
    () => (query.length > 0 ? fuse.search(query).map((r) => r.item).slice(0, 20) : []),
    [query, fuse],
  )

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelectedIndex(-1)
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [query, results])

  const handleSelect = useCallback(
    (url: string | undefined, newTab = false) => {
      if (!url) return
      onClose()
      if (newTab) {
        window.open(url, '_blank')
      } else {
        window.location.href = url
      }
    },
    [onClose],
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(results[selectedIndex]?.url, e.metaKey || e.ctrlKey)
    }
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px] animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl animate-spring-up">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search bookmarks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-6 py-4 bg-[#14141d]/95 border border-white/[0.14] rounded-full text-lg text-white placeholder-gray-500 shadow-2xl backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/25 transition-all"
        />
        {results.length > 0 && (
          <div className="mt-2 max-h-80 overflow-y-auto bg-[#14141d]/95 border border-white/[0.1] rounded-2xl shadow-2xl backdrop-blur-xl">
            {results.map((item, i) => (
              <button
                key={item.id}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={(e) => handleSelect(item.url, e.metaKey || e.ctrlKey)}
                className={`cursor-pointer w-full text-left px-4 py-2.5 last:border-0 transition-colors border-b border-white/[0.05] ${
                  i === selectedIndex ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FaviconImg domain={getDomain(item.url ?? '')} size={18} className="rounded shrink-0" />
                  <span className="text-sm font-medium text-gray-100 truncate">{item.title}</span>
                  {i === selectedIndex && <span className="ml-auto text-[10px] text-white/40 shrink-0">↵</span>}
                </div>
                {item.url && (
                  <div className="text-xs text-gray-500 truncate mt-0.5 pl-7">{item.url}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}