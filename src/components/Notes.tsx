import { useState, useEffect } from 'react'
import { setStored } from '../lib/storage'

export default function Notes() {
  const [text, setText] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('notes')
    if (saved) setText(saved)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setStored('notes', text)
    }, 500)
    return () => clearTimeout(timer)
  }, [text])

  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Write something..."
      rows={6}
      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none"
    />
  )
}
