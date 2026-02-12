export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { apiSuccess, apiError } from '@/lib/utils/api-response'
import { inviteRegisterSchema } from '@/lib/utils/validators'
import { notifyCompanyOwner } from '@/lib/notifications/sender'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = inviteRegisterSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'بيانات غير صالحة', { status: 400 })
    }

    const { fullName, email, password, invite_code } = parsed.data

    // ===== Validate invite code =====
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('org_invitations')
      .select('*')
      .eq('invite_code', invite_code)
      .eq('is_active', true)
      .single()

    if (invError || !invitation) {
      return apiError('رمز الدعوة غير صالح أو غير فعال', { status: 400 })
    }

    // Check expiration
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return apiError('انتهت صلاحية رمز الدعوة', { status: 400 })
    }

    // Check max uses
    if (invitation.max_uses !== null && invitation.used_count >= invitation.max_uses) {
      return apiError('تم استخدام الحد الأقصى لهذا الرابط', { status: 400 })
    }

    // Get organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, status, invite_approval_required')
      .eq('id', invitation.organization_id)
      .single()

    if (orgError || !org) {
      return apiError('المنظمة غير موجودة', { status: 400 })
    }

    if (!['trial', 'active'].includes(org.status)) {
      return apiError('المنظمة غير مفعلة حالياً', { status: 400 })
    }

    // ===== Create auth user =====
    const { data: newAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        organization_id: org.id,
        role: invitation.default_role,
      },
    })

    if (createError || !newAuth?.user) {
      if (createError?.message?.includes('already been registered') || createError?.message?.includes('already exists')) {
        return apiError('البريد الإلكتروني مسجل بالفعل. قم بتسجيل الدخول بدلاً من ذلك.', { status: 409 })
      }
      return apiError(createError?.message || 'فشل إنشاء الحساب', { status: 500 })
    }

    const userId = newAuth.user.id
    let status: 'joined' | 'pending_approval' = 'joined'

    try {
      if (org.invite_approval_required) {
        // ===== Approval required: create pending member =====
        const { error: pendingError } = await supabaseAdmin
          .from('pending_members')
          .insert({
            organization_id: org.id,
            user_id: userId,
            invite_id: invitation.id,
            display_name: fullName,
            status: 'pending',
            requested_at: new Date().toISOString(),
          })

        if (pendingError) throw pendingError
        status = 'pending_approval'
      } else {
        // ===== Auto-join: create org_member directly =====
        const { error: memberError } = await supabaseAdmin
          .from('org_members')
          .insert({
            organization_id: org.id,
            user_id: userId,
            role: invitation.default_role,
            display_name: fullName,
            is_active: true,
          })

        if (memberError) throw memberError
        status = 'joined'
      }

      // ===== Increment used_count =====
      await supabaseAdmin
        .from('org_invitations')
        .update({ used_count: invitation.used_count + 1 })
        .eq('id', invitation.id)

      // Notify company owner about new member (fire and forget)
      if (status === 'joined') {
        notifyCompanyOwner(org.id, {
          event: 'new_member_joined',
          orgId: org.id,
          orgName: org.name,
          memberName: fullName,
        }).catch(() => {})
      }

      return apiSuccess({ data: { status } })
    } catch (innerError) {
      // ===== Rollback: delete auth user on failure =====
      await supabaseAdmin.auth.admin.deleteUser(userId)
      const errMsg = innerError instanceof Error ? innerError.message : 'فشل في إتمام التسجيل'
      return apiError(errMsg, { status: 500 })
    }
  } catch {
    return apiError('Server error', { status: 500 })
  }
}
