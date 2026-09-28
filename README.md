# RDJ Dashboard

A Momentum-style new-tab dashboard for Chrome that doubles as your mini command center — with a floating ⌘K search, per-profile quick links and bookmark pins, todos, weather, and Google-account sync.

![version](https://img.shields.io/badge/version-1.0.0-blue)

🌐 Landing page + privacy policy: **https://ravijari.github.io/rdj-dashboard/**

## Features

- **Momentum-style home** — full-screen rotated Unsplash photos with daily rotation, giant clock, greeting, date, and "Today's Focus" input.
- **Floating search (⌘K)** — Spotlight-style overlay that fuzzy-searches bookmarks (favicons, arrow-key navigation, ↵ opens, ⌘↵ background tab). Triggered from the magnifier icon in the clock hero or the ⌘K shortcut.
- **Dual profiles (Personal / Work)** — independent quick links, pinned bookmarks, and focus per profile.
- **Dashboard widgets** — draggable, resizable, hideable tiles: clock+weather, pinned bookmarks, quick links, notes, todos, and a full bookmarks tree.
- **Weather** — Open-Meteo with geo-location fallback and smart caching (choose a city or auto-detect).
- **Extension popup** — one-click toolbar popup with pinned links, quick links, and todos; links open in a new tab.
- **Google-account sync** — settings, profiles, quick links, pins, focus, todos, and notes sync across devices via `chrome.storage.sync`.
- **Customizable themes** — midnight, slate, emerald, amber, ruby, and ocean.

## Installation (unpacked)

```bash
npm install
npm run build
```

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

> **Cross-device sync setup:** the extension's stable identity is pinned by a private key at `.extension/key.pem` (gitignored). To sync data across laptops, copy that file into the repo on each machine before loading — it makes the extension ID identical everywhere so all installs share one `chrome.storage.sync` namespace.

## Sync

Data syncs through the user's Google account via `chrome.storage.sync` when:

- The same Google account is signed in on Chrome
- Chrome **Settings → Sync → Extensions** is toggled on

Local storage (`localStorage`) is the session source of truth; writes are debounce-mirrored to sync, and the cloud copy is pulled into local storage before first render. Large/transient data (weather caches, photos) stays local. If the 100 KB sync quota is exceeded, only the essential config keys are synced and everything else degrades gracefully.

## Development

```bash
npm run dev        # vite dev server (no chrome APIs — sync automatically disabled)
npm run build      # typecheck + production build into dist/
```

- `src/lib/storage.ts` — local-first sync layer (`chrome.storage.sync` + fallbacks)
- `src/pages/Popup.tsx` — toolbar popup entry
- `src/components/SearchOverlay.tsx` — floating ⌘K search
- `src/components/Background.tsx` — photo background layer
- `src/hooks/useProfile.tsx` — profile context (Personal/Work)

## Privacy

No analytics, no tracking. Weather uses keyless public APIs. All personal data lives in your Chrome profile and is synced only through your own Google account.

## License

[MIT](./LICENSE)