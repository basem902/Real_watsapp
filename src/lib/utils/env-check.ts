// C5: Environment variable validation at startup
// Import this in layout.tsx or instrumentation.ts

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const REQUIRED_SERVER_ENV_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'INTERNAL_API_KEY',
] as const

const OPTIONAL_WITH_WARNING = [
  'OPENAI_API_KEY',
  'WASENDER_API_KEY',
  'WASENDER_INSTANCE_ID',
  'ENCRYPTION_KEY',
] as const

export function validateEnv(): void {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required public vars
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  // Check required server vars (only on server side)
  if (typeof window === 'undefined') {
    for (const key of REQUIRED_SERVER_ENV_VARS) {
      if (!process.env[key]) {
        missing.push(key)
      }
    }

    for (const key of OPTIONAL_WITH_WARNING) {
      if (!process.env[key]) {
        warnings.push(key)
      }
    }
  }

  if (missing.length > 0) {
    console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`)
  }

  if (warnings.length > 0) {
    console.warn(`[ENV] Missing optional environment variables (some features may not work): ${warnings.join(', ')}`)
  }

  // Validate ENCRYPTION_KEY format if present
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 64) {
    console.error('[ENV] ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)')
  }
}
