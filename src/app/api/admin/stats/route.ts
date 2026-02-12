export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/super-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { apiSuccess, apiError } from '@/lib/utils/api-response'

export async function GET(request: NextRequest) {
  const { authorized } = await requireSuperAdmin()
  if (!authorized) return apiError('غير مصرح', { status: 403 })

  try {
    const [
      { count: totalCompanies },
      { count: pendingCompanies },
      { count: trialCompanies },
      { count: activeCompanies },
      { count: totalUsers },
      { count: totalProperties },
      { count: totalConversations },
    ] = await Promise.all([
      supabaseAdmin.from('organizations').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'trial'),
      supabaseAdmin.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('org_members').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabaseAdmin.from('conversations').select('*', { count: 'exact', head: true }),
    ])

    return apiSuccess({
      data: {
        total_companies: totalCompanies || 0,
        pending_companies: pendingCompanies || 0,
        trial_companies: trialCompanies || 0,
        active_companies: activeCompanies || 0,
        total_users: totalUsers || 0,
        total_properties: totalProperties || 0,
        total_conversations: totalConversations || 0,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return apiError('فشل في تحميل الإحصائيات', { status: 500 })
  }
}
