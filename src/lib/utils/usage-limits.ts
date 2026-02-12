import { supabaseAdmin } from '@/lib/supabase/admin'

interface UsageLimitResult {
  allowed: boolean
  current: number
  limit: number
  message?: string
}

export async function checkPropertyLimit(orgId: string): Promise<UsageLimitResult> {
  // Get org settings for max_properties
  const { data: settings } = await supabaseAdmin
    .from('org_settings')
    .select('max_properties')
    .eq('organization_id', orgId)
    .single()

  if (!settings) return { allowed: true, current: 0, limit: 999 }

  // Count current active properties
  const { count } = await supabaseAdmin
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('is_deleted', false)

  const current = count || 0
  return {
    allowed: current < settings.max_properties,
    current,
    limit: settings.max_properties,
    message: current >= settings.max_properties ? `تم الوصول للحد الأقصى (${settings.max_properties} عقار)` : undefined,
  }
}

export async function checkConversationLimit(orgId: string): Promise<UsageLimitResult> {
  // Get org settings for max_conversations_per_month
  const { data: settings } = await supabaseAdmin
    .from('org_settings')
    .select('max_conversations_per_month')
    .eq('organization_id', orgId)
    .single()

  if (!settings) return { allowed: true, current: 0, limit: 999 }

  // Count conversations this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabaseAdmin
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .gte('created_at', startOfMonth.toISOString())

  const current = count || 0
  return {
    allowed: current < settings.max_conversations_per_month,
    current,
    limit: settings.max_conversations_per_month,
    message: current >= settings.max_conversations_per_month ? `تم الوصول للحد الأقصى (${settings.max_conversations_per_month} محادثة/شهر)` : undefined,
  }
}

export async function checkTeamLimit(orgId: string): Promise<UsageLimitResult> {
  // Get org settings for max_team_members
  const { data: settings } = await supabaseAdmin
    .from('org_settings')
    .select('max_team_members')
    .eq('organization_id', orgId)
    .single()

  if (!settings) return { allowed: true, current: 0, limit: 999 }

  // Count active members
  const { count } = await supabaseAdmin
    .from('org_members')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('is_active', true)

  const current = count || 0
  return {
    allowed: current < settings.max_team_members,
    current,
    limit: settings.max_team_members,
    message: current >= settings.max_team_members ? `تم الوصول للحد الأقصى (${settings.max_team_members} عضو)` : undefined,
  }
}
