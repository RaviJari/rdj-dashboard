import { useState, useEffect, useMemo, useCallback, Component, type ReactNode } from 'react'
import { useBookmarks } from '../hooks/useBookmarks'
import { getDomain, getColor } from '../utils/bookmarkHelpers'
import type { BookmarkTreeNode } from '../types'
import FaviconImg from './FaviconImg'

function safeAllBookmarks(nodes: BookmarkTreeNode[]): BookmarkTreeNode[] {
  try {
    const items: BookmarkTreeNode[] = []
    function walk(list: BookmarkTreeNode[]) {
      if (!Array.isArray(list)) return
      for (const n of list) {
        if (!n || typeof n !== 'object') continue
        if (n.url) items.push(n)
        if (Array.isArray(n.children)) walk(n.children)
      }
    }
    walk(nodes)
    return items
  } catch {
    return []
  }
}

class TreeErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 text-center">
          <div className="text-gray-500 text-sm">Failed to load bookmarks</div>
          <div className="text-gray-600 text-xs mt-2 opacity-60">
            {this.state.message}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function countBookmarks(node: BookmarkTreeNode): number {
  try {
    let count = 0
    function walk(n: BookmarkTreeNode) {
      if (!n || typeof n !== 'object') return
      if (n.url) count++
      if (Array.isArray(n.children)) n.children.forEach(walk)
    }
    walk(node)
    return count
  } catch {
    return 0
  }
}

function TreeNode({
  node,
  depth,
  pinnedIds,
  onTogglePin,
}: {
  node: BookmarkTreeNode
  depth: number
  pinnedIds: Set<string>
  onTogglePin: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(depth === 0)
  const children = node.children ?? []
  const hasChildren = children.length > 0
  const isFolder = !node.url

  if (node.title === '' && isFolder && hasChildren) {
    return (
      <div className="space-y-0.5">
        {children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth}
            pinnedIds={pinnedIds}
            onTogglePin={onTogglePin}
          />
        ))}
      </div>
    )
  }

  if (isFolder) {
    const bookmarkCount = countBookmarks(node)
    return (
      <div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="cursor-pointer flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all text-sm font-medium text-gray-300"
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          <svg
            className={`w-3 h-3 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
              expanded ? 'rotate-90' : ''
            }`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>{node.title || 'Bookmarks'}</span>
          {bookmarkCount > 0 && (
            <span className="text-[11px] text-gray-600 ml-auto">{bookmarkCount}</span>
          )}
        </button>
        {expanded && hasChildren && (
          <div>
            {children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                pinnedIds={pinnedIds}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const domain = getDomain(node.url ?? '')
  const color = getColor(node.title ?? '')
  const isPinned = pinnedIds.has(node.id)

  return (
    <div
      className="group flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.03] transition-all"
      style={{ paddingLeft: `${depth * 16 + 12}px` }}
    >
      <FaviconImg domain={domain} size={20} color={color} className="rounded-md" />
      <a
        href={node.url}
        className="flex-1 min-w-0 text-sm text-gray-400 hover:text-gray-200 transition-colors truncate"
      >
        {node.title || domain}
      </a>
      {domain && (
        <span className="text-[11px] text-gray-600 hidden md:block truncate max-w-[120px]">
          {domain}
        </span>
      )}
      <button
        onClick={() => onTogglePin(node.id)}
        className={`cursor-pointer flex-shrink-0 transition-all p-0.5 rounded hover:bg-white/[0.06] ${
          isPinned
            ? 'text-yellow-500 opacity-100'
            : 'text-gray-600 opacity-0 group-hover:opacity-100'
        }`}
        aria-label={isPinned ? 'Unpin bookmark' : 'Pin bookmark'}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    </div>
  )
}

function BookmarkCard({
  bookmark,
  pinned,
  onTogglePin,
}: {
  bookmark: BookmarkTreeNode
  pinned: boolean
  onTogglePin: () => void
}) {
  const domain = getDomain(bookmark.url ?? '')
  const color = getColor(bookmark.title ?? '')

  return (
    <div className="group flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.1] hover:scale-[1.02] active:scale-[0.98] transition-all">
      <a href={bookmark.url} className="flex items-center gap-3 flex-1 min-w-0">
        <FaviconImg domain={domain} size={36} color={color} className="rounded-lg" />
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
            {bookmark.title || domain || 'Bookmark'}
          </div>
          {domain && <div className="text-xs text-gray-500 truncate">{domain}</div>}
        </div>
      </a>
      <button
        onClick={onTogglePin}
        className={`flex-shrink-0 p-1 rounded-md transition-all ${
          pinned
            ? 'text-yellow-500 hover:text-yellow-400'
            : 'text-gray-600 opacity-0 group-hover:opacity-100 hover:text-gray-400'
        }`}
      >
        ★
      </button>
    </div>
  )
}

function TreeContent() {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())
  const bookmarks = useBookmarks()
  const allItems = useMemo(() => safeAllBookmarks(bookmarks), [bookmarks])
  const pinnedItems = allItems.filter((b) => pinnedIds.has(b.id))

  useEffect(() => {
    const stored = localStorage.getItem('pinnedBookmarks')
    if (stored) {
      try {
        setPinnedIds(new Set(JSON.parse(stored)))
      } catch {}
    }
  }, [])

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      localStorage.setItem('pinnedBookmarks', JSON.stringify([...next]))
      return next
    })
  }, [])

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 text-center text-gray-500 text-sm">
        No bookmarks loaded
      </div>
    )
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
      <div className="max-h-[65vh] overflow-y-auto pr-1">
        {pinnedItems.length > 0 && (
          <div className="mb-4 pb-4 border-b border-white/[0.06]">
            <h3 className="text-xs font-semibold text-yellow-500/70 uppercase tracking-wider mb-3">
              ★ Pinned
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pinnedItems.map((b) => (
                <BookmarkCard
                  key={b.id}
                  bookmark={b}
                  pinned
                  onTogglePin={() => togglePin(b.id)}
                />
              ))}
            </div>
          </div>
        )}
        <div className="space-y-0.5">
          {bookmarks.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              pinnedIds={pinnedIds}
              onTogglePin={togglePin}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BookmarkTree() {
  return (
    <TreeErrorBoundary>
      <TreeContent />
    </TreeErrorBoundary>
  )
}
