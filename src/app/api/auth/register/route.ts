export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { registerSchema } from '@/lib/utils/validators'
import { rateLimit, RATE_LIMITS, rateLimitKey, rateLimitHeaders } from '@/lib/rate-limit'
import { notifySuperAdmins } from '@/lib/notifications/sender'

function translateAuthError(message: string): string {
  if (message.includes('already been registered') || message.includes('already exists')) {
    return 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر'
  }
  if (message.includes('password') && message.includes('weak')) {
    return 'كلمة المرور ضعيفة. استخدم حروف وأرقام ورموز'
  }
  if (message.includes('email') && message.includes('invalid')) {
    return 'البريد الإلكتروني غير صالح'
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'تم تجاوز الحد المسموح. حاول مرة أخرى بعد دقائق'
  }
  return message
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rl = rateLimit(rateLimitKey('register', ip), RATE_LIMITS.register)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد المسموح. حاول مرة أخرى لاحقاً' },
        { status: 429, headers: rateLimitHeaders(rl) }
      )
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { organizationName, fullName, email, password, companyType } = parsed.data

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) {
      const translatedError = translateAuthError(authError.message)
      const status = authError.message.includes('already') ? 409 : 400
      return NextResponse.json({ success: false, error: translatedError }, { status })
    }
    const userId = authData.user.id

    try {
      // 2. Create organization with trial status (7 days)
      const slug = organizationName.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now().toString(36)
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 7)

      const { data: org, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
          name: organizationName,
          slug,
          status: 'trial',
          company_type: companyType,
          is_active: true,
          trial_ends_at: trialEndsAt.toISOString(),
        })
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

      // 5. Notify super admins about new registration
      notifySuperAdmins({
        event: 'new_company_registered',
        orgId: org.id,
        orgName: organizationName,
        companyType,
      }).catch(() => {}) // Fire and forget

      return NextResponse.json(
        { success: true, data: { userId, orgId: org.id, status: 'trial' } },
        { status: 201 }
      )
    } catch (innerError) {
      // Rollback: delete auth user on failure
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw innerError
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? translateAuthError(error.message) : 'فشل إنشاء الحساب. حاول مرة أخرى'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
