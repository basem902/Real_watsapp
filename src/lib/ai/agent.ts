// ═══════════════════════════════════════════════
// Main AI Agent — Process WhatsApp messages via OpenAI
// ═══════════════════════════════════════════════

import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { OrgContext } from '@/types'
import { AI_TOOLS } from './tools'
import { buildSystemPrompt } from './prompts'
import { normalizeSearchArgs } from './mapper'
import {
  handleSearchProperties,
  handleGetPropertyDetails,
  handleCreateLead,
  handleScheduleAppointment,
  handleEscalateToHuman,
} from './tool-handlers'

interface ProcessResult {
  response: string
  toolsUsed: string[]
}

export async function processMessage(
  orgContext: OrgContext,
  conversationId: string,
  senderNumber: string,
  senderName: string,
  messageContent: string,
): Promise<ProcessResult> {
  const { organizationId, settings, integrations } = orgContext

  // 1. Check bot enabled
  if (!settings.bot_enabled) {
    return { response: '', toolsUsed: [] }
  }

  // AI2: Enforce working hours in code (not just prompt)
  if (settings.working_hours_start && settings.working_hours_end) {
    const now = new Date()
    // Use Saudi Arabia timezone (UTC+3)
    const saTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }))
    const currentMinutes = saTime.getHours() * 60 + saTime.getMinutes()
    const [startH, startM] = settings.working_hours_start.split(':').map(Number)
    const [endH, endM] = settings.working_hours_end.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      return {
        response: `عذراً، نحن خارج أوقات العمل حالياً. ساعات العمل من ${settings.working_hours_start} إلى ${settings.working_hours_end}. سنرد عليك في أقرب وقت ممكن. 🕐`,
        toolsUsed: [],
      }
    }
  }

  // 2. Fetch last 15 messages for context
  const { data: history } = await supabaseAdmin
    .from('messages')
    .select('sender, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(15)

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt(settings) },
  ]

  // Add history (reversed to chronological order)
  if (history) {
    for (const msg of [...history].reverse()) {
      messages.push({
        role: msg.sender === 'customer' ? 'user' : 'assistant',
        content: msg.content,
      })
    }
  }

  // Add current message
  messages.push({ role: 'user', content: messageContent })

  // 3. Create OpenAI client
  const apiKey = integrations.openai_api_key || process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      response: 'عذراً، الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً.',
      toolsUsed: [],
    }
  }

  const openai = new OpenAI({ apiKey })

  // 4. Tool call loop (max 3 iterations)
  const toolsUsed: string[] = []
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)

  try {
    for (let i = 0; i < 3; i++) {
      const completion = await openai.chat.completions.create(
        {
          model: settings.ai_model || 'gpt-4o-mini',
          temperature: settings.ai_temperature || 0.7,
          max_tokens: settings.max_ai_tokens || 1000,
          messages,
          tools: AI_TOOLS as OpenAI.ChatCompletionTool[],
          tool_choice: 'auto',
        },
        { signal: controller.signal },
      )

      const choice = completion.choices[0]
      if (!choice) break

      // If no tool calls, return the response
      if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
        const responseText = choice.message.content || ''

        // Increment usage
        try {
          await supabaseAdmin.rpc('increment_usage', {
            p_org_id: organizationId,
            p_field: 'ai_calls_count',
          })
        } catch { /* ignore usage tracking errors */ }

        return { response: responseText, toolsUsed }
      }

      // Process tool calls
      messages.push(choice.message)

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type !== 'function') continue
        const funcName = toolCall.function.name
        let args = JSON.parse(toolCall.function.arguments)
        toolsUsed.push(funcName)

        // Normalize Arabic inputs for search
        if (funcName === 'search_properties') {
          args = normalizeSearchArgs(args)
        }

        let result: { success: boolean; data?: unknown; error?: string }
        switch (funcName) {
          case 'search_properties':
            result = await handleSearchProperties(organizationId, args)
            break
          case 'get_property_details':
            result = await handleGetPropertyDetails(organizationId, args)
            break
          case 'create_lead':
            result = await handleCreateLead(organizationId, conversationId, args)
            break
          case 'schedule_appointment':
            result = await handleScheduleAppointment(organizationId, args)
            break
          case 'escalate_to_human':
            result = await handleEscalateToHuman(organizationId, conversationId, args)
            break
          default:
            result = { success: false, error: 'Unknown tool' }
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        })
      }
    }

    // If we exhausted iterations, get final response
    const finalCompletion = await openai.chat.completions.create(
      {
        model: settings.ai_model || 'gpt-4o-mini',
        messages,
        max_tokens: settings.max_ai_tokens || 1000,
      },
      { signal: controller.signal },
    )

    return {
      response: finalCompletion.choices[0]?.message.content || 'عذراً، لم أتمكن من معالجة طلبك.',
      toolsUsed,
    }
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string }
    if (err.name === 'AbortError') {
      return {
        response: 'عذراً، استغرقت العملية وقتاً طويلاً. يرجى المحاولة مرة أخرى.',
        toolsUsed,
      }
    }
    console.error('[AI Agent] Error:', err.message)
    return {
      response: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
      toolsUsed,
    }
  } finally {
    clearTimeout(timeout)
  }
}
