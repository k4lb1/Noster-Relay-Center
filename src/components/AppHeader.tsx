import { useRelay } from '../contexts/RelayContext'

const THEME_KEY = 'theme'

function getTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  const t = document.documentElement.getAttribute('data-theme')
  return t === 'dark' ? 'dark' : 'light'
}

function setTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme)
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch (_) {}
}

export default function AppHeader() {
  const { isConnected, error, pingSamples } = useRelay()
  const pingMs = pingSamples.length > 0 ? pingSamples[pingSamples.length - 1] : null

  const handleThemeToggle = () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  const statusDot = error
    ? 'bg-red-500'
    : isConnected
      ? 'bg-green-500'
      : 'bg-[var(--text-muted)] opacity-60 animate-pulse'

  return (
    <header
      className="fixed top-6 left-6 right-6 z-[1000] flex items-center flex-row-reverse gap-2"
      aria-label="App-Navigation"
    >
      <section className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleThemeToggle}
          className="h-12 w-12 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-center text-lg shadow-sm transition-transform hover:scale-105 active:scale-95"
          aria-label="Toggle theme"
        >
          <span className="hidden dark:inline" aria-hidden>☀️</span>
          <span className="dark:hidden" aria-hidden>🌙</span>
        </button>
        <span
          className="inline-flex items-center gap-2 h-12 px-4 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[13px] font-medium text-[var(--text)] shadow-sm min-w-[6rem] justify-center"
          aria-live="polite"
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot}`}
            aria-hidden
          />
          {!isConnected ? 'Not connected' : pingMs !== null ? `${pingMs} ms` : '… ms'}
        </span>
      </section>
    </header>
  )
}
