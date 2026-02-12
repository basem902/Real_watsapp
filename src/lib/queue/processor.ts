import { AIProcessingPayload } from '@/types'

export async function triggerAIProcessing(payload: AIProcessingPayload): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2000) // 2 second timeout

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      console.error('[Queue] AI processing failed:', response.status)
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Timeout is expected — AI processing continues server-side
      console.log('[Queue] AI processing triggered (fire-and-forget)')
    } else {
      console.error('[Queue] AI trigger error:', error.message)
    }
  } finally {
    clearTimeout(timeout)
  }
}
