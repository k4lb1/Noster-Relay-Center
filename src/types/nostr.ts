export interface NIP11Metadata {
  name?: string
  description?: string
  pubkey?: string
  contact?: string
  supported_nips?: number[]
  software?: string
  version?: string
  limitation?: {
    max_message_length?: number
    max_subscriptions?: number
    max_filters?: number
    max_limit?: number
    max_subid_length?: number
    min_prefix?: number
    max_event_tags?: number
    max_content_length?: number
    min_pow_difficulty?: number
    auth_required?: boolean
    payment_required?: boolean
    restricted_writes?: boolean
  }
  relay_countries?: string[]
  language_tags?: string[]
  tags?: string[]
  posting_policy?: string
  payments_url?: string
  fees?: {
    admission?: Array<{ amount: number; unit: string }>
    subscription?: Array<{ amount: number; unit: string }>
  }
}

export interface EncryptedNSEC {
  encrypted: string
  salt: string
  iv: string
}

export interface WhitelistEvent {
  kind: 25000
  content: string
  tags: string[][]
}
