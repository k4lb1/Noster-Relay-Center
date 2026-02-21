import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const MAX_LOGS = 100

export interface LogEntry {
  id: string
  time: number
  level: 'error' | 'warn' | 'info'
  message: string
  source?: string
}

interface LogContextType {
  logs: LogEntry[]
  addLog: (level: LogEntry['level'], message: string, source?: string) => void
  clearLogs: () => void
}

const LogContext = createContext<LogContextType | undefined>(undefined)

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback(
    (level: LogEntry['level'], message: string, source?: string) => {
      const entry: LogEntry = {
        id: makeId(),
        time: Date.now(),
        level,
        message,
        source,
      }
      setLogs((prev) => [...prev.slice(1 - MAX_LOGS), entry])
    },
    []
  )

  const clearLogs = useCallback(() => setLogs([]), [])

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      addLog(
        'error',
        event.message || 'Unknown error',
        'Global'
      )
    }
    const onRejection = (event: PromiseRejectionEvent) => {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason)
      addLog('error', message, 'Global')
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [addLog])

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  )
}

export function useLog(): LogContextType {
  const ctx = useContext(LogContext)
  if (ctx === undefined) throw new Error('useLog must be used within LogProvider')
  return ctx
}
