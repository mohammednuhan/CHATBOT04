import { useMemo } from 'react'

export default function Background() {
  const orbs = useMemo(
    () =>
      [
        { left: '72%', top: '-12%', size: 520, color: 'rgba(99,102,241,0.28)' },
        { left: '8%', top: '68%', size: 440, color: 'rgba(168,85,247,0.22)' },
        { left: '38%', top: '28%', size: 600, color: 'rgba(34,211,238,0.14)' },
        { left: '80%', top: '74%', size: 360, color: 'rgba(244,114,182,0.16)' },
        { left: '-4%', top: '-8%', size: 480, color: 'rgba(99,102,241,0.18)' },
      ],
    []
  )

  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-grid" />
      {orbs.map((o, i) => (
        <div
          key={i}
          className="orb"
          style={{
            width: o.size,
            height: o.size,
            left: o.left,
            top: o.top,
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            animationDuration: `${18 + i * 4}s`,
            animationDelay: `${-i * 2}s`,
          }}
        />
      ))}
    </div>
  )
}