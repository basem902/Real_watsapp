export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/super-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { apiSuccess, apiError } from '@/lib/utils/api-response'

export async function GET(request: NextRequest) {
  const { authorized } = await requireSuperAdmin()
  if (!authorized) return apiError('غير مصرح', { status: 403 })

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)))

    // Build query for organizations
    let query = supabaseAdmin
      .from('organizations')
      .select('id, name, slug, company_type, status, plan, created_at, trial_ends_at, approved_at', { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }
    if (type) {
      query = query.eq('company_type', type)
    }
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Order and paginate
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data: orgs, count, error } = await query

    if (error) {
      console.error('Admin companies query error:', error)
      return apiError('فشل في تحميل الشركات', { status: 500 })
    }

    if (!orgs || orgs.length === 0) {
      return apiSuccess({
        data: [],
        pagination: { page, pageSize, total: count || 0 },
      })
    }

    // Get counts for each organization
    const orgIds = orgs.map((org) => org.id)

    const [membersResult, propertiesResult, conversationsResult] = await Promise.all([
      supabaseAdmin
        .from('org_members')
        .select('organization_id')
        .in('organization_id', orgIds)
        .eq('is_active', true),
      supabaseAdmin
        .from('properties')
        .select('organization_id')
        .in('organization_id', orgIds)
        .eq('is_deleted', false),
      supabaseAdmin
        .from('conversations')
        .select('organization_id')
        .in('organization_id', orgIds),
    ])

    // Count per org
    const membersCounts: Record<string, number> = {}
    const propertiesCounts: Record<string, number> = {}
    const conversationsCounts: Record<string, number> = {}

    for (const m of membersResult.data || []) {
      membersCounts[m.organization_id] = (membersCounts[m.organization_id] || 0) + 1
    }
    for (const p of propertiesResult.data || []) {
      propertiesCounts[p.organization_id] = (propertiesCounts[p.organization_id] || 0) + 1
    }
    for (const c of conversationsResult.data || []) {
      conversationsCounts[c.organization_id] = (conversationsCounts[c.organization_id] || 0) + 1
    }

    const data = orgs.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      company_type: org.company_type,
      status: org.status,
      plan: org.plan,
      created_at: org.created_at,
      trial_ends_at: org.trial_ends_at,
      approved_at: org.approved_at,
      members_count: membersCounts[org.id] || 0,
      properties_count: propertiesCounts[org.id] || 0,
      conversations_count: conversationsCounts[org.id] || 0,
    }))

    return apiSuccess({
      data,
      pagination: { page, pageSize, total: count || 0 },
    })
  } catch (error) {
    console.error('Admin companies error:', error)
    return apiError('فشل في تحميل الشركات', { status: 500 })
  }
}
