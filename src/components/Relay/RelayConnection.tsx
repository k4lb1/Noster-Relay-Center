import { useState } from 'react'
import { useRelay } from '../../hooks/useRelay'
import { useNIP11 } from '../../hooks/useNIP11'

const STORAGE_KEY_RELAY_URL = 'nostr-relay-center-relay-url'

function getInitialRelayUrl(): string {
  if (typeof window === 'undefined') return ''
  const stored = localStorage.getItem(STORAGE_KEY_RELAY_URL)
  if (stored?.trim()) return stored.trim()
  const env = import.meta.env.VITE_DEFAULT_RELAY_URL
  return (typeof env === 'string' && env.trim()) ? env.trim() : ''
}

export default function RelayConnection() {
  const { url, isConnected, error, connect, disconnect } = useRelay()
  const { fetchMetadata } = useNIP11()
  const [relayUrl, setRelayUrl] = useState(getInitialRelayUrl)
  const [loading, setLoading] = useState(false)
  const [collapsed, setCollapsed] = useState(true)

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await connect(relayUrl)
      await fetchMetadata(relayUrl)
      try {
        localStorage.setItem(STORAGE_KEY_RELAY_URL, relayUrl.trim())
      } catch {
        // ignore localStorage errors
      }
    } catch (err) {
      console.error('Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setRelayUrl('')
    setCollapsed(false)
  }

  const showCollapsed = isConnected && collapsed

  return (
    <section className="flex flex-col gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
      <header
        role="button"
        tabIndex={0}
        aria-expanded={!showCollapsed}
        onClick={() => isConnected && setCollapsed((c) => !c)}
        onKeyDown={(e) => isConnected && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setCollapsed((c) => !c))}
        className="flex flex-wrap items-center justify-between gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)] focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] rounded"
      >
        <h2 className="text-xl font-semibold text-[var(--text)]">Relay connection</h2>
        {isConnected && url && (
          <span className="text-sm font-mono text-[var(--text-muted)] truncate max-w-[16rem]" title={url}>
            {url}
          </span>
        )}
        {isConnected && (
          <span className="text-xs text-[var(--text-muted)]" aria-hidden>
            {collapsed ? '▼ Expand' : '▲ Collapse'}
          </span>
        )}
      </header>

      {!showCollapsed && (
        <>
      {error && (
        <article className="p-3 rounded-md border border-red-800 dark:border-red-400 bg-red-950/20 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </article>
      )}

      {isConnected && url && (
        <article className="p-3 rounded-md border border-green-800 dark:border-green-500 bg-green-950/20 dark:bg-green-950/30">
          <p className="text-sm text-green-700 dark:text-green-300">
            Connected to: <span className="font-mono">{url}</span>
          </p>
        </article>
      )}

      <form onSubmit={handleConnect} className="flex flex-col gap-4">
        <article className="flex flex-col gap-2">
          <label htmlFor="relay-url" className="text-sm font-medium text-[var(--text-muted)]">
            Relay WebSocket URL
          </label>
          <input
            id="relay-url"
            type="text"
            value={relayUrl}
            onChange={(e) => setRelayUrl(e.target.value)}
            placeholder="wss://relay.example.com"
            className="px-4 py-2 border border-[var(--border)] rounded-md bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)]"
            disabled={loading || isConnected}
          />
        </article>

        {isConnected ? (
          <button
            type="button"
            onClick={handleDisconnect}
            className="px-4 py-2 font-medium text-[var(--text)] border border-[var(--border)] rounded-md bg-[var(--bg-secondary)] hover:border-[var(--text-muted)] transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !relayUrl.trim()}
            className="px-4 py-2 font-medium text-[var(--text)] border border-[var(--border)] rounded-md bg-[var(--bg-secondary)] hover:border-[var(--text-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </form>
        </>
      )}
    </section>
  )
}
