import { useState, useEffect } from 'react'
import { useBookmarks } from '../hooks/useBookmarks'
import { getDomain, getColor, getAllBookmarks } from '../utils/bookmarkHelpers'

export default function PinnedBookmarks() {
  const bookmarks = useBookmarks()
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('pinnedBookmarks')
    if (stored) {
      try {
        setPinnedIds(new Set(JSON.parse(stored)))
      } catch {}
    }
  }, [])

  const allBookmarks = getAllBookmarks(bookmarks)
  const pinned = allBookmarks.filter((b) => pinnedIds.has(b.id))

  if (pinned.length === 0) {
    return <span className="text-xs text-gray-600">No pinned bookmarks yet. Pin them from the Bookmarks tab.</span>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {pinned.map((bookmark) => {
        const domain = getDomain(bookmark.url ?? '')
        const color = getColor(bookmark.title)
        const initial = bookmark.title ? bookmark.title[0].toUpperCase() : 'B'

        return (
          <a
            key={bookmark.id}
            href={bookmark.url}
            className="group flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.1] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div
              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-sm font-semibold flex-shrink-0`}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                {bookmark.title || domain || 'Bookmark'}
              </div>
              {domain && (
                <div className="text-xs text-gray-500 truncate">{domain}</div>
              )}
            </div>
          </a>
        )
      })}
    </div>
  )
}
