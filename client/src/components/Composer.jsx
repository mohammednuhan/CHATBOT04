import { useState } from 'react'

export default function Composer({ onSend, onStop, busy, started, suggestions, onSuggestion }) {
  const [text, setText] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!text.trim() || busy) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="composer-wrap">
      <form className="composer" onSubmit={submit}>
        <div className="cc-left">
          <div className="cc-icon" title="Attach">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </div>
          <div className="cc-icon" title="Emoji">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <path d="M9 9h.01" />
              <path d="M15 9h.01" />
            </svg>
          </div>
        </div>

        <input
          className="composer-input"
          type="text"
          placeholder={busy ? 'Waiting for Agent…' : 'Message Agent'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />

        <div className="cc-right">
          {busy ? (
            <button type="button" className="stop-generate" onClick={onStop} title="Stop">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" stroke="none">
                <rect x="5" y="5" width="14" height="14" rx="3" />
              </svg>
            </button>
          ) : (
            <>
              <div className="cc-icon cc-mic">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <path d="M12 19v3" />
                </svg>
              </div>
              <button type="submit" className="send-btn" disabled={!text.trim()}>
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </>
          )}
        </div>
      </form>

      {!started && (
        <div className="suggestion-row">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              onClick={() => onSuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}