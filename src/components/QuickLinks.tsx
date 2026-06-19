import { useState, useEffect, useRef } from 'react'
import FaviconImg from './FaviconImg'

function getDomain(url: string): string {
  try { return new URL(url).hostname } catch { return '' }
}

interface QuickLink {
  label: string
  url: string
}

const defaults: QuickLink[] = [
  { label: 'Google', url: 'https://google.com' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com' },
  { label: 'MDN', url: 'https://developer.mozilla.org' },
]

export default function QuickLinks() {
  const [links, setLinks] = useState<QuickLink[]>(defaults)
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editLabel, setEditLabel] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('quicklinks')
    if (stored) {
      try {
        setLinks(JSON.parse(stored))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('quicklinks', JSON.stringify(links))
  }, [links])

  useEffect(() => {
    if ((adding || editing) && inputRef.current) {
      inputRef.current.focus()
    }
  }, [adding, editing])

  function addLink() {
    const label = editLabel.trim()
    let url = editUrl.trim()
    if (!label || !url) return
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    setLinks((prev) => [...prev, { label, url }])
    setEditLabel('')
    setEditUrl('')
    setAdding(false)
  }

  function deleteLink(url: string) {
    setLinks((prev) => prev.filter((l) => l.url !== url))
  }

  function startEdit(link: QuickLink) {
    setEditing(link.url)
    setEditLabel(link.label)
    setEditUrl(link.url)
  }

  function saveEdit() {
    const label = editLabel.trim()
    let url = editUrl.trim()
    if (!label || !url) return
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    setLinks((prev) =>
      prev.map((l) => (l.url === editing ? { label, url } : l)),
    )
    setEditing(null)
    setEditLabel('')
    setEditUrl('')
  }

  function cancelEdit() {
    setEditing(null)
    setAdding(false)
    setEditLabel('')
    setEditUrl('')
  }

  function keyDown(e: React.KeyboardEvent, action: () => void) {
    if (e.key === 'Enter') action()
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {links.map((link) => (
          <div key={link.url} className="group relative">
            {editing === link.url ? (
              <div className="flex flex-col gap-1.5 p-2 bg-white/[0.06] rounded-xl border border-white/[0.1]">
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => keyDown(e, saveEdit)}
                  placeholder="Label"
                  className="w-full px-2 py-1 text-xs bg-white/[0.05] border border-white/[0.08] rounded text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                />
                <input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  onKeyDown={(e) => keyDown(e, saveEdit)}
                  placeholder="https://..."
                  className="w-full px-2 py-1 text-xs bg-white/[0.05] border border-white/[0.08] rounded text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                />
                <div className="flex gap-1.5">
                  <button onClick={saveEdit} className="cursor-pointer text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">Save</button>
                  <button onClick={cancelEdit} className="cursor-pointer text-[11px] px-2 py-0.5 rounded text-gray-500 hover:text-gray-300 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <a
                  href={link.url}
                  className="flex-1 flex items-center gap-2 px-3 py-2 bg-white/[0.04] rounded-xl text-sm text-gray-300 hover:bg-white/[0.08] hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] truncate"
                >
                  <FaviconImg domain={getDomain(link.url)} size={16} className="rounded" />
                  <span className="truncate">{link.label}</span>
                </a>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.preventDefault(); startEdit(link) }}
                    className="cursor-pointer p-1 text-gray-500 hover:text-gray-200 transition-colors rounded hover:bg-white/[0.08]"
                    title="Edit"
                    aria-label="Edit quick link"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteLink(link.url)}
                    className="cursor-pointer p-1 text-gray-500 hover:text-red-400 transition-colors rounded hover:bg-white/[0.08]"
                    title="Delete"
                    aria-label="Delete quick link"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex flex-col gap-1.5 p-2 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          <input
            ref={inputRef}
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={(e) => keyDown(e, addLink)}
            placeholder="Label"
            className="w-full px-2 py-1.5 text-xs bg-white/[0.05] border border-white/[0.08] rounded text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
          />
          <input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            onKeyDown={(e) => keyDown(e, addLink)}
            placeholder="https://..."
            className="w-full px-2 py-1.5 text-xs bg-white/[0.05] border border-white/[0.08] rounded text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
          />
          <div className="flex gap-1.5">
            <button onClick={addLink} className="cursor-pointer text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">Add</button>
            <button onClick={cancelEdit} className="cursor-pointer text-[11px] px-2 py-0.5 rounded text-gray-500 hover:text-gray-300 transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setAdding(true); setEditLabel(''); setEditUrl('') }}
          className="cursor-pointer w-full py-1.5 text-xs text-gray-500 hover:text-gray-300 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-all"
        >
          + Add Link
        </button>
      )}
    </div>
  )
}
