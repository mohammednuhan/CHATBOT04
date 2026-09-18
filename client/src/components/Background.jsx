import { useMemo } from 'react'

export default function Background() {
  const orbs = useMemo(
    () =>
      [
        { left: '70%', top: '-14%', size: 520, color: 'rgba(163, 150, 255, 0.30)' },
        { left: '4%', top: '66%', size: 440, color: 'rgba(226, 176, 255, 0.28)' },
        { left: '36%', top: '24%', size: 600, color: 'rgba(132, 220, 255, 0.20)' },
        { left: '82%', top: '72%', size: 360, color: 'rgba(255, 190, 228, 0.26)' },
        { left: '-6%', top: '-10%', size: 480, color: 'rgba(180, 170, 255, 0.24)' },
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