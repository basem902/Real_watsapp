import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/pending' ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/journeys') ||
    pathname.startsWith('/api/webhook') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/invite') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Guard: if env vars missing, skip auth check
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  // Create supabase client with cookie handling
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ===== /admin/* routes — require super admin =====
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (user.user_metadata?.is_super_admin !== true) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return response
  }

  // ===== /dashboard/* routes — require auth + active org =====
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Check org status
    try {
      const { data: member } = await supabase
        .from('org_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (member) {
        const { data: org } = await supabase
          .from('organizations')
          .select('status, trial_ends_at')
          .eq('id', member.organization_id)
          .single()

        if (org) {
          if (org.status === 'active') {
            return response // Approved — allow
          }
          if (org.status === 'trial') {
            const trialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : null
            if (trialEnd && trialEnd > new Date()) {
              return response // Trial still active — allow
            }
            // Trial expired
            const url = request.nextUrl.clone()
            url.pathname = '/pending'
            url.searchParams.set('status', 'trial_expired')
            return NextResponse.redirect(url)
          }
          // pending, rejected, suspended
          const url = request.nextUrl.clone()
          url.pathname = '/pending'
          url.searchParams.set('status', org.status)
          return NextResponse.redirect(url)
        }
      }
    } catch {
      // On error, allow through — OrgProvider will handle
    }

    return response
  }

  // ===== /api/admin/* routes — handled by route handlers =====

  // Redirect authenticated users away from login/register
  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    const redirect = request.nextUrl.searchParams.get('redirect')
    url.pathname = redirect || '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
