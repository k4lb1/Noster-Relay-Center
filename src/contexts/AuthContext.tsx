import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { getPublicKey as getPubkeyFromNsec, finalizeEvent, nip19, generateSecretKey } from 'nostr-tools'
import { BunkerSigner, parseBunkerInput } from 'nostr-tools/nip46'
import { encryptNSEC, decryptNSEC } from '../utils/crypto'
import { storeEncryptedNSEC, getEncryptedNSEC, hasEncryptedNSEC } from '../utils/storage'
import type { Event } from 'nostr-tools'

interface AuthContextType {
  nsec: string | null
  isAuthenticated: boolean
  hasStoredNSEC: boolean
  authMode: 'nsec' | 'nip46'
  pubkey: string | null
  setupNSEC: (nsec: string, pin: string) => Promise<void>
  login: (pin: string) => Promise<void>
  logout: () => void
  connectNIP46: (bunkerUrl: string) => Promise<void>
  disconnectNIP46: () => void
  signEvent: (unsignedEvent: Omit<Event, 'id' | 'sig'>) => Promise<Event>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [nsec, setNsec] = useState<string | null>(null)
  const [hasStored, setHasStored] = useState(false)
  const [bunkerPubkey, setBunkerPubkey] = useState<string | null>(null)
  const bunkerSignerRef = useRef<BunkerSigner | null>(null)

  useEffect(() => {
    setHasStored(hasEncryptedNSEC())
  }, [])

  const setupNSEC = async (nsecInput: string, pin: string) => {
    if (!nsecInput.startsWith('nsec1')) {
      throw new Error('Invalid NSEC format. Must start with "nsec1".')
    }
    const encrypted = await encryptNSEC(nsecInput, pin)
    storeEncryptedNSEC(encrypted)
    setNsec(nsecInput)
    setHasStored(true)
  }

  const login = async (pin: string) => {
    const encrypted = getEncryptedNSEC()
    if (!encrypted) throw new Error('No stored NSEC found.')
    const decrypted = await decryptNSEC(encrypted, pin)
    setNsec(decrypted)
  }

  const connectNIP46 = useCallback(async (bunkerUrl: string) => {
    const bp = await parseBunkerInput(bunkerUrl.trim())
    if (!bp || !bp.pubkey || !bp.relays?.length) {
      throw new Error('Invalid bunker URL. Use bunker://pubkey?relay=wss://... or nip05@domain')
    }
    if (bunkerSignerRef.current) {
      bunkerSignerRef.current.close()
      bunkerSignerRef.current = null
      setBunkerPubkey(null)
    }
    setNsec(null)
    const clientSk = generateSecretKey()
    const signer = BunkerSigner.fromBunker(clientSk, bp)
    await signer.connect()
    const pk = await signer.getPublicKey()
    bunkerSignerRef.current = signer
    setBunkerPubkey(pk)
  }, [])

  const disconnectNIP46 = useCallback(() => {
    if (bunkerSignerRef.current) {
      bunkerSignerRef.current.close()
      bunkerSignerRef.current = null
    }
    setBunkerPubkey(null)
  }, [])

  const logout = useCallback(() => {
    setNsec(null)
    if (bunkerSignerRef.current) {
      bunkerSignerRef.current.close()
      bunkerSignerRef.current = null
    }
    setBunkerPubkey(null)
  }, [])

  const signEvent = useCallback(
    async (unsignedEvent: Omit<Event, 'id' | 'sig'>): Promise<Event> => {
      if (bunkerSignerRef.current && bunkerPubkey) {
        return bunkerSignerRef.current.signEvent(unsignedEvent as Event)
      }
      if (nsec) {
        const decoded = nip19.decode(nsec)
        if (decoded.type !== 'nsec') throw new Error('Invalid NSEC format')
        return finalizeEvent(unsignedEvent as Event, decoded.data)
      }
      throw new Error('Not authenticated')
    },
    [nsec, bunkerPubkey]
  )

  const pubkey =
    bunkerPubkey ||
    (nsec ? (() => {
      try {
        const decoded = nip19.decode(nsec)
        if (decoded.type !== 'nsec') return null
        return getPubkeyFromNsec(decoded.data)
      } catch {
        return null
      }
    })() : null)

  const isAuthenticated = nsec !== null || bunkerPubkey !== null
  const authMode: 'nsec' | 'nip46' = bunkerPubkey ? 'nip46' : 'nsec'

  return (
    <AuthContext.Provider
      value={{
        nsec: authMode === 'nsec' ? nsec : null,
        isAuthenticated,
        hasStoredNSEC: hasStored,
        authMode,
        pubkey,
        setupNSEC,
        login,
        logout,
        connectNIP46,
        disconnectNIP46,
        signEvent
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
