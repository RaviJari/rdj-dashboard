import { useState, useEffect } from 'react'
import { setStored } from '../lib/storage'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

function SortableTodo({
  todo,
  toggleTodo,
  deleteTodo,
}: {
  todo: Todo
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.03] group transition-colors ${isDragging ? 'z-10' : ''}`}
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 transition-colors rounded-lg p-0.5 hover:bg-white/[0.06]"
        aria-label="Drag to reorder"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      </button>
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`cursor-pointer w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
          todo.done
            ? 'bg-blue-500 border-blue-500'
            : 'border-white/[0.15] hover:border-blue-500/50'
        }`}
        aria-label={todo.done ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span
        className={`flex-1 text-sm transition-all ${
          todo.done ? 'text-gray-600 line-through' : 'text-gray-300'
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="cursor-pointer text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded p-0.5 hover:bg-white/[0.06]"
        aria-label="Delete todo"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  useEffect(() => {
    const stored = localStorage.getItem('todos')
    if (stored) {
      try {
        setTodos(JSON.parse(stored))
      } catch {}
    }
  }, [])

  useEffect(() => {
    setStored('todos', todos)
  }, [todos])

  function addTodo() {
    if (!input.trim()) return
    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: input.trim(),
        done: false,
        createdAt: Date.now(),
      },
    ])
    setInput('')
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = todos.findIndex((t) => t.id === active.id)
    const newIndex = todos.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    setTodos((prev) => arrayMove(prev, oldIndex, newIndex))
  }

  const incompleteCount = todos.filter((t) => !t.done).length

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Todos
        </h2>
        <span className="text-xs text-gray-500">{incompleteCount} remaining</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          addTodo()
        }}
        className="flex gap-2 mb-5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
          className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
        <button
          type="submit"
          className="cursor-pointer px-4 py-2 bg-blue-500/10 text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          Add
        </button>
      </form>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {todos.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-8">No todos yet</p>
            )}
            {todos.map((todo) => (
              <SortableTodo key={todo.id} todo={todo} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {todos.some((t) => t.done) && (
        <button
          onClick={() => setTodos((prev) => prev.filter((t) => !t.done))}
          className="cursor-pointer mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Clear completed
        </button>
      )}
    </div>
  )
}
