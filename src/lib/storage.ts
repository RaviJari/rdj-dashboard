const SYNC_KEYS = [
  'dashboard-settings',
  'dashboard-profile',
  'quicklinks_personal',
  'quicklinks_work',
  'pinnedBookmarks_personal',
  'pinnedBookmarks_work',
  'dashboard-focus_personal',
  'dashboard-focus_work',
  'todos',
  'notes',
]

const ESSENTIAL_KEYS = [
  'dashboard-settings',
  'dashboard-profile',
  'quicklinks_personal',
  'quicklinks_work',
  'pinnedBookmarks_personal',
  'pinnedBookmarks_work',
  'dashboard-focus_personal',
  'dashboard-focus_work',
]

export function hasChromeSync(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.sync
}

export function isSyncKey(key: string): boolean {
  return SYNC_KEYS.includes(key)
}

export function getStored(key: string): string | null {
  return localStorage.getItem(key)
}

export function setStored(key: string, value: unknown): void {
  const raw = typeof value === 'string' ? value : JSON.stringify(value)
  localStorage.setItem(key, raw)
  schedulePush(key)
}

let pushTimer: ReturnType<typeof setTimeout> | undefined
let pendingKeys = new Set<string>()

function schedulePush(key: string) {
  if (!hasChromeSync()) return
  pendingKeys.add(key)
  if (pushTimer) return
  pushTimer = setTimeout(flushPush, 500)
}

async function flushPush() {
  pushTimer = undefined
  if (!hasChromeSync()) {
    pendingKeys.clear()
    return
  }

  const keys = new Set(pendingKeys)
  pendingKeys.clear()

  const data: Record<string, string> = {}
  for (const key of keys) {
    const raw = localStorage.getItem(key)
    if (raw !== null) data[key] = raw
  }
  if (Object.keys(data).length === 0) return

  try {
    await chrome.storage.sync.set(data)
  } catch {
    const reduced: Record<string, string> = {}
    for (const key of Object.keys(data)) {
      if (ESSENTIAL_KEYS.includes(key)) reduced[key] = data[key]
    }
    try {
      await chrome.storage.sync.set(reduced)
    } catch {
      // Storage unavailable (sync disabled/quota) — local copy remains source of truth.
    }
  }
}

async function pullFromSync(): Promise<void> {
  if (!hasChromeSync()) return
  try {
    const all = await chrome.storage.sync.get(null)
    for (const [key, val] of Object.entries(all)) {
      if (isSyncKey(key) && typeof val === 'string') {
        localStorage.setItem(key, val)
      }
    }
  } catch {
    // Ignore read failures; keep the local copy.
  }
}

function watchRemote() {
  if (!hasChromeSync()) return
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (isSyncKey(key) && typeof newValue === 'string') {
        localStorage.setItem(key, newValue)
      }
    }
  })
}

export function initSync(): Promise<void> {
  if (!hasChromeSync()) return Promise.resolve()
  watchRemote()
  return pullFromSync()
}