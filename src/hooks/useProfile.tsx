import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Profile = 'personal' | 'work'

const STORAGE_KEY = 'dashboard-profile'

function migrateOldData() {
  if (localStorage.getItem('_profile_migrated_v1')) return

  for (const base of ['quicklinks', 'pinnedBookmarks']) {
    const old = localStorage.getItem(base)
    if (old) {
      localStorage.setItem(`${base}_work`, old)
      localStorage.removeItem(base)
    }
  }

  localStorage.setItem('_profile_migrated_v1', '1')
}

function loadProfile(): Profile {
  migrateOldData()
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'personal' || stored === 'work' ? stored : 'work'
}

interface ProfileContextValue {
  profile: Profile
  setProfile: (p: Profile) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(loadProfile)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, profile)
  }, [profile])

  function setProfile(p: Profile) {
    setProfileState(p)
    localStorage.setItem(STORAGE_KEY, p)
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}

export function profileKey(base: string, profile: Profile): string {
  return `${base}_${profile}`
}
