import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function isSuperAdmin(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  return user.user_metadata?.is_super_admin === true
}

export async function requireSuperAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { authorized: false as const, user: null }
  if (user.user_metadata?.is_super_admin !== true) {
    return { authorized: false as const, user }
  }
  return { authorized: true as const, user }
}

/**
 * Get org status for middleware checks.
 * Uses supabaseAdmin to bypass RLS.
 */
export async function getOrgStatusForUser(userId: string): Promise<{
  orgId: string | null
  status: string | null
  trialEndsAt: string | null
} | null> {
  const { data: member } = await supabaseAdmin
    .from('org_members')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (!member) return null

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id, status, trial_ends_at')
    .eq('id', member.organization_id)
    .single()

  if (!org) return null

  return {
    orgId: org.id,
    status: org.status,
    trialEndsAt: org.trial_ends_at,
  }
}
