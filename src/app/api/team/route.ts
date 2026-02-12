export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkTeamLimit } from '@/lib/utils/usage-limits'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: member } = await supabaseAdmin.from('org_members').select('organization_id').eq('user_id', user.id).eq('is_active', true).single()
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabaseAdmin.from('org_members').select('*').eq('organization_id', member.organization_id).eq('is_active', true).order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: member } = await supabaseAdmin.from('org_members').select('organization_id, role').eq('user_id', user.id).eq('is_active', true).single()
    if (!member || !['owner', 'admin'].includes(member.role)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const usageCheck = await checkTeamLimit(member.organization_id)
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 })
    }

    const body = await request.json()
    const { email, display_name, role } = body
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (role === 'owner') return NextResponse.json({ error: 'Cannot assign owner role' }, { status: 400 })

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = authUsers?.users?.find((u: { email?: string }) => u.email === email)

    let userId: string
    if (existingUser) {
      userId = existingUser.id
      const { data: existingMember } = await supabaseAdmin.from('org_members').select('id, is_active').eq('user_id', userId).eq('organization_id', member.organization_id).single()
      if (existingMember?.is_active) return NextResponse.json({ error: 'المستخدم عضو بالفعل' }, { status: 400 })
      if (existingMember) {
        await supabaseAdmin.from('org_members').update({ is_active: true, role: role || 'agent', display_name }).eq('id', existingMember.id)
        return NextResponse.json({ success: true })
      }
    } else {
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
      const { data: newAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({ email, password: tempPassword, email_confirm: true })
      if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })
      userId = newAuth.user.id
    }

    const { error: memberError } = await supabaseAdmin.from('org_members').insert({ organization_id: member.organization_id, user_id: userId, role: role || 'agent', display_name: display_name || email.split('@')[0] })
    if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 })

    await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { organization_id: member.organization_id, role: role || 'agent' } })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
