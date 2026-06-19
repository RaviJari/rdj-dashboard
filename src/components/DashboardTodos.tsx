import { useState, useEffect, useRef } from 'react'

interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export default function DashboardTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('todos')
    if (stored) {
      try {
        setTodos(JSON.parse(stored))
      } catch {}
    }
  }, [])

  function syncTodos(updated: Todo[]) {
    setTodos(updated)
    localStorage.setItem('todos', JSON.stringify(updated))
  }

  function addTodo() {
    if (!input.trim()) return
    const updated = [
      ...todos,
      {
        id: crypto.randomUUID(),
        text: input.trim(),
        done: false,
        createdAt: Date.now(),
      },
    ]
    syncTodos(updated)
    setInput('')
  }

  function toggleTodo(id: string) {
    syncTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function deleteTodo(id: string) {
    syncTodos(todos.filter((t) => t.id !== id))
  }

  const visible = todos.filter((t) => !t.done).slice(0, 3)
  const doneCount = todos.filter((t) => t.done).length

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => { e.preventDefault(); addTodo() }}
        className="flex gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
          className="flex-1 px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
        <button
          type="submit"
          className="cursor-pointer px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="space-y-1">
        {visible.length === 0 && todos.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">No todos yet</p>
        )}
        {visible.length === 0 && todos.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 py-4">
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>
            <p className="text-xs text-gray-600">All done!</p>
          </div>
        )}
        {visible.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] group transition-colors"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`cursor-pointer w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                todo.done
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-white/[0.15] hover:border-blue-500/50'
              }`}
              aria-label={todo.done ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {todo.done && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span
              className={`flex-1 text-xs transition-all truncate ${
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
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {todos.length > 3 && (
        <p className="text-[10px] text-gray-600 text-center">
          {todos.filter((t) => !t.done).length - visible.length} more in Todos tab
        </p>
      )}
      {doneCount > 0 && (
        <p className="text-[10px] text-gray-600 text-center">{doneCount} completed</p>
      )}
    </div>
  )
}
