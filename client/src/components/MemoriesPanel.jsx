import { useState } from 'react'

const CATEGORY_META = {
  identity: { icon: 'user', color: '#6366f1', label: 'Identity' },
  preference: { icon: 'heart', color: '#ec4899', label: 'Preference' },
  goal: { icon: 'target', color: '#f59e0b', label: 'Goal' },
  project: { icon: 'briefcase', color: '#14b8a6', label: 'Project' },
  fact: { icon: 'info', color: '#0ea5e9', label: 'Fact' },
}

function CatIcon({ name, color }) {
  const common = {
    width: 14,
    height: 14,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (name) {
    case 'heart':
      return (
        <svg {...common}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      )
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

export default function MemoriesPanel({
  open,
  memories,
  sessionActive,
  onClose,
  onAdd,
  onDelete,
  onClear,
}) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!text.trim() || saving) return
    setSaving(true)
    await onAdd(text.trim())
    setText('')
    setSaving(false)
  }

  return (
    <aside className={`memories ${open ? 'open' : ''}`}>
      <button type="button" className="mem-close" onClick={onClose} aria-label="Close memory panel">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <div className="mem-header">
        <span className="mem-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.18 9 5.93 6.54a6 6 0 0 0-.6 7.86L8.5 18l2.14-2.14" />
            <path d="M6.61 12.36a6 6 0 1 1 4.41-5.84" />
            <path d="M15.56 7.9a6 6 0 0 1 2.16 2.6" />
            <path d="M9.4 21a6 6 0 0 0 5.32-1.41" />
            <path d="M16.78 16.93a6 6 0 0 0 .98-5.77" />
          </svg>
        </span>
        <div>
          <h3 className="mem-title">Memory</h3>
          <p className="mem-sub">What Agent remembers about you</p>
        </div>
      </div>

      <div className="mem-count-row">
        <span>Saved items</span>
        <span className="mem-count-badge">{memories.length}</span>
      </div>

      <div className="mem-list">
        {memories.length === 0 ? (
          <div className="mem-empty">
            <span className="mem-empty-icon">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v3" />
                <path d="M5.22 4.22l2.12 2.12" />
                <path d="M3 12h3" />
                <path d="M16.66 6.34l2.12-2.12" />
                <path d="M18 12h3" />
                <path d="M12 15a6 6 0 0 0 4.95-2.6" />
                <path d="M8.6 8.6A6 6 0 0 1 12 7" />
                <path d="m6 21 6-6 6 6" />
              </svg>
            </span>
            <p className="mem-empty-title">No memories yet</p>
            <p className="mem-empty-sub">
              As you talk, Agent automatically saves important details here — or
              add one yourself below.
            </p>
          </div>
        ) : (
          memories.map((m) => {
            const meta = CATEGORY_META[m.category] || CATEGORY_META.fact
            return (
              <div key={m.id} className="mem-card">
                <span
                  className="mem-cat-icon"
                  style={{ color: meta.color, background: `${meta.color}1f` }}
                >
                  <CatIcon name={meta.icon} color={meta.color} />
                </span>
                <div className="mem-card-body">
                  <span className="mem-cat-label" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  <p className="mem-card-text">{m.text}</p>
                </div>
                <button
                  type="button"
                  className="mem-del"
                  onClick={() => onDelete(m.id)}
                  title="Delete memory"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>

      <div className="mem-footer">
        <form className="mem-add" onSubmit={submit}>
          <input
            type="text"
            placeholder="Add a memory…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!sessionActive}
          />
          <button type="submit" disabled={!text.trim() || !sessionActive} aria-label="Save memory">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </form>
        <button
          type="button"
          className="mem-clear"
          onClick={onClear}
          disabled={memories.length === 0}
        >
          Clear all
        </button>
      </div>
    </aside>
  )
}