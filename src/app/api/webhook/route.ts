export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, verifyWebhookToken } from '@/lib/whatsapp/validator'
import { parseIncomingMessage, extractInstanceId } from '@/lib/whatsapp/parser'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { rateLimit, RATE_LIMITS, rateLimitKey, rateLimitHeaders } from '@/lib/rate-limit'
import { triggerAIProcessing } from '@/lib/queue/processor'
import { checkConversationLimit } from '@/lib/utils/usage-limits'
import type { WasenderConfig } from '@/types'

// GET — Wasender webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (token && verifyWebhookToken(token) && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// POST — Incoming message from Wasender
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(rateLimitKey('webhook', ip), RATE_LIMITS.webhook)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429, headers: rateLimitHeaders(rl) })
    }

    // Read raw body for signature verification
    const rawBody = await request.text()

    // Verify signature if secret is configured
    const signature = request.headers.get('x-wasender-signature') || ''
    // Parse body
    let body: unknown
    try { body = JSON.parse(rawBody) } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    // Extract instance ID
    const instanceId = extractInstanceId(body)
    if (!instanceId) {
      // Try using default instance
      const defaultInstanceId = process.env.WASENDER_INSTANCE_ID
      if (!defaultInstanceId) return NextResponse.json({ received: true }) // can't route
    }

    const effectiveInstanceId = instanceId || process.env.WASENDER_INSTANCE_ID!

    // Look up organization by instance ID
    const { data: orgData } = await supabaseAdmin
      .from('org_integrations')
      .select('organization_id, wasender_api_key, wasender_instance_id, wasender_webhook_secret')
      .eq('wasender_instance_id', effectiveInstanceId)
      .single()

    if (!orgData) {
      // Check if it matches default env
      if (effectiveInstanceId !== process.env.WASENDER_INSTANCE_ID) {
        return NextResponse.json({ received: true })
      }
    }

    const orgId = orgData?.organization_id || process.env.DEFAULT_ORG_ID
    if (!orgId) return NextResponse.json({ received: true })

    // Check org is active or in trial period
    const { data: orgCheck } = await supabaseAdmin
      .from('organizations')
      .select('status, trial_ends_at')
      .eq('id', orgId)
      .single()
    if (!orgCheck || !['active', 'trial'].includes(orgCheck.status)) {
      return NextResponse.json({ received: true })
    }
    if (orgCheck.status === 'trial' && orgCheck.trial_ends_at) {
      if (new Date(orgCheck.trial_ends_at) <= new Date()) {
        return NextResponse.json({ received: true })
      }
    }

    // Verify signature with org-specific or default secret
    const secret = orgData?.wasender_webhook_secret || process.env.WASENDER_WEBHOOK_SECRET || ''
    if (secret && signature) {
      if (!verifyWebhookSignature(rawBody, signature, secret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Parse message
    const parsed = parseIncomingMessage(body)
    if (!parsed) return NextResponse.json({ received: true }) // not a message we can process

    // AI3: Prevent bot-to-bot loop — skip messages from the bot itself
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyAny = body as any
    const fromMe = bodyAny?.data?.key?.fromMe
      || bodyAny?.data?.data?.messages?.[0]?.key?.fromMe
    if (fromMe) return NextResponse.json({ received: true })

    // Skip empty or status messages
    if (!parsed.content || parsed.content.trim().length === 0) {
      return NextResponse.json({ received: true })
    }

    // Check for duplicate (idempotency)
    if (parsed.messageId) {
      const { data: existing } = await supabaseAdmin
        .from('messages')
        .select('id')
        .eq('wasender_message_id', parsed.messageId)
        .single()
      if (existing) return NextResponse.json({ received: true }) // already processed
    }

    // Get or create conversation
    let { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('id, bot_enabled, status')
      .eq('organization_id', orgId)
      .eq('whatsapp_number', parsed.senderNumber)
      .in('status', ['نشطة', 'تحتاج_متابعة'])
      .single()

    if (!conversation) {
      const convLimit = await checkConversationLimit(orgId)
      if (!convLimit.allowed) {
        return NextResponse.json({ received: true })
      }

      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({
          organization_id: orgId,
          whatsapp_number: parsed.senderNumber,
          customer_name: parsed.senderName || null,
          status: 'نشطة',
          bot_enabled: true,
          last_message_at: new Date().toISOString(),
        })
        .select('id, bot_enabled, status')
        .single()
      conversation = newConv
    } else {
      // Update last_message_at and customer name if we have it now
      await supabaseAdmin
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          ...(parsed.senderName && !conversation.status ? {} : {}),
        })
        .eq('id', conversation.id)
    }

    if (!conversation) return NextResponse.json({ received: true })

    // Save incoming message
    await supabaseAdmin.from('messages').insert({
      organization_id: orgId,
      conversation_id: conversation.id,
      sender: 'customer',
      content: parsed.content || '',
      message_type: parsed.messageType === 'interactive' ? 'text' : (parsed.messageType === 'unknown' ? 'text' : parsed.messageType) as 'text' | 'image' | 'location' | 'document',
      wasender_message_id: parsed.messageId || null,
    })

    // If bot is disabled, skip AI processing
    if (!conversation.bot_enabled) return NextResponse.json({ received: true })

    // Get org settings
    const { data: orgSettings } = await supabaseAdmin
      .from('org_settings')
      .select('bot_enabled')
      .eq('organization_id', orgId)
      .single()

    if (!orgSettings?.bot_enabled) return NextResponse.json({ received: true })

    // Trigger AI processing (fire-and-forget with 2s timeout)
    triggerAIProcessing({
      org_id: orgId,
      instance_id: effectiveInstanceId,
      sender_number: parsed.senderNumber,
      sender_name: parsed.senderName || '',
      message_content: parsed.content || '',
      message_id: parsed.messageId || '',
      message_type: parsed.messageType,
    }).catch(err => console.error('[Webhook] AI trigger error:', err))

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json({ received: true }) // Always 200 to prevent retries
  }
}
