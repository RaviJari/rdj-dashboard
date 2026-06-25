import { useSettings } from '../context/SettingsContext'
import PinnedBookmarks from '../components/PinnedBookmarks'
import QuickLinks from '../components/QuickLinks'
import DashboardTodos from '../components/DashboardTodos'
import ProfileSwitcher from '../components/ProfileSwitcher'

export default function Popup() {
  const { theme } = useSettings()

  return (
    <div
      className="min-h-screen p-3"
      style={{
        background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
        width: 620,
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 select-none">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
            RDJ Dashboard
          </h1>
          <ProfileSwitcher />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <section>
            <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">★ Pinned</h2>
            <PinnedBookmarks />
          </section>

          <section>
            <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Links</h2>
            <QuickLinks />
          </section>
        </div>

        <section>
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Todos</h2>
          <DashboardTodos />
        </section>
      </div>
    </div>
  )
}
