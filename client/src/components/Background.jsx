import { useMemo } from 'react'

const ORB_COLORS = [
  'rgba(99, 102, 241, 0.35)',
  'rgba(168, 85, 247, 0.3)',
  'rgba(34, 211, 238, 0.25)',
  'rgba(244, 114, 182, 0.25)',
]

function rand(min, max) {
  return Math.random() * (max - min) + min
}

export default function Background() {
  const orbs = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        size: rand(120, 320),
        left: rand(0, 100),
        top: rand(0, 100),
        color: ORB_COLORS[i % ORB_COLORS.length],
        duration: rand(14, 26),
        delay: rand(-20, 0),
      })),
    []
  )

  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: rand(0, 100),
        size: rand(2, 5),
        duration: rand(6, 16),
        delay: rand(-16, 0),
      })),
    []
  )

  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-grid" />
      {orbs.map((o) => (
        <div
          key={o.id}
          className="orb"
          style={{
            width: o.size,
            height: o.size,
            left: `${o.left}%`,
            top: `${o.top}%`,
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            animationDuration: `${o.duration}s`,
            animationDelay: `${o.delay}s`,
          }}
        />
      ))}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}