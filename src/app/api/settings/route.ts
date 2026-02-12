export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { encryptIfPresent } from '@/lib/utils/encryption'
import { apiSuccess, apiError } from '@/lib/utils/api-response'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('Unauthorized', { status: 401 })

    const { data: member } = await supabaseAdmin.from('org_members').select('organization_id, role').eq('user_id', user.id).eq('is_active', true).single()
    if (!member) return apiError('Forbidden', { status: 403 })

    const [settingsRes, integrationsRes, orgRes] = await Promise.all([
      supabaseAdmin.from('org_settings').select('*').eq('organization_id', member.organization_id).single(),
      supabaseAdmin.from('org_integrations').select('organization_id, wasender_instance_id, wasender_verified').eq('organization_id', member.organization_id).single(),
      supabaseAdmin.from('organizations').select('*').eq('id', member.organization_id).single(),
    ])
    return apiSuccess({ data: { organization: orgRes.data, settings: settingsRes.data, integrations: integrationsRes.data } })
  } catch { return apiError('Server error', { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('Unauthorized', { status: 401 })

    const { data: member } = await supabaseAdmin.from('org_members').select('organization_id, role').eq('user_id', user.id).eq('is_active', true).single()
    if (!member || !['owner', 'admin'].includes(member.role)) return apiError('Insufficient permissions', { status: 403 })

    const body = await request.json()
    if (body.integrations) {
      const { wasender_instance_id, wasender_api_key } = body.integrations
      const update: Record<string, unknown> = {}
      if (wasender_instance_id !== undefined) update.wasender_instance_id = wasender_instance_id
      if (wasender_api_key !== undefined) update.wasender_api_key = encryptIfPresent(wasender_api_key)
      if (Object.keys(update).length > 0) {
        const { error } = await supabaseAdmin.from('org_integrations').update(update).eq('organization_id', member.organization_id)
        if (error) return apiError(error.message, { status: 500 })
      }
    }
    return apiSuccess()
  } catch { return apiError('Server error', { status: 500 }) }
}
