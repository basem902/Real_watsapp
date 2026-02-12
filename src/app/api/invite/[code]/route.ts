export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { apiSuccess, apiError } from '@/lib/utils/api-response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    if (!code || code.length < 8) {
      return apiError('رمز الدعوة غير صالح', { status: 400 })
    }

    const { data: invitation, error } = await supabaseAdmin
      .from('org_invitations')
      .select('*')
      .eq('invite_code', code)
      .eq('is_active', true)
      .single()

    if (error || !invitation) {
      return apiSuccess({
        data: { invite_valid: false, reason: 'رمز الدعوة غير موجود أو غير فعال' },
      })
    }

    // Check expiration
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return apiSuccess({
        data: { invite_valid: false, reason: 'انتهت صلاحية رمز الدعوة' },
      })
    }

    // Check max uses
    if (invitation.max_uses !== null && invitation.used_count >= invitation.max_uses) {
      return apiSuccess({
        data: { invite_valid: false, reason: 'تم استخدام الحد الأقصى لهذا الرابط' },
      })
    }

    // Get organization info
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, company_type, status')
      .eq('id', invitation.organization_id)
      .single()

    if (orgError || !org) {
      return apiSuccess({
        data: { invite_valid: false, reason: 'المنظمة غير موجودة' },
      })
    }

    // Check org status
    if (!['trial', 'active'].includes(org.status)) {
      return apiSuccess({
        data: { invite_valid: false, reason: 'المنظمة غير مفعلة حالياً' },
      })
    }

    return apiSuccess({
      data: {
        invite_valid: true,
        org_name: org.name,
        company_type: org.company_type,
        default_role: invitation.default_role,
      },
    })
  } catch {
    return apiError('Server error', { status: 500 })
  }
}
