import { useProfile, type Profile } from '../hooks/useProfile'

const profiles: { key: Profile; label: string }[] = [
  { key: 'personal', label: 'Personal' },
  { key: 'work', label: 'Work' },
]

export default function ProfileSwitcher({ compact }: { compact?: boolean }) {
  const { profile, setProfile } = useProfile()

  return (
    <div className="flex gap-0.5 bg-white/[0.06] rounded-lg p-0.5">
      {profiles.map((p) => (
        <button
          key={p.key}
          onClick={() => setProfile(p.key)}
          className={`cursor-pointer px-2.5 py-1 transition-all rounded-md ${
            compact ? 'text-[10px]' : 'text-[11px]'
          } font-medium ${
            profile === p.key
              ? 'bg-white/[0.12] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
