import { useRelay } from '../../hooks/useRelay'

const CHART_HEIGHT = 80
const WIDTH = 600

export default function Kind1CountChart() {
  const { isConnected, kind1CountSamples } = useRelay()

  if (!isConnected || kind1CountSamples.length === 0) {
    return null
  }

  const n = kind1CountSamples.length
  const minC = Math.min(...kind1CountSamples)
  const maxC = Math.max(...kind1CountSamples)
  const range = maxC - minC || 1
  const points = kind1CountSamples
    .map((c, i) => {
      const x = (n === 1 ? 0 : i / (n - 1)) * WIDTH
      const y = CHART_HEIGHT - ((c - minC) / range) * (CHART_HEIGHT - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  const totalLastMinute = kind1CountSamples.reduce((a, b) => a + b, 0)
  const lastSecond = kind1CountSamples[kind1CountSamples.length - 1] ?? 0

  return (
    <article className="flex flex-col gap-2 p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-muted)]">Kind 1 activity (last 10 min, no NIP-45)</span>
        <span className="text-sm font-mono text-[var(--text)]">{totalLastMinute} in 10 min · {lastSecond}/s</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${CHART_HEIGHT}`}
        className="w-full h-[80px] overflow-visible"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-violet-500 dark:text-violet-400"
          points={points}
        />
      </svg>
    </article>
  )
}
