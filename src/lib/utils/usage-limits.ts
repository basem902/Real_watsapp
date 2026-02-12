import { supabaseAdmin } from '@/lib/supabase/admin'

interface UsageLimitResult {
  allowed: boolean
  current: number
  limit: number
  message?: string
}

// DB1: Run settings + count in parallel to minimize TOCTOU race window.
// For true atomicity, use DB-level CHECK constraints or RPC functions.

export async function checkPropertyLimit(orgId: string): Promise<UsageLimitResult> {
  const [settingsResult, countResult] = await Promise.all([
    supabaseAdmin
      .from('org_settings')
      .select('max_properties')
      .eq('organization_id', orgId)
      .single(),
    supabaseAdmin
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_deleted', false),
  ])

  const settings = settingsResult.data
  if (!settings) return { allowed: true, current: 0, limit: 999 }

  const current = countResult.count || 0
  const maxLimit = settings.max_properties
  return {
    allowed: current < maxLimit,
    current,
    limit: maxLimit,
    message: current >= maxLimit ? `تم الوصول للحد الأقصى (${maxLimit} عقار)` : undefined,
  }
}

export async function checkConversationLimit(orgId: string): Promise<UsageLimitResult> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [settingsResult, countResult] = await Promise.all([
    supabaseAdmin
      .from('org_settings')
      .select('max_conversations_per_month')
      .eq('organization_id', orgId)
      .single(),
    supabaseAdmin
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', startOfMonth.toISOString()),
  ])

  const settings = settingsResult.data
  if (!settings) return { allowed: true, current: 0, limit: 999 }

  const current = countResult.count || 0
  const maxLimit = settings.max_conversations_per_month
  return {
    allowed: current < maxLimit,
    current,
    limit: maxLimit,
    message: current >= maxLimit ? `تم الوصول للحد الأقصى (${maxLimit} محادثة/شهر)` : undefined,
  }
}

export async function checkTeamLimit(orgId: string): Promise<UsageLimitResult> {
  const [settingsResult, countResult] = await Promise.all([
    supabaseAdmin
      .from('org_settings')
      .select('max_team_members')
      .eq('organization_id', orgId)
      .single(),
    supabaseAdmin
      .from('org_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_active', true),
  ])

  const settings = settingsResult.data
  if (!settings) return { allowed: true, current: 0, limit: 999 }

  const current = countResult.count || 0
  const maxLimit = settings.max_team_members
  return {
    allowed: current < maxLimit,
    current,
    limit: maxLimit,
    message: current >= maxLimit ? `تم الوصول للحد الأقصى (${maxLimit} عضو)` : undefined,
  }
}
