import { WasenderConfig, SendResult } from '@/types'

const DEFAULT_API_URL = 'https://www.wasenderapi.com'
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000

function getHeaders(config: WasenderConfig): Record<string, string> {
  return {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    'X-Instance-ID': config.instanceId,
  }
}

// AI5: Retry logic for transient failures (5xx, 429, network errors)
async function fetchWithRetry(url: string, options: RequestInit, retries: number = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options)
      if ((res.status >= 500 || res.status === 429) && attempt < retries) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)))
        continue
      }
      return res
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

export async function sendText(config: WasenderConfig, to: string, text: string): Promise<SendResult> {
  try {
    const url = `${config.apiUrl || DEFAULT_API_URL}/api/send-message`
    const res = await fetchWithRetry(url, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ to, text }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Send failed')
    return { success: true, messageId: data.id || data.messageId }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Wasender] sendText failed to ${to}:`, msg)
    return { success: false, error: msg }
  }
}

export async function sendImage(config: WasenderConfig, to: string, mediaUrl: string, caption?: string): Promise<SendResult> {
  try {
    const url = `${config.apiUrl || DEFAULT_API_URL}/v1/messages/send-media`
    const res = await fetchWithRetry(url, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ to, mediaUrl, caption, mediaType: 'image' }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Send image failed')
    return { success: true, messageId: data.id || data.messageId }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Wasender] sendImage failed to ${to}:`, msg)
    return { success: false, error: msg }
  }
}

export async function sendList(
  config: WasenderConfig,
  to: string,
  title: string,
  buttonText: string,
  sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>
): Promise<SendResult> {
  try {
    const url = `${config.apiUrl || DEFAULT_API_URL}/v1/messages/send-list`
    const res = await fetchWithRetry(url, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ to, title, buttonText, sections }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Send list failed')
    return { success: true, messageId: data.id || data.messageId }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: msg }
  }
}

export async function sendButtons(
  config: WasenderConfig,
  to: string,
  message: string,
  buttons: Array<{ id: string; title: string }>
): Promise<SendResult> {
  try {
    const url = `${config.apiUrl || DEFAULT_API_URL}/v1/messages/send-buttons`
    const res = await fetchWithRetry(url, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ to, message, buttons }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Send buttons failed')
    return { success: true, messageId: data.id || data.messageId }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: msg }
  }
}

export async function sendTyping(config: WasenderConfig, to: string): Promise<void> {
  try {
    const url = `${config.apiUrl || DEFAULT_API_URL}/v1/messages/send-typing`
    await fetch(url, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ to }),
    })
  } catch {
    // Typing indicator is best-effort
  }
}

export async function getConnectionStatus(config: WasenderConfig): Promise<{ connected: boolean; message?: string }> {
  try {
    const url = `${config.apiUrl || DEFAULT_API_URL}/api/sessions/${config.instanceId}`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${config.apiKey}` },
    })
    const data = await res.json()
    return { connected: data.connected ?? data.status === 'connected', message: data.message }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, message: msg }
  }
}
