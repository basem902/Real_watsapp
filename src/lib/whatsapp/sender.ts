import { WasenderConfig, SendResult } from '@/types'

const DEFAULT_API_URL = 'https://www.wasenderapi.com'

function getHeaders(config: WasenderConfig): Record<string, string> {
  return {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    'X-Instance-ID': config.instanceId,
  }
}

export async function sendText(config: WasenderConfig, to: string, text: string): Promise<SendResult> {
  try {
    const url = `${config.apiUrl || DEFAULT_API_URL}/api/send-message`
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ to, text }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Send failed')
    return { success: true, messageId: data.id || data.messageId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function sendImage(config: WasenderConfig, to: string, mediaUrl: string, caption?: string): Promise<SendResult> {
  try {
    const url = `${config.apiUrl || DEFAULT_API_URL}/v1/messages/send-media`
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ to, mediaUrl, caption, mediaType: 'image' }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Send image failed')
    return { success: true, messageId: data.id || data.messageId }
  } catch (error: any) {
    return { success: false, error: error.message }
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
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ to, title, buttonText, sections }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Send list failed')
    return { success: true, messageId: data.id || data.messageId }
  } catch (error: any) {
    return { success: false, error: error.message }
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
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ to, message, buttons }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Send buttons failed')
    return { success: true, messageId: data.id || data.messageId }
  } catch (error: any) {
    return { success: false, error: error.message }
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
  } catch (error: any) {
    return { connected: false, message: error.message }
  }
}
