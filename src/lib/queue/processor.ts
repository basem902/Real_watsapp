import { AIProcessingPayload } from '@/types'

const MAX_MESSAGE_LENGTH = 4000 // Prevent token overflow from huge messages

export async function triggerAIProcessing(payload: AIProcessingPayload): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2000) // 2 second timeout

  // AI7: Truncate oversized messages to prevent token overflow
  if (payload.message_content && payload.message_content.length > MAX_MESSAGE_LENGTH) {
    payload.message_content = payload.message_content.slice(0, MAX_MESSAGE_LENGTH) + '...'
  }

  try {
    // AI6: Use server-side only URL (not NEXT_PUBLIC_ which is exposed to client)
    const baseUrl = process.env.APP_INTERNAL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // S2: Fixed — was 'X-Internal-Key', AI route expects 'Authorization: Bearer ...'
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || ''}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      console.error('[Queue] AI processing failed:', response.status)
    }
  } catch (error: unknown) {
    const err = error as Error
    if (err.name === 'AbortError') {
      // Timeout is expected — AI processing continues server-side
      console.log('[Queue] AI processing triggered (fire-and-forget)')
    } else {
      console.error('[Queue] AI trigger error:', err.message)
    }
  } finally {
    clearTimeout(timeout)
  }
}
