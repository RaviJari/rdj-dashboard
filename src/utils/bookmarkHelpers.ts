import type { BookmarkTreeNode } from '../types'

const colors = [
  'from-blue-500/20 to-blue-600/20 text-blue-400',
  'from-purple-500/20 to-purple-600/20 text-purple-400',
  'from-green-500/20 to-green-600/20 text-green-400',
  'from-orange-500/20 to-orange-600/20 text-orange-400',
  'from-pink-500/20 to-pink-600/20 text-pink-400',
  'from-cyan-500/20 to-cyan-600/20 text-cyan-400',
  'from-yellow-500/20 to-yellow-600/20 text-yellow-400',
  'from-red-500/20 to-red-600/20 text-red-400',
  'from-teal-500/20 to-teal-600/20 text-teal-400',
  'from-indigo-500/20 to-indigo-600/20 text-indigo-400',
]

export function flattenBookmarks(nodes: BookmarkTreeNode[]): BookmarkTreeNode[] {
  const result: BookmarkTreeNode[] = []
  function walk(list: BookmarkTreeNode[]) {
    for (const node of list) {
      if (node.url) result.push(node)
      if (node.children) walk(node.children)
    }
  }
  walk(nodes)
  return result
}

export function getFolders(nodes: BookmarkTreeNode[]): BookmarkTreeNode[] {
  return nodes.filter((n) => !n.url && n.children)
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function getColor(title: string): string {
  if (!title) return colors[0]
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function getAllBookmarks(nodes: BookmarkTreeNode[]): BookmarkTreeNode[] {
  const items: BookmarkTreeNode[] = []
  function walk(list: BookmarkTreeNode[]) {
    for (const n of list) {
      if (n.url) items.push(n)
      if (n.children) walk(n.children)
    }
  }
  walk(nodes)
  return items
}
