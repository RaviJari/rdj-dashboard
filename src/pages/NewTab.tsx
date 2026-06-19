import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useSettings } from '../context/SettingsContext'
import TabBar from '../components/TabBar'
import type { Tab } from '../components/TabBar'
import BookmarkSearch from '../components/BookmarkSearch'
import BookmarkTree from '../components/BookmarkTree'
import PinnedBookmarks from '../components/PinnedBookmarks'
import QuickLinks from '../components/QuickLinks'
import DashboardTodos from '../components/DashboardTodos'
import ClockWeather from '../components/ClockWeather'
import TodoList from '../components/TodoList'
import Widget from '../components/Widget'
import SettingsPanel from '../components/SettingsPanel'

type WidgetId = 'clock' | 'search' | 'pinned' | 'quicklinks' | 'todos'

const widgetMeta: Record<WidgetId, { title: string; component: () => JSX.Element | null }> = {
  clock: { title: '', component: () => <ClockWeather /> },
  search: { title: '', component: () => <BookmarkSearch /> },
  pinned: { title: '★ Pinned', component: () => <PinnedBookmarks /> },
  quicklinks: { title: 'Quick Links', component: () => <QuickLinks /> },
  todos: { title: 'Todos', component: () => <DashboardTodos /> },
}

function WidgetOverlay({ id }: { id: string }) {
  const meta = widgetMeta[id as WidgetId]
  if (!meta) return null
  return (
    <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4 shadow-2xl rotate-2 scale-105">
      {meta.title && (
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {meta.title}
        </h2>
      )}
      <div className="text-xs text-gray-600 italic">Reorder...</div>
    </div>
  )
}

function Dashboard() {
  const { settings, updateSettings } = useSettings()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {}),
  )

  const visibleIds = useMemo(() => {
    return settings.widgetOrder.filter(
      (id): id is WidgetId => !settings.hiddenWidgets.includes(id) && id in widgetMeta,
    )
  }, [settings.widgetOrder, settings.hiddenWidgets])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = settings.widgetOrder.indexOf(active.id as string)
    const newIndex = settings.widgetOrder.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    updateSettings({ widgetOrder: arrayMove(settings.widgetOrder, oldIndex, newIndex) })
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  return (
    <div className="mt-10">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={visibleIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleIds.map((id) => {
              const meta = widgetMeta[id]
              const content = <meta.component />
              return (
                <Widget key={id} id={id} title={meta.title}>
                  {content}
                </Widget>
              )
            })}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? <WidgetOverlay id={activeId} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default function NewTab() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const { theme } = useSettings()

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
      }}
    >
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <TabBar activeTab={activeTab} onChange={setActiveTab} />
        <SettingsPanel />

        {activeTab === 'dashboard' && <Dashboard />}

        {activeTab === 'bookmarks' && (
          <div className="mt-8 space-y-4">
            <BookmarkSearch />
            <BookmarkTree />
          </div>
        )}

        {activeTab === 'todos' && (
          <div className="mt-8">
            <TodoList />
          </div>
        )}
      </div>
    </div>
  )
}
