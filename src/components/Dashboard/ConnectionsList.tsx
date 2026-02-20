import { useRelay } from '../../hooks/useRelay'

export default function ConnectionsList() {
  const { url, isConnected, error } = useRelay()

  return (
    <section className="flex flex-col gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
      <header>
        <h2 className="text-xl font-semibold text-[var(--text)]">Active connections</h2>
      </header>

      {!isConnected ? (
        <article className="p-4 rounded-md bg-[var(--bg)] border border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">No active connection</p>
        </article>
      ) : (
        <article className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" aria-hidden />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-[var(--text)]">WebSocket connection</span>
              <span className="text-xs font-mono text-[var(--text-muted)] break-all">{url}</span>
            </div>
          </div>
          
          {error && (
            <div className="p-3 rounded-md border border-amber-700 dark:border-amber-500 bg-amber-950/20">
              <p className="text-xs text-amber-700 dark:text-amber-300">{error}</p>
            </div>
          )}

          <p className="text-xs text-[var(--text-muted)] mt-2">
            This relay does not provide a list of active connections.
          </p>
        </article>
      )}
    </section>
  )
}
