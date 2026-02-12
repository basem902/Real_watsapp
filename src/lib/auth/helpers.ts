import { createClient } from '@/lib/supabase/server'
import type { CurrentUser, OrgContext, Permission } from '@/types'
import { getPermissions, hasPermission } from './permissions'

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: orgMember } = await supabase
    .from('org_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!orgMember) return null

  return {
    user: { id: user.id, email: user.email! },
    orgId: orgMember.organization_id,
    orgMember,
    permissions: getPermissions(orgMember.role),
  }
}

export async function getCurrentOrg(orgId: string): Promise<OrgContext | null> {
  const supabase = createClient()

  const [{ data: settings }, { data: integrations }] = await Promise.all([
    supabase.from('org_settings').select('*').eq('organization_id', orgId).single(),
    supabase.from('org_integrations').select('*').eq('organization_id', orgId).single(),
  ])

  if (!settings || !integrations) return null

  return { organizationId: orgId, settings, integrations }
}

export function checkPermission(currentUser: CurrentUser, permission: Permission): boolean {
  return hasPermission(currentUser.orgMember.role, permission)
}
