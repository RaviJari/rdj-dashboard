import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { useBookmarks } from '../hooks/useBookmarks'
import { flattenBookmarks } from '../utils/bookmarkHelpers'

export default function BookmarkSearch() {
  const bookmarks = useBookmarks()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
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
    setOpen(query.length > 0 && results.length > 0)
    setSelectedIndex(-1)
  }, [query, results])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSelect = useCallback((url: string | undefined, newTab = false) => {
    if (!url) return
    if (newTab) {
      window.open(url, '_blank')
    } else {
      window.location.href = url
    }
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(results[selectedIndex]?.url, false)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search bookmarks... (⌘K)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all text-base"
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#15151e] border border-white/[0.08] rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50 backdrop-blur-xl">
          {results.map((item, i) => (
            <button
              key={item.id}
               onClick={(e) => handleSelect(item.url, e.metaKey || e.ctrlKey)}
              className={`w-full text-left px-4 py-2.5 transition-colors border-b border-white/[0.05] last:border-0 ${
                i === selectedIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
              }`}
            >
              <div className="text-sm font-medium text-gray-200">{item.title}</div>
              {item.url && (
                <div className="text-xs text-gray-500 truncate mt-0.5">{item.url}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
