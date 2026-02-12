// ═══════════════════════════════════════════════
// AI Tool Handlers — Execute tool calls against DB
// ═══════════════════════════════════════════════

import { supabaseAdmin } from '@/lib/supabase/admin'

interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

// ───── search_properties ─────

export async function handleSearchProperties(
  organizationId: string,
  args: {
    query?: string
    property_type?: string
    listing_type?: string
    min_price?: number
    max_price?: number
    bedrooms?: number
    city?: string
    district?: string
  },
): Promise<ToolResult> {
  // Try RPC search_properties first
  const { data, error } = await supabaseAdmin.rpc('search_properties', {
    p_org_id: organizationId,
    p_query: args.query || null,
    p_property_type: args.property_type || null,
    p_listing_type: args.listing_type || null,
    p_min_price: args.min_price || null,
    p_max_price: args.max_price || null,
    p_bedrooms: args.bedrooms || null,
    p_city: args.city || null,
    p_district: args.district || null,
    p_limit: 5,
    p_offset: 0,
  })

  if (error) {
    // Fallback to direct query
    let query = supabaseAdmin
      .from('properties')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_deleted', false)
      .eq('status', 'متاح')
      .limit(5)

    if (args.property_type) query = query.eq('property_type', args.property_type)
    if (args.listing_type) query = query.eq('listing_type', args.listing_type)
    if (args.min_price) query = query.gte('price', args.min_price)
    if (args.max_price) query = query.lte('price', args.max_price)
    if (args.bedrooms) query = query.eq('bedrooms', args.bedrooms)
    if (args.city) query = query.eq('city', args.city)
    if (args.district) query = query.eq('district', args.district)

    const { data: fallbackData, error: fallbackError } = await query
    if (fallbackError) return { success: false, error: fallbackError.message }
    return {
      success: true,
      data: { properties: fallbackData, total: fallbackData?.length || 0 },
    }
  }

  return {
    success: true,
    data: {
      properties: data,
      total: (data as Array<{ total_count?: number }>)?.[0]?.total_count || data?.length || 0,
    },
  }
}

// ───── get_property_details ─────

export async function handleGetPropertyDetails(
  organizationId: string,
  args: { property_id: string },
): Promise<ToolResult> {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('id', args.property_id)
    .eq('organization_id', organizationId)
    .eq('is_deleted', false)
    .single()

  if (error) return { success: false, error: 'العقار غير موجود' }

  // Increment views
  await supabaseAdmin
    .from('properties')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', args.property_id)

  return { success: true, data }
}

// ───── create_lead ─────

export async function handleCreateLead(
  organizationId: string,
  conversationId: string | null,
  args: {
    customer_name?: string
    phone: string
    budget_min?: number
    budget_max?: number
    preferred_area?: string
    notes?: string
  },
): Promise<ToolResult> {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert({
      organization_id: organizationId,
      conversation_id: conversationId,
      customer_name: args.customer_name,
      phone: args.phone,
      budget_min: args.budget_min,
      budget_max: args.budget_max,
      preferred_area: args.preferred_area,
      interested_in: args.notes,
      lead_source: 'whatsapp',
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Increment usage
  try {
    await supabaseAdmin.rpc('increment_usage', { p_org_id: organizationId, p_field: 'ai_calls_count' })
  } catch { /* ignore usage tracking errors */ }

  return { success: true, data }
}

// ───── schedule_appointment ─────

export async function handleScheduleAppointment(
  organizationId: string,
  args: {
    property_id: string
    preferred_date: string
    preferred_time: string
    customer_name?: string
    phone: string
  },
): Promise<ToolResult> {
  // Find or create lead
  let { data: lead } = await supabaseAdmin
    .from('leads')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('phone', args.phone)
    .single()

  if (!lead) {
    const { data: newLead } = await supabaseAdmin
      .from('leads')
      .insert({
        organization_id: organizationId,
        customer_name: args.customer_name,
        phone: args.phone,
        lead_source: 'whatsapp',
      })
      .select('id')
      .single()
    lead = newLead
  }

  const scheduledAt = `${args.preferred_date}T${args.preferred_time}:00+03:00`

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .insert({
      organization_id: organizationId,
      lead_id: lead?.id,
      property_id: args.property_id,
      scheduled_at: scheduledAt,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

// ───── escalate_to_human ─────

export async function handleEscalateToHuman(
  organizationId: string,
  conversationId: string,
  args: {
    reason: string
    urgency?: string
  },
): Promise<ToolResult> {
  // Disable bot for this conversation
  await supabaseAdmin
    .from('conversations')
    .update({ bot_enabled: false, status: 'تحتاج_متابعة' })
    .eq('id', conversationId)

  // Create notification
  await supabaseAdmin.from('notifications').insert({
    organization_id: organizationId,
    title: args.urgency === 'عاجل' ? '🔴 طلب تحويل عاجل' : '🟡 طلب تحويل للمستشار',
    body: args.reason,
    type: 'human_requested',
    reference_id: conversationId,
  })

  return { success: true, data: { escalated: true } }
}
