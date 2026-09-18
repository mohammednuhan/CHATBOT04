export default function ChatMessage({ role, content }) {
  const isBot = role === 'assistant'
  return (
    <div className={`msg ${isBot ? 'msg-bot' : 'msg-user'}`}>
      {isBot && (
        <div className="avatar bot-avatar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </div>
      )}
      <div className={`bubble ${isBot ? 'bubble-bot' : 'bubble-user'}`}>
        <p className="msg-text">{content}</p>
      </div>
      {!isBot && (
        <div className="avatar user-avatar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        </div>
      )}
    </div>
  )
}