import type { EncryptedNSEC } from '../types/nostr'

const STORAGE_KEY = 'encrypted_nsec'

export function storeEncryptedNSEC(encrypted: EncryptedNSEC): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please free some space.')
    }
    throw error
  }
}

export function getEncryptedNSEC(): EncryptedNSEC | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }
    return JSON.parse(stored) as EncryptedNSEC
  } catch (error) {
    console.error('Error loading encrypted NSEC:', error)
    return null
  }
}

export function clearEncryptedNSEC(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasEncryptedNSEC(): boolean {
  return getEncryptedNSEC() !== null
}
