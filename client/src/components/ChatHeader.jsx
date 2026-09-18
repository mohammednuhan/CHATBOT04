export default function ChatHeader({ connecting, onStop }) {
  return (
    <div className="chat-header">
      <div className="ch-left">
        <span className="ch-avatar-wrap">
          <span className="ch-avatar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </span>
          <span className="ch-status-dot" />
        </span>
        <div>
          <h2 className="ch-name">Agent</h2>
          <p className="ch-status">
            {connecting ? 'Generating a reply…' : 'Active now'}
          </p>
        </div>
      </div>
      <div className="ch-actions">
        {connecting && (
          <button type="button" className="stop-btn" onClick={onStop} title="Stop generating">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff" stroke="none">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        )}
        <div className="tb-icon ch-action">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
          </svg>
        </div>
        <div className="tb-icon ch-action">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m23 7-7 5 7 5Z" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
        </div>
        <div className="tb-icon ch-action">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
      </div>
    </div>
  )
}