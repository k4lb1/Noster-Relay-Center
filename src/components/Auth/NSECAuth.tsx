import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function NSECAuth() {
  const { isAuthenticated, hasStoredNSEC, setupNSEC, login, connectNIP46 } = useAuth()
  const [nsec, setNsec] = useState('')
  const [pin, setPin] = useState('')
  const [bunkerUrl, setBunkerUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bunkerLoading, setBunkerLoading] = useState(false)
  const [isSetup, setIsSetup] = useState(!hasStoredNSEC)

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!nsec.trim()) {
        throw new Error('NSEC is required')
      }
      if (!pin.trim() || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        throw new Error('PIN must be exactly 6 digits')
      }
      
      await setupNSEC(nsec.trim(), pin)
      setNsec('')
      setPin('')
      setIsSetup(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (!pin.trim() || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        throw new Error('PIN must be exactly 6 digits')
      }
      await login(pin)
      setPin('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBunkerConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBunkerLoading(true)
    try {
      if (!bunkerUrl.trim()) throw new Error('Bunker URL is required')
      await connectNIP46(bunkerUrl.trim())
      setBunkerUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Bunker')
    } finally {
      setBunkerLoading(false)
    }
  }

  if (isAuthenticated) return null

  return (
    <section className="flex flex-col gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
      <header>
        <h2 className="text-xl font-semibold text-[var(--text)]">
          {isSetup ? 'NSEC Setup' : 'Log in'}
        </h2>
      </header>

      {error && (
        <article className="p-3 rounded-md border border-red-800 dark:border-red-400 bg-red-950/20 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </article>
      )}

      <form onSubmit={isSetup ? handleSetup : handleLogin} className="flex flex-col gap-4">
        {isSetup && (
          <article className="flex flex-col gap-2">
            <label htmlFor="nsec" className="text-sm font-medium text-[var(--text-muted)]">
              NSEC
            </label>
            <input
              id="nsec"
              type="text"
              value={nsec}
              onChange={(e) => setNsec(e.target.value)}
              placeholder="nsec1..."
              className="px-4 py-2 border border-[var(--border)] rounded-md bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)]"
              disabled={loading}
            />
          </article>
        )}

        <article className="flex flex-col gap-2">
          <label htmlFor="pin" className="text-sm font-medium text-[var(--text-muted)]">
            PIN (6 digits)
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              setPin(value)
            }}
            placeholder="000000"
            className="px-4 py-2 border border-[var(--border)] rounded-md bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)]"
            disabled={loading}
          />
        </article>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 font-medium text-[var(--text)] border border-[var(--border)] rounded-md bg-[var(--bg-secondary)] hover:border-[var(--text-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : isSetup ? 'Save' : 'Log in'}
        </button>
      </form>

      {hasStoredNSEC && isSetup && (
        <button
          onClick={() => setIsSetup(false)}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Log in instead
        </button>
      )}

      <article className="pt-4 mt-4 border-t border-[var(--border)] flex flex-col gap-3">
        <span className="text-sm font-medium text-[var(--text-muted)]">Or connect with Nostr Bunker (NIP-46)</span>
        <form onSubmit={handleBunkerConnect} className="flex flex-col gap-2">
          <input
            type="text"
            value={bunkerUrl}
            onChange={(e) => setBunkerUrl(e.target.value)}
            placeholder="bunker://pubkey?relay=wss://... or nip05@domain"
            className="px-4 py-2 border border-[var(--border)] rounded-md bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)]"
            disabled={loading || bunkerLoading}
          />
          <button
            type="submit"
            disabled={loading || bunkerLoading || !bunkerUrl.trim()}
            className="px-4 py-2 text-sm font-medium text-[var(--text)] border border-[var(--border)] rounded-md bg-[var(--bg)] hover:border-[var(--text-muted)] disabled:opacity-50 transition-colors"
          >
            {bunkerLoading ? 'Connecting...' : 'Connect Bunker'}
          </button>
        </form>
      </article>
    </section>
  )
}
