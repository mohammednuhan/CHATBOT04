import { useCallback, useEffect, useRef, useState } from 'react'
import Background from './components/Background.jsx'
import Sidebar from './components/Sidebar.jsx'
import ChatHeader from './components/ChatHeader.jsx'
import Welcome from './components/Welcome.jsx'
import MessageList from './components/MessageList.jsx'
import Composer from './components/Composer.jsx'
import MemoriesPanel from './components/MemoriesPanel.jsx'
import './App.css'

let seq = 0
const nextId = () => `m${++seq}`

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SUGGESTIONS = [
  'What can you do?',
  'Write a poem about space',
  'Help me fix a bug in Python',
  'Explain AI in simple words',
]

export default function App() {
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState('Say something to start the conversation')
  const [title, setTitle] = useState('New chat')
  const [memories, setMemories] = useState([])
  const [memoriesOpen, setMemoriesOpen] = useState(false)

  const scrollRef = useRef(null)
  const streamRef = useRef(null)
  const abortRef = useRef(null)

  const fetchMemories = useCallback(async (sid) => {
    if (!sid) return
    try {
      const res = await fetch(
        `/api/memories?session_id=${encodeURIComponent(sid)}`
      )
      if (res.ok) {
        const data = await res.json()
        setMemories(data.memories || [])
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!sessionId) {
      setMemories([])
      return undefined
    }
    fetchMemories(sessionId)
    const timer = setInterval(() => fetchMemories(sessionId), 6000)
    return () => clearInterval(timer)
  }, [sessionId, fetchMemories])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, started, connecting])

  async function handleSend(text) {
    if (!text.trim() || streamRef.current) return

    const first = !started
    if (first) setStarted(true)
    setTitle((t) => (first ? text.slice(0, 30) : t))
    setPreview('')
    setError(null)

    const botId = nextId()
    const botMsg = {
      id: botId,
      role: 'assistant',
      content: '',
      time: nowTime(),
      streaming: true,
    }
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', content: text, time: nowTime() },
      botMsg,
    ])

    setConnecting(true)
    streamRef.current = true
    const controller = new AbortController()
    abortRef.current = controller

    const appendDelta = (d) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, content: m.content + d } : m
        )
      )
      setPreview((p) => p + d)
    }

    const finish = (silent) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === botId ? { ...m, streaming: false } : m))
      )
      setConnecting(false)
      streamRef.current = null
      abortRef.current = null
      if (!silent) setPreview('Reply received')
    }

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) throw new Error('Request failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finished = false

      while (!finished) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let idx
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, idx).trim()
          buffer = buffer.slice(idx + 2)
          if (!raw.startsWith('data: ')) continue
          const payload = JSON.parse(raw.slice(6))
          if (payload.delta) {
            setConnecting(false)
            appendDelta(payload.delta)
          } else if (payload.done) {
            setSessionId(payload.session_id)
            finished = true
            break
          } else if (payload.error) {
            throw new Error(payload.error)
          }
        }
      }
      setPreview((p) => p.trim() || 'Reply received')
      fetchMemories(sessionId)
      finish(false)
    } catch (err) {
      if (err.name === 'AbortError') {
        finish(true)
      } else {
        console.error(err)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  content: 'Something went wrong. Make sure the backend is running and try again.',
                  streaming: false,
                }
              : m
          )
        )
        setError('Could not reach the agent. Is the backend running?')
        finish(true)
      }
    }
  }

  function handleStop() {
    abortRef.current?.abort()
  }

  function handleNewChat() {
    if (sessionId) {
      fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      }).catch(() => {})
    }
    streamRef.current = null
    abortRef.current?.abort()
    setSessionId(null)
    setMessages([])
    setStarted(false)
    setConnecting(false)
    setError(null)
    setPreview('Say something to start the conversation')
    setTitle('New chat')
    setMemories([])
  }

  async function handleAddMemory(text) {
    if (!sessionId || !text.trim()) return
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, text: text.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setMemories(data.memories || [])
      }
    } catch {
      // ignore
    }
  }

  async function handleDeleteMemory(id) {
    if (!sessionId) return
    try {
      const res = await fetch('/api/memories/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, id }),
      })
      if (res.ok) {
        const data = await res.json()
        setMemories(data.memories || [])
      }
    } catch {
      // ignore
    }
  }

  async function handleClearMemories() {
    if (!sessionId) return
    try {
      const res = await fetch('/api/memories/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (res.ok) setMemories([])
    } catch {
      // ignore
    }
  }

  return (
    <div className="app">
      <Background />

      <div className="window">
        <div className="titlebar">
          <div className="traffic">
            <span className="tl tl-red" />
            <span className="tl tl-yellow" />
            <span className="tl tl-green" />
          </div>
          <div className="titlebar-center">
            <span className="titlebar-dot" /> Agent — chat with AI
          </div>
          <div className="titlebar-actions">
            <button
              type="button"
              className={`tb-btn ${memoriesOpen ? 'active' : ''}`}
              onClick={() => setMemoriesOpen((v) => !v)}
              title="Memory"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.18 9 5.93 6.54a6 6 0 0 0-.6 7.86L8.5 18l2.14-2.14" />
                <path d="M6.61 12.36a6 6 0 1 1 4.41-5.84" />
                <path d="M15.56 7.9a6 6 0 0 1 2.16 2.6" />
                <path d="M9.4 21a6 6 0 0 0 5.32-1.41" />
                <path d="M16.78 16.93a6 6 0 0 0 .98-5.77" />
              </svg>
              <span className="tb-btn-badge">{memories.length}</span>
            </button>
            <div className="tb-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <div className="tb-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 10 21 7l-3-3-3 3" />
                <path d="M5 16 4 13a2 2 0 0 1 1.4-2.4l5-1.6a2 2 0 0 1 2.4 1.4L14 14" />
              </svg>
            </div>
          </div>
        </div>

        <div className="body">
          <Sidebar
            title={title}
            preview={preview}
            connecting={connecting}
            memoryCount={memories.length}
            memoriesOpen={memoriesOpen}
            onToggleMemories={() => setMemoriesOpen((v) => !v)}
            onNewChat={handleNewChat}
          />

          <div className="chat">
            <ChatHeader connecting={connecting} onStop={handleStop} />

            <main className="messages" ref={scrollRef}>
              {started ? (
                <MessageList
                  messages={messages}
                  connecting={connecting}
                  error={error}
                />
              ) : (
                <Welcome suggestions={SUGGESTIONS} onPick={handleSend} />
              )}
            </main>

            <Composer
              onSend={handleSend}
              onStop={handleStop}
              busy={!!streamRef.current}
              connecting={connecting}
              suggestions={SUGGESTIONS}
              started={started}
              onSuggestion={handleSend}
            />
          </div>

          <MemoriesPanel
            open={memoriesOpen}
            memories={memories}
            sessionActive={!!sessionId}
            onClose={() => setMemoriesOpen(false)}
            onAdd={handleAddMemory}
            onDelete={handleDeleteMemory}
            onClear={handleClearMemories}
          />
        </div>
      </div>
    </div>
  )
}