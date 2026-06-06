export function AreaChart({ color = '#ff713e' }: { color?: string }) {
  const data = [30, 45, 38, 55, 42, 60, 52, 48, 65, 58, 72, 68, 55, 70, 62, 75, 68, 80, 72, 65, 78, 70, 60, 68, 55, 62, 70, 75, 68, 72]
  const w = 600
  const h = 120
  const pad = 0
  const min = 0
  const max = 100
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2)
    return [x, y]
  })
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 120 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}
