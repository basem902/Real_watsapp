export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { registerSchema } from '@/lib/utils/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { organizationName, fullName, email, password } = parsed.data

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) throw new Error(authError.message)
    const userId = authData.user.id

    try {
      // 2. Create organization
      const slug = organizationName.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now().toString(36)
      const { data: org, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({ name: organizationName, slug })
        .select()
        .single()
      if (orgError) throw orgError

      // 3. Create org_member
      const { error: memberError } = await supabaseAdmin
        .from('org_members')
        .insert({
          organization_id: org.id,
          user_id: userId,
          role: 'owner',
          display_name: fullName,
        })
      if (memberError) throw memberError

      // 4. Update user metadata
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { organization_id: org.id, role: 'owner' },
      })

      return NextResponse.json(
        { success: true, data: { userId, orgId: org.id } },
        { status: 201 }
      )
    } catch (innerError) {
      // Rollback: delete auth user on failure
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw innerError
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
