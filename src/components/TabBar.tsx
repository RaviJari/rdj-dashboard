export type Tab = 'dashboard' | 'bookmarks' | 'todos'

interface TabBarProps {
  activeTab: Tab
  onChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'todos', label: 'Todos' },
]

export default function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-1 p-1 bg-black/30 rounded-2xl border border-white/[0.10] backdrop-blur-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white/[0.10] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
