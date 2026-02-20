import { useEffect, useState } from 'react'
import { useRelay } from '../../hooks/useRelay'

export default function RelayStats() {
  const { isConnected, requestCount, recentKind1Events } = useRelay()
  const [eventCount, setEventCount] = useState<number | null>(null)

  useEffect(() => {
    if (!isConnected) {
      setEventCount(null)
      return
    }
    requestCount({ kinds: [1] }).then((n) => setEventCount(n))
  }, [isConnected, requestCount])

  if (!isConnected) {
    return (
      <section className="flex flex-col gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
        <header>
          <h2 className="text-xl font-semibold text-[var(--text)]">Relay statistics</h2>
        </header>
        <p className="text-[var(--text-muted)]">Connect to a relay to see statistics</p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
      <header>
        <h2 className="text-xl font-semibold text-[var(--text)]">Relay statistics</h2>
      </header>

      <article className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 p-3 rounded-md bg-[var(--bg)] border border-[var(--border)]">
          <span className="text-xs font-medium text-[var(--text-muted)]">Event count (Kind 1)</span>
          <span className="text-sm text-[var(--text)]">
            {eventCount === null ? '—' : eventCount.toLocaleString()}
          </span>
          {eventCount === null && (
            <span className="text-xs text-[var(--text-muted)]">Relay may not support NIP-45 COUNT</span>
          )}
        </div>

        {recentKind1Events.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
            <span className="text-xs font-medium text-[var(--text-muted)]">Recent activity (Kind 1)</span>
            <ul className="flex flex-col gap-1 text-sm">
              {recentKind1Events.map((ev) => (
                <li
                  key={ev.id}
                  className="font-mono text-xs text-[var(--text-muted)] truncate"
                  title={ev.content || undefined}
                >
                  {ev.content?.slice(0, 80) || ev.id.slice(0, 16)}…
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </section>
  )
}
