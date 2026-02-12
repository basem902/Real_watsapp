export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { apiSuccess, apiError } from '@/lib/utils/api-response'
import { inviteLinkSchema } from '@/lib/utils/validators'
import { randomBytes } from 'crypto'

async function getAuthMember(requiredRoles: string[] = ['owner', 'admin']) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabaseAdmin
    .from('org_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!member || !requiredRoles.includes(member.role)) return null
  return { user, member }
}

export async function GET() {
  try {
    const auth = await getAuthMember()
    if (!auth) return apiError('Unauthorized', { status: 401 })

    const { data, error } = await supabaseAdmin
      .from('org_invitations')
      .select('*')
      .eq('organization_id', auth.member.organization_id)
      .order('created_at', { ascending: false })

    if (error) return apiError(error.message, { status: 500 })
    return apiSuccess({ data })
  } catch {
    return apiError('Server error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthMember()
    if (!auth) return apiError('Unauthorized', { status: 401 })

    const body = await request.json()
    const parsed = inviteLinkSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'Invalid input', { status: 400 })
    }

    const { default_role, max_uses, expires_in_days } = parsed.data

    const invite_code = randomBytes(9).toString('base64url')

    let expires_at: string | null = null
    if (expires_in_days) {
      const d = new Date()
      d.setDate(d.getDate() + expires_in_days)
      expires_at = d.toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('org_invitations')
      .insert({
        organization_id: auth.member.organization_id,
        invite_code,
        created_by: auth.user.id,
        default_role,
        max_uses: max_uses ?? null,
        used_count: 0,
        expires_at,
        is_active: true,
      })
      .select()
      .single()

    if (error) return apiError(error.message, { status: 500 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://real-watsapp.vercel.app'
    const invite_url = `${baseUrl}/invite/${invite_code}`

    return apiSuccess({ data: { ...data, invite_url } })
  } catch {
    return apiError('Server error', { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthMember()
    if (!auth) return apiError('Unauthorized', { status: 401 })

    const body = await request.json()
    const { id } = body
    if (!id) return apiError('معرف الرابط مطلوب', { status: 400 })

    const { error } = await supabaseAdmin
      .from('org_invitations')
      .update({ is_active: false })
      .eq('id', id)
      .eq('organization_id', auth.member.organization_id)

    if (error) return apiError(error.message, { status: 500 })
    return apiSuccess({ data: { deactivated: true } })
  } catch {
    return apiError('Server error', { status: 500 })
  }
}
