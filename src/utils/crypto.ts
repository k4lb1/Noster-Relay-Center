import type { EncryptedNSEC } from '../types/nostr'

const PBKDF2_ITERATIONS = 100000
const KEY_LENGTH = 256
const IV_LENGTH = 12
const SALT_LENGTH = 16

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const pinBuffer = encoder.encode(pin)
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  )
}

function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}

function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH))
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer as ArrayBuffer
}

export async function encryptNSEC(nsec: string, pin: string): Promise<EncryptedNSEC> {
  if (!nsec || !pin) {
    throw new Error('NSEC and PIN are required')
  }
  
  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    throw new Error('PIN must be exactly 6 digits')
  }
  
  const encoder = new TextEncoder()
  const data = encoder.encode(nsec)
  
  const salt = generateSalt()
  const iv = generateIV()
  const key = await deriveKey(pin, salt)
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource
    },
    key,
    data
  )
  
  return {
    encrypted: arrayBufferToBase64(encrypted as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer)
  }
}

export async function decryptNSEC(encrypted: EncryptedNSEC, pin: string): Promise<string> {
  if (!encrypted || !pin) {
    throw new Error('Encrypted NSEC and PIN are required')
  }
  
  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    throw new Error('PIN must be exactly 6 digits')
  }
  
  try {
    const salt = new Uint8Array(base64ToArrayBuffer(encrypted.salt))
    const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv))
    const encryptedData = base64ToArrayBuffer(encrypted.encrypted)
    
    const key = await deriveKey(pin, salt)
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedData
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    throw new Error('Decryption failed. Wrong PIN or corrupted data.')
  }
}
