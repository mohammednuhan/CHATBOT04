import { useEffect, useRef, useState } from 'react'
import Background from './components/Background.jsx'
import ChatMessage from './components/ChatMessage.jsx'
import TypingIndicator from './components/TypingIndicator.jsx'
import './App.css'

const WELCOME_MESSAGES = [
  { role: 'assistant', content: 'Hi! I\'m Agent, your AI assistant. Ask me anything and I\'ll help you out.' },
]

export default function App() {
  const [messages, setMessages] = useState(WELCOME_MESSAGES)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, typing])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || typing) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setError(null)
    setTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setSessionId(data.session_id)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ])
    } catch (err) {
      console.error(err)
      setError('Sorry, I couldn\'t reach the server. Is the backend running?')
    } finally {
      setTyping(false)
    }
  }

  async function handleReset() {
    if (sessionId) {
      try {
        await fetch('/api/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
      } catch {
        // ignore
      }
    }
    setSessionId(null)
    setMessages(WELCOME_MESSAGES)
    setError(null)
    inputRef.current?.focus()
  }

  return (
    <div className="app">
      <Background />

      <div className="panel">
        <header className="header">
          <div className="header-left">
            <div className="bot-avatar header-avatar">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
            </div>
            <div>
              <h1 className="header-title">Agent</h1>
              <p className="header-status">
                <span className="status-dot" />
                Online · ready to help
              </p>
            </div>
          </div>
          <button type="button" className="reset-btn" onClick={handleReset} title="New conversation">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            New chat
          </button>
        </header>

        <div className="divider" />

        <main className="messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
          {typing && <TypingIndicator />}
          {error && (
            <div className="error-banner">
              <span>⚠</span> {error}
            </div>
          )}
        </main>

        <form className="composer" onSubmit={handleSend}>
          <input
            ref={inputRef}
            className="composer-input"
            type="text"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!input.trim() || typing}
            aria-label="Send message"
          >
            {typing ? (
              <div className="mini-typing">
                <span />
                <span />
                <span />
              </div>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}