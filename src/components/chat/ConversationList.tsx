'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrg } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import { formatRelativeTime } from '@/lib/utils/formatters'
import type { Conversation, ConversationStatus } from '@/types'

interface ConversationListProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

const statusOptions = [
  { value: '', label: 'الكل' },
  { value: 'نشطة', label: 'نشطة' },
  { value: 'منتهية', label: 'منتهية' },
  { value: 'تحتاج_متابعة', label: 'تحتاج متابعة' },
]

const statusBadgeVariant = (status: ConversationStatus): 'success' | 'default' | 'warning' => {
  switch (status) {
    case 'نشطة':
      return 'success'
    case 'منتهية':
      return 'default'
    case 'تحتاج_متابعة':
      return 'warning'
    default:
      return 'default'
  }
}

export default function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { organization, loading: orgLoading } = useOrg()
  const orgId = organization?.id

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const fetchConversations = useCallback(async () => {
    if (!orgId) return

    const supabase = createClient()

    let query = supabase
      .from('conversations')
      .select('*')
      .eq('organization_id', orgId)
      .order('last_message_at', { ascending: false })

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    if (search.trim()) {
      query = query.or(
        `customer_name.ilike.%${search.trim()}%,whatsapp_number.ilike.%${search.trim()}%`
      )
    }

    const { data, error } = await query

    if (!error && data) {
      setConversations(data)
    }
    setLoading(false)
  }, [orgId, statusFilter, search])

  // Fetch conversations on mount and when filters change
  useEffect(() => {
    if (orgLoading) return
    if (!orgId) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchConversations()
  }, [orgId, orgLoading, fetchConversations])

  // Realtime subscription for conversation list updates
  useEffect(() => {
    if (!orgId) return

    const supabase = createClient()
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [orgId, fetchConversations])

  // Loading skeleton
  if (loading || orgLoading) {
    return (
      <div className="flex h-full flex-col rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-16 w-full" count={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-white shadow-sm">
      {/* Search & Filter Header */}
      <div className="border-b p-4 space-y-3">
        <Input
          placeholder="بحث بالاسم أو الرقم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="فلترة حسب الحالة"
          className="text-sm"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">لا توجد محادثات</p>
              {(search || statusFilter) && (
                <button
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('')
                  }}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-right p-4 border-b transition-colors hover:bg-gray-50 ${
                  selectedId === conv.id
                    ? 'bg-primary/5 border-r-4 border-r-primary'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {conv.customer_name || conv.whatsapp_number}
                    </p>
                    {conv.customer_name && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {conv.whatsapp_number}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={statusBadgeVariant(conv.status)}>
                      {conv.status === 'تحتاج_متابعة' ? 'متابعة' : conv.status}
                    </Badge>
                    {conv.last_message_at && (
                      <span className="text-[10px] text-gray-400">
                        {formatRelativeTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className="border-t px-4 py-2">
        <p className="text-xs text-gray-400 text-center">
          {conversations.length} محادثة
        </p>
      </div>
    </div>
  )
}
