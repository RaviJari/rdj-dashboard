import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './pages/Popup'
import { SettingsProvider } from './context/SettingsContext'
import { ProfileProvider } from './hooks/useProfile'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <ProfileProvider>
        <Popup />
      </ProfileProvider>
    </SettingsProvider>
  </StrictMode>,
)
