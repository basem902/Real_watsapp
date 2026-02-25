export const runtime = 'nodejs'
export const maxDuration = 10

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { processMessage } from '@/lib/ai/agent'
import { transcribeVoiceToText } from '@/lib/ai/transcription-agent'
import { sendText, sendTyping } from '@/lib/whatsapp/sender'
import { rateLimit, RATE_LIMITS, rateLimitKey, rateLimitHeaders } from '@/lib/rate-limit'
import { OrgContext, WasenderConfig } from '@/types'
import { decryptIfPresent } from '@/lib/utils/encryption'
import { reportOpsError } from '@/lib/monitoring/error-monitor'

export async function POST(request: NextRequest) {
  let orgIdForMonitoring: string | undefined
  try {
    // Verify internal API key (REQUIRED - reject if not configured)
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.INTERNAL_API_KEY
    if (!apiKey) {
      console.error('[AI Route] INTERNAL_API_KEY is not configured')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      org_id,
      instance_id,
      sender_number,
      sender_name,
      message_content,
      message_id,
      message_type,
      media_url,
    } = body as {
      org_id?: string
      instance_id?: string
      sender_number?: string
      sender_name?: string
      message_content?: string
      message_id?: string
      message_type?: string
      media_url?: string
    }
    orgIdForMonitoring = org_id

    const isAudioMessage = message_type === 'audio'
    if (!org_id || !sender_number || (!message_content && !isAudioMessage)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (isAudioMessage && !media_url) {
      return NextResponse.json({ error: 'Audio message requires media_url' }, { status: 400 })
    }

    // Rate limit per org
    const rl = rateLimit(rateLimitKey('ai', org_id), RATE_LIMITS.ai)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429, headers: rateLimitHeaders(rl) })
    }

    // Get org context
    const { data: settings } = await supabaseAdmin
      .from('org_settings')
      .select('*')
      .eq('organization_id', org_id)
      .single()

    const { data: integrations } = await supabaseAdmin
      .from('org_integrations')
      .select('*')
      .eq('organization_id', org_id)
      .single()

    if (!settings || !integrations) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const orgContext: OrgContext = {
      organizationId: org_id,
      settings,
      integrations,
    }

    // Find conversation
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('organization_id', org_id)
      .eq('whatsapp_number', sender_number)
      .in('status', ['نشطة', 'تحتاج_متابعة'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Send typing indicator
    const decryptedWasenderKey =
      decryptIfPresent(integrations.wasender_api_key) ||
      integrations.wasender_api_key ||
      process.env.WASENDER_API_KEY ||
      ''

    const wasenderConfig: WasenderConfig = {
      apiKey: decryptedWasenderKey,
      instanceId: integrations.wasender_instance_id || instance_id || process.env.WASENDER_INSTANCE_ID || '',
    }

    sendTyping(wasenderConfig, sender_number).catch(() => {})

    const effectiveMessageType = message_type || 'text'
    let effectiveMessageContent = message_content || ''
    const toolsUsedMeta: string[] = []

    if (isAudioMessage && media_url) {
      const decryptedOpenAIKey =
        decryptIfPresent(integrations.openai_api_key) ||
        integrations.openai_api_key ||
        process.env.OPENAI_API_KEY ||
        ''

      if (!decryptedOpenAIKey) {
        await sendText(wasenderConfig, sender_number, 'عذرًا، تعذر تفريغ الرسالة الصوتية الآن. أرسلها كنص من فضلك.')
        return NextResponse.json({ success: true, data: { toolsUsed: ['agent:وكيل تحويل الصوت إلى كتابة', 'transcription:missing_openai_key'] } })
      }

      try {
        const transcription = await transcribeVoiceToText({
          mediaUrl: media_url,
          openaiApiKey: decryptedOpenAIKey,
          wasenderApiKey: decryptedWasenderKey,
        })

        effectiveMessageContent = transcription.text
        toolsUsedMeta.push('agent:وكيل تحويل الصوت إلى كتابة')
        toolsUsedMeta.push(`transcription:model:${transcription.modelUsed}`)

        // Replace placeholder content with transcript so conversation history stays useful.
        if (message_id) {
          await supabaseAdmin
            .from('messages')
            .update({ content: transcription.text })
            .eq('conversation_id', conversation.id)
            .eq('wasender_message_id', message_id)
            .eq('sender', 'customer')
        }
      } catch (err) {
        console.error('[AI Route] Voice transcription failed:', err)
        reportOpsError({
          organizationId: orgIdForMonitoring,
          source: 'api:ai:transcription',
          message: err instanceof Error ? err.message : 'Voice transcription failed',
          metadata: { conversationId: conversation.id, sender: sender_number },
        }).catch(() => {})
        await sendText(
          wasenderConfig,
          sender_number,
          'ما قدرت أوضح الرسالة الصوتية بشكل كافي. أرسلها كتابة أو سجل رسالة أوضح، وبخدمتك فورًا.',
        )
        return NextResponse.json({
          success: true,
          data: { toolsUsed: ['agent:وكيل تحويل الصوت إلى كتابة', 'transcription:failed'] },
        })
      }
    }

    // Process with AI
    const result = await processMessage(
      orgContext,
      conversation.id,
      sender_number,
      sender_name || '',
      effectiveMessageContent,
      { messageType: effectiveMessageType },
    )

    if (result.response) {
      // Save bot message
      await supabaseAdmin.from('messages').insert({
        organization_id: org_id,
        conversation_id: conversation.id,
        sender: 'bot',
        content: result.response,
        message_type: 'text',
      })

      // Send via Wasender
      const sendResult = await sendText(wasenderConfig, sender_number, result.response)
      if (!sendResult.success) {
        console.error('[AI Route] Failed to send message:', sendResult.error)
      }
    }

    return NextResponse.json({
      success: true,
      data: { toolsUsed: [...toolsUsedMeta, ...result.toolsUsed] },
    })
  } catch (error) {
    console.error('[AI Route] Error:', error)
    reportOpsError({
      organizationId: orgIdForMonitoring,
      source: 'api:ai',
      message: error instanceof Error ? error.message : 'AI route failed',
      metadata: { route: '/api/ai' },
    }).catch(() => {})
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
