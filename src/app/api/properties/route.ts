export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS, rateLimitKey, rateLimitHeaders } from '@/lib/rate-limit'
import { checkPropertyLimit } from '@/lib/utils/usage-limits'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: member } = await supabaseAdmin
      .from('org_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || '1')
    const pageSize = Math.min(Number(searchParams.get('pageSize') || '10'), 50)
    const offset = (page - 1) * pageSize

    let query = supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('organization_id', member.organization_id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const type = searchParams.get('property_type')
    const listing = searchParams.get('listing_type')
    const search = searchParams.get('search')
    if (type) query = query.eq('property_type', type)
    if (listing) query = query.eq('listing_type', listing)
    if (search) query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`)

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, pageSize, total: count || 0 },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(rateLimitKey('properties', user.id), RATE_LIMITS.properties)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limited' },
        { status: 429, headers: rateLimitHeaders(rl) }
      )
    }

    const { data: member } = await supabaseAdmin
      .from('org_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    if (!member || !['owner', 'admin', 'agent'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const usageCheck = await checkPropertyLimit(member.organization_id)
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 })
    }

    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert({ ...body, organization_id: member.organization_id, created_by: user.id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
