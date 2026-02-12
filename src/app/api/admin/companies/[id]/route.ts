export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/super-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { apiSuccess, apiError } from '@/lib/utils/api-response'
import { adminCompanyActionSchema } from '@/lib/utils/validators'
import { notifyCompanyOwner } from '@/lib/notifications/sender'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireSuperAdmin()
  if (!authorized) return apiError('غير مصرح', { status: 403 })

  try {
    const { id } = await params

    // Fetch organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (orgError || !org) {
      return apiError('الشركة غير موجودة', { status: 404 })
    }

    // Fetch members
    const { data: members } = await supabaseAdmin
      .from('org_members')
      .select('id, user_id, display_name, role, is_active, created_at')
      .eq('organization_id', id)
      .order('created_at', { ascending: true })

    // Fetch stats
    const [propertiesResult, conversationsResult, leadsResult] = await Promise.all([
      supabaseAdmin
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', id)
        .eq('is_deleted', false),
      supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', id),
      supabaseAdmin
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', id),
    ])

    return apiSuccess({
      data: {
        ...org,
        members: members || [],
        stats: {
          properties_count: propertiesResult.count || 0,
          conversations_count: conversationsResult.count || 0,
          leads_count: leadsResult.count || 0,
        },
      },
    })
  } catch (error) {
    console.error('Admin company detail error:', error)
    return apiError('فشل في تحميل بيانات الشركة', { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, user } = await requireSuperAdmin()
  if (!authorized) return apiError('غير مصرح', { status: 403 })

  try {
    const { id } = await params
    const body = await request.json()

    // Validate request body
    const parsed = adminCompanyActionSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('بيانات غير صالحة', { status: 400 })
    }

    const { action, rejection_reason } = parsed.data

    // Verify org exists
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, status')
      .eq('id', id)
      .single()

    if (orgError || !org) {
      return apiError('الشركة غير موجودة', { status: 404 })
    }

    let updateData: Record<string, unknown> = {}

    switch (action) {
      case 'approve':
        if (org.status !== 'pending' && org.status !== 'trial') {
          return apiError('لا يمكن قبول شركة ليست في حالة معلقة أو تجريبية', { status: 400 })
        }
        updateData = {
          status: 'active',
          is_active: true,
          approved_at: new Date().toISOString(),
          approved_by: user!.id,
          rejection_reason: null,
          updated_at: new Date().toISOString(),
        }
        break

      case 'reject':
        if (org.status !== 'pending' && org.status !== 'trial') {
          return apiError('لا يمكن رفض شركة ليست في حالة معلقة أو تجريبية', { status: 400 })
        }
        if (!rejection_reason?.trim()) {
          return apiError('سبب الرفض مطلوب', { status: 400 })
        }
        updateData = {
          status: 'rejected',
          is_active: false,
          rejection_reason: rejection_reason.trim(),
          updated_at: new Date().toISOString(),
        }
        break

      case 'suspend':
        if (org.status !== 'active') {
          return apiError('لا يمكن إيقاف شركة غير نشطة', { status: 400 })
        }
        updateData = {
          status: 'suspended',
          is_active: false,
          updated_at: new Date().toISOString(),
        }
        break

      case 'reactivate':
        if (org.status !== 'suspended') {
          return apiError('لا يمكن إعادة تفعيل شركة غير موقوفة', { status: 400 })
        }
        updateData = {
          status: 'active',
          is_active: true,
          updated_at: new Date().toISOString(),
        }
        break

      default:
        return apiError('إجراء غير معروف', { status: 400 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('organizations')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Admin company action error:', updateError)
      return apiError('فشل في تنفيذ الإجراء', { status: 500 })
    }

    // Send notification to company owner (fire and forget)
    if (action === 'approve') {
      notifyCompanyOwner(id, {
        event: 'company_approved',
        orgId: id,
      }).catch(() => {})
    } else if (action === 'reject') {
      notifyCompanyOwner(id, {
        event: 'company_rejected',
        orgId: id,
        rejectionReason: rejection_reason,
      }).catch(() => {})
    }

    return apiSuccess({
      data: { id, action, status: updateData.status },
    })
  } catch (error) {
    console.error('Admin company action error:', error)
    return apiError('فشل في تنفيذ الإجراء', { status: 500 })
  }
}
