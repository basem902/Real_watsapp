export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS, rateLimitKey, rateLimitHeaders } from '@/lib/rate-limit'
import { sendText } from '@/lib/whatsapp/sender'
import { WasenderConfig } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get org membership
    const { data: member } = await supabaseAdmin
      .from('org_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not a member of any organization' }, { status: 403 })
    }

    // Check permission (owner, admin, agent can send)
    if (!['owner', 'admin', 'agent'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Rate limit per user
    const rl = rateLimit(rateLimitKey('sendMessage', user.id), RATE_LIMITS.sendMessage)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429, headers: rateLimitHeaders(rl) })
    }

    const body = await request.json()
    const { conversation_id, content } = body

    if (!conversation_id || !content) {
      return NextResponse.json({ error: 'Missing conversation_id or content' }, { status: 400 })
    }

    // Verify conversation belongs to org
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('id, whatsapp_number, organization_id')
      .eq('id', conversation_id)
      .eq('organization_id', member.organization_id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get Wasender config
    const { data: integrations } = await supabaseAdmin
      .from('org_integrations')
      .select('wasender_api_key, wasender_instance_id')
      .eq('organization_id', member.organization_id)
      .single()

    const wasenderConfig: WasenderConfig = {
      apiKey: integrations?.wasender_api_key || process.env.WASENDER_API_KEY || '',
      instanceId: integrations?.wasender_instance_id || process.env.WASENDER_INSTANCE_ID || '',
    }

    // Send via Wasender
    const sendResult = await sendText(wasenderConfig, conversation.whatsapp_number, content)

    if (!sendResult.success) {
      return NextResponse.json({ error: sendResult.error || 'Failed to send' }, { status: 500 })
    }

    // Save message
    const { data: message, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        organization_id: member.organization_id,
        conversation_id,
        sender: 'agent',
        sender_user_id: user.id,
        content,
        message_type: 'text',
        wasender_message_id: sendResult.messageId || null,
      })
      .select()
      .single()

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }

    // Update conversation last_message_at
    await supabaseAdmin
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation_id)

    // Increment usage
    try {
      await supabaseAdmin.rpc('increment_usage', {
        p_org_id: member.organization_id,
        p_field: 'whatsapp_messages_sent',
      })
    } catch { /* ignore */ }

    return NextResponse.json({ success: true, data: message })
  } catch (error) {
    console.error('[Send Message] Error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
