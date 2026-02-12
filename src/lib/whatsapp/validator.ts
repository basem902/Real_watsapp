import crypto from 'crypto'

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false

  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

  // Handle signature with or without prefix
  const sig = signature.startsWith('sha256=') ? signature.slice(7) : signature

  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(sig, 'hex'))
  } catch {
    return false
  }
}

export function verifyWebhookToken(token: string): boolean {
  const expectedToken = process.env.WASENDER_WEBHOOK_SECRET || ''
  if (!token || !expectedToken) return false
  // S4: Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))
  } catch {
    return false
  }
}
