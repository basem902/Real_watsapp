export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkTeamLimit } from '@/lib/utils/usage-limits'
import { apiSuccess, apiError } from '@/lib/utils/api-response'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('Unauthorized', { status: 401 })

    const { data: member } = await supabaseAdmin.from('org_members').select('organization_id').eq('user_id', user.id).eq('is_active', true).single()
    if (!member) return apiError('Forbidden', { status: 403 })

    const { data, error } = await supabaseAdmin.from('org_members').select('*').eq('organization_id', member.organization_id).eq('is_active', true).order('created_at', { ascending: true })
    if (error) return apiError(error.message, { status: 500 })
    return apiSuccess({ data })
  } catch { return apiError('Server error', { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('Unauthorized', { status: 401 })

    const { data: member } = await supabaseAdmin.from('org_members').select('organization_id, role').eq('user_id', user.id).eq('is_active', true).single()
    if (!member || !['owner', 'admin'].includes(member.role)) return apiError('Insufficient permissions', { status: 403 })

    const usageCheck = await checkTeamLimit(member.organization_id)
    if (!usageCheck.allowed) {
      return apiError(usageCheck.message || 'Team limit reached', { status: 403 })
    }

    const body = await request.json()
    const { email, display_name, role } = body
    if (!email) return apiError('Email is required', { status: 400 })
    if (role === 'owner') return apiError('Cannot assign owner role', { status: 400 })

    // S5: Try to get user by email directly via admin getUserById workaround
    // Supabase admin doesn't have getUserByEmail, so we create user if not exists
    // and handle "already registered" error as a signal the user exists
    let userId: string
    let existingUser = false

    // Try creating the user first — if email exists, error tells us
    const tempPassword = crypto.randomBytes(16).toString('base64url') + 'A1!'
    const { data: newAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (newAuth?.user) {
      // New user created successfully
      userId = newAuth.user.id
    } else if (createError?.message?.includes('already been registered') || createError?.message?.includes('already exists')) {
      // User exists — find them via org_members or auth
      existingUser = true
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      const found = authUsers?.users?.find((u: { email?: string }) => u.email === email)
      if (!found) return apiError('User lookup failed', { status: 500 })
      userId = found.id
    } else {
      return apiError(createError?.message || 'Failed to create user', { status: 500 })
    }

    if (existingUser) {
      // Check if already a member of this org
      const { data: existingMember } = await supabaseAdmin.from('org_members').select('id, is_active').eq('user_id', userId).eq('organization_id', member.organization_id).single()
      if (existingMember?.is_active) return apiError('المستخدم عضو بالفعل', { status: 400 })
      if (existingMember) {
        // Reactivate inactive member
        await supabaseAdmin.from('org_members').update({ is_active: true, role: role || 'agent', display_name }).eq('id', existingMember.id)
        return apiSuccess()
      }
    }
    // New user was already created above, or existing user needs org_member record

    const { error: memberError } = await supabaseAdmin.from('org_members').insert({ organization_id: member.organization_id, user_id: userId, role: role || 'agent', display_name: display_name || email.split('@')[0] })
    if (memberError) return apiError(memberError.message, { status: 500 })

    await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { organization_id: member.organization_id, role: role || 'agent' } })
    return apiSuccess({ status: 201 })
  } catch { return apiError('Server error', { status: 500 }) }
}
