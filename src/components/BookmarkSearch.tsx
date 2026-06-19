import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Fuse from 'fuse.js'
import { useBookmarks } from '../hooks/useBookmarks'
import { flattenBookmarks, getDomain } from '../utils/bookmarkHelpers'
import FaviconImg from './FaviconImg'

interface DropdownPos {
  top: number
  left: number
  width: number
}

export default function BookmarkSearch() {
  const bookmarks = useBookmarks()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const closeDropdown = useCallback(() => {
    setOpen(false)
    setQuery('')
    setDropdownPos(null)
    inputRef.current?.blur()
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      })
    } else {
      setDropdownPos(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setQuery('')
        setDropdownPos(null)
        inputRef.current?.blur()
      }
    }
    function reposition() {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
      }
    }
    document.addEventListener('mousedown', handleClick, true)
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      document.removeEventListener('mousedown', handleClick, true)
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  const handleSelect = useCallback((url: string | undefined, newTab = false) => {
    if (!url) return
    closeDropdown()
    if (newTab) {
      window.open(url, '_blank')
    } else {
      window.location.href = url
    }
  }, [closeDropdown])

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
      closeDropdown()
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
      {open && dropdownPos && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-[#15151e] border border-white/[0.08] rounded-xl shadow-2xl max-h-80 overflow-y-auto z-[9999]"
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
        >
          {results.map((item, i) => (
            <button
              key={item.id}
               onClick={(e) => handleSelect(item.url, e.metaKey || e.ctrlKey)}
              className={`cursor-pointer w-full text-left px-4 py-2.5 transition-colors border-b border-white/[0.05] last:border-0 ${
                i === selectedIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FaviconImg domain={getDomain(item.url ?? '')} size={16} className="rounded" />
                <span className="text-sm font-medium text-gray-200">{item.title}</span>
              </div>
              {item.url && (
                <div className="text-xs text-gray-500 truncate mt-0.5">{item.url}</div>
              )}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
