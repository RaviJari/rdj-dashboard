import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SettingsProvider } from './context/SettingsContext'
import { ProfileProvider } from './hooks/useProfile'
import { initSync } from './lib/storage'
import './index.css'

initSync().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <SettingsProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </SettingsProvider>
    </StrictMode>,
  )
})
