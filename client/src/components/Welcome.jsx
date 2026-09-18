export default function Welcome({ suggestions, onPick }) {
  return (
    <div className="welcome">
      <div className="welcome-logo">
        <span className="welcome-ring" />
        <span className="welcome-icon">
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </span>
      </div>

      <h2 className="welcome-title">How can I help you today?</h2>
      <p className="welcome-sub">
        Ask me anything. I can write, explain, search, and help solve problems.
      </p>

      <div className="suggestions">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="suggestion-chip"
            onClick={() => onPick(s)}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 4 4 10-10" />
            </svg>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}