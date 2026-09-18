import TypingIndicator from './TypingIndicator.jsx'

function BubbleAvatar({ side }) {
  return (
    <span className={`bubble-avatar ${side === 'left' ? 'ba-bot' : 'ba-user'}`}>
      {side === 'left' ? (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      )}
    </span>
  )
}

export default function MessageList({ messages, connecting, error }) {
  return (
    <>
      <div className="day-divider">
        <span>Today</span>
      </div>

      {messages.map((m) => {
        const isBot = m.role === 'assistant'
        return (
          <div key={m.id} className={`row ${isBot ? 'row-bot' : 'row-user'}`}>
            {isBot && <BubbleAvatar side="left" />}
            <div className={`bubble ${isBot ? 'bubble-bot' : 'bubble-user'}`}>
              <div className="bubble-text">
                {m.content}
                {m.streaming && <span className="stream-caret" />}
              </div>
              <div className={`bubble-meta ${isBot ? 'meta-bot' : 'meta-user'}`}>
                {m.streaming ? (
                  <span className="meta-streaming">
                    <span className="mini-dot" />
                    <span className="mini-dot" />
                    <span className="mini-dot" />
                  </span>
                ) : (
                  <>
                    <span>{m.time}</span>
                    {!isBot && (
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </>
                )}
              </div>
            </div>
            {!isBot && <BubbleAvatar side="right" />}
          </div>
        )
      })}

      {connecting && <TypingIndicator />}

      {error && (
        <div className="error-banner">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </>
  )
}