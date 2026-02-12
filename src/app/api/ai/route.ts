export const runtime = 'nodejs'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { processMessage } from '@/lib/ai/agent'
import { sendText, sendTyping } from '@/lib/whatsapp/sender'
import { rateLimit, RATE_LIMITS, rateLimitKey, rateLimitHeaders } from '@/lib/rate-limit'
import { OrgContext, WasenderConfig } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Verify internal API key
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.INTERNAL_API_KEY
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { org_id, instance_id, sender_number, sender_name, message_content, message_id, message_type } = body

    if (!org_id || !sender_number || !message_content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
    const wasenderConfig: WasenderConfig = {
      apiKey: integrations.wasender_api_key || process.env.WASENDER_API_KEY || '',
      instanceId: integrations.wasender_instance_id || process.env.WASENDER_INSTANCE_ID || '',
    }

    sendTyping(wasenderConfig, sender_number).catch(() => {})

    // Process with AI
    const result = await processMessage(
      orgContext,
      conversation.id,
      sender_number,
      sender_name,
      message_content,
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
      data: { toolsUsed: result.toolsUsed },
    })
  } catch (error) {
    console.error('[AI Route] Error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
