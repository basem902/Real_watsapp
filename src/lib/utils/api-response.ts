// C4: Standardized API response helpers
// Success: { success: true, data?: ..., pagination?: ... }
// Error:   { success: false, error: "..." }

import { NextResponse } from 'next/server'

interface SuccessOptions {
  data?: unknown
  pagination?: { page: number; pageSize: number; total: number }
  status?: number
  headers?: Record<string, string>
}

interface ErrorOptions {
  status?: number
  headers?: Record<string, string>
}

export function apiSuccess(options: SuccessOptions = {}) {
  const { data, pagination, status = 200, headers } = options
  const body: Record<string, unknown> = { success: true }
  if (data !== undefined) body.data = data
  if (pagination) body.pagination = pagination
  return NextResponse.json(body, { status, headers })
}

export function apiError(message: string, options: ErrorOptions = {}) {
  const { status = 500, headers } = options
  return NextResponse.json(
    { success: false, error: message },
    { status, headers },
  )
}
