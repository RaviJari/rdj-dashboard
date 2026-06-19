import { useEffect, useState } from 'react'
import type { BookmarkTreeNode } from '../types'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkTreeNode[]>([])

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      try {
        chrome.bookmarks.getTree((tree: BookmarkTreeNode[]) => {
          if (Array.isArray(tree)) {
            setBookmarks(tree)
          }
        })
      } catch {}
    }
  }, [])

  return bookmarks
}
