export default function Sidebar({
  title,
  preview,
  connecting,
  memoryCount,
  memoriesOpen,
  onToggleMemories,
  onNewChat,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-logo">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </span>
        <span className="brand-name">Agent</span>
        <span className="brand-pro">AI</span>
      </div>

      <button type="button" className="new-chat-btn" onClick={onNewChat}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        New chat
      </button>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Recent</span>
        <div className="conv active">
          <span className="conv-avatar">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </span>
          <div className="conv-body">
            <div className="conv-title-row">
              <span className="conv-title">{title}</span>
              {connecting && <span className="conv-typing-tag">typing…</span>}
            </div>
            <span className="conv-preview">{preview}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`mem-toggle ${memoriesOpen ? 'active' : ''}`}
        onClick={onToggleMemories}
      >
        <span className="mem-toggle-icon">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.18 9 5.93 6.54a6 6 0 0 0-.6 7.86L8.5 18l2.14-2.14" />
            <path d="M6.61 12.36a6 6 0 1 1 4.41-5.84" />
            <path d="M15.56 7.9a6 6 0 0 1 2.16 2.6" />
            <path d="M9.4 21a6 6 0 0 0 5.32-1.41" />
            <path d="M16.78 16.93a6 6 0 0 0 .98-5.77" />
          </svg>
        </span>
        <span className="mem-toggle-body">
          <span className="mem-toggle-title">Memory</span>
          <span className="mem-toggle-sub">
            {memoryCount > 0
              ? `${memoryCount} ${memoryCount === 1 ? 'item' : 'items'} saved`
              : 'Nothing saved yet'}
          </span>
        </span>
        {memoryCount > 0 && <span className="mem-toggle-badge">{memoryCount}</span>}
        <svg
          className="mem-toggle-chevron"
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="sidebar-footer">
        <span className="profile-avatar">G</span>
        <div className="profile-body">
          <span className="profile-name">Guest</span>
          <span className="profile-status">Signed in locally</span>
        </div>
        <div className="tb-icon profile-settings">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </div>
      </div>
    </aside>
  )
}