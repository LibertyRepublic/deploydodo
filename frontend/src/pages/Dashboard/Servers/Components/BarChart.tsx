export function BarChart({ color = '#ff713e' }: { color?: string }) {
  const bars = [12, 28, 18, 35, 22, 40, 30, 25, 45, 32, 38, 50, 42, 35, 48, 38, 55, 45, 40, 52, 44, 38, 46, 35, 42, 50, 44, 48, 40, 45]
  const max = Math.max(...bars)
  const h = 80
  const w = 600
  const barW = (w / bars.length) * 0.7
  const gap = (w / bars.length) * 0.3

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
      {bars.map((v, i) => {
        const x = i * (w / bars.length) + gap / 2
        const barH = (v / max) * h
        const y = h - barH
        return (
          <rect key={i} x={x} y={y} width={barW} height={barH} rx="2" fill={color} fillOpacity="0.85" />
        )
      })}
    </svg>
  )
}
