import { useEffect, useRef, useState } from 'react'
import Background from './components/Background.jsx'
import Sidebar from './components/Sidebar.jsx'
import ChatHeader from './components/ChatHeader.jsx'
import Welcome from './components/Welcome.jsx'
import MessageList from './components/MessageList.jsx'
import Composer from './components/Composer.jsx'
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

  const scrollRef = useRef(null)
  const streamRef = useRef(null)
  const abortRef = useRef(null)

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
        </div>
      </div>
    </div>
  )
}