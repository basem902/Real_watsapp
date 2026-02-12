import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ⚠️ NEVER import in Edge Runtime or client-side code
// This client bypasses RLS — use only in Node API routes

let _client: SupabaseClient | null = null

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
      }
      _client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
    }
    const value = (_client as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return (value as Function).bind(_client)
    }
    return value
  },
})
