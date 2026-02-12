import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12  // GCM standard
const TAG_LENGTH = 16 // 128-bit auth tag

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY environment variable is required')
  if (key.length !== 64) throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a plaintext string
 * @returns Format: iv:authTag:cipherText (all base64)
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

/**
 * Decrypt a string encrypted with encrypt()
 * @param encryptedText Format: iv:authTag:cipherText (all base64)
 */
export function decrypt(encryptedText: string): string {
  const key = getKey()
  const parts = encryptedText.split(':')

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format')
  }

  const [ivB64, tagB64, cipherB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(tagB64, 'base64')
  const cipherText = Buffer.from(cipherB64, 'base64')

  if (iv.length !== IV_LENGTH) throw new Error('Invalid IV length')
  if (authTag.length !== TAG_LENGTH) throw new Error('Invalid auth tag length')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(cipherText)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString('utf8')
}

/**
 * Encrypt if value is truthy, return null otherwise
 */
export function encryptIfPresent(value: string | null | undefined): string | null {
  if (!value) return null
  return encrypt(value)
}

/**
 * Decrypt if value is truthy, return null otherwise
 */
export function decryptIfPresent(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    return decrypt(value)
  } catch {
    return null
  }
}
