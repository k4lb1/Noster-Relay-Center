import { useRelay } from '../../hooks/useRelay'

const CHART_HEIGHT = 80
const WIDTH = 600

export default function RelayLatencyChart() {
  const { isConnected, pingSamples } = useRelay()

  if (!isConnected || pingSamples.length === 0) {
    return null
  }

  const n = pingSamples.length
  const maxMs = Math.max(...pingSamples, 1)
  const points = pingSamples
    .map((ms, i) => {
      const x = (n === 1 ? 0 : i / (n - 1)) * WIDTH
      const y = CHART_HEIGHT - (ms / maxMs) * (CHART_HEIGHT - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  const lastMs = pingSamples[pingSamples.length - 1]

  return (
    <article className="flex flex-col gap-2 p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-muted)]">Ping (last 10 min)</span>
        <span className="text-sm font-mono text-[var(--text)]">{lastMs} ms</span>
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
          className="text-green-600 dark:text-green-400"
          points={points}
        />
      </svg>
    </article>
  )
}
