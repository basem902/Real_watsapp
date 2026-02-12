import type { PaginationParams } from '@/types'

export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultPageSize = 10
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || String(defaultPageSize), 10)))
  return { page, pageSize }
}

export function getPaginationRange(page: number, pageSize: number): { from: number; to: number } {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}
