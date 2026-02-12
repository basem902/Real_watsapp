'use client'

import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, Eye } from 'lucide-react'
import { useOrg } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Skeleton from '@/components/ui/Skeleton'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils/formatters'
import type { AuditLogEntry, AuditAction } from '@/types'

const ACTIONS: AuditAction[] = ['create', 'update', 'delete', 'status_change']
const PAGE_SIZE = 10
const actionLabels: Record<string, string> = { create: 'إنشاء', update: 'تحديث', delete: 'حذف', status_change: 'تغيير حالة' }
const actionColors: Record<string, string> = { create: 'bg-green-100 text-green-700', update: 'bg-blue-100 text-blue-700', delete: 'bg-red-100 text-red-700', status_change: 'bg-yellow-100 text-yellow-700' }

export default function AuditLogPage() {
  const { organization } = useOrg()
  const orgId = organization?.id
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('audit_log').select('*', { count: 'exact' }).eq('organization_id', orgId).order('created_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    if (actionFilter) query = query.eq('action', actionFilter)
    const { data, count } = await query
    setEntries((data || []) as AuditLogEntry[])
    setTotal(count || 0)
    setLoading(false)
  }, [orgId, page, actionFilter])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">سجل العمليات</h1>
      <Select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }} options={[{ label: 'كل العمليات', value: '' }, ...ACTIONS.map(a => ({ label: actionLabels[a], value: a }))]} />
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center"><ClipboardList size={48} className="mx-auto text-gray-300" /><p className="mt-4 text-gray-500">لا توجد عمليات مسجلة</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-right"><tr><th className="px-4 py-3 font-medium text-gray-600">العملية</th><th className="px-4 py-3 font-medium text-gray-600">الجدول</th><th className="px-4 py-3 font-medium text-gray-600">المعرف</th><th className="px-4 py-3 font-medium text-gray-600">التاريخ</th><th className="px-4 py-3 font-medium text-gray-600">التفاصيل</th></tr></thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionColors[entry.action]}`}>{actionLabels[entry.action]}</span></td>
                  <td className="px-4 py-3 text-gray-600">{entry.table_name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{entry.record_id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(entry.created_at)}</td>
                  <td className="px-4 py-3"><button onClick={() => setSelectedEntry(entry)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"><Eye size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > PAGE_SIZE && <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />}
      <Modal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title="تفاصيل العملية">
        {selectedEntry && (
          <div className="space-y-4 text-sm">
            <div><span className="font-medium text-gray-700">العملية: </span><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionColors[selectedEntry.action]}`}>{actionLabels[selectedEntry.action]}</span></div>
            <div><span className="font-medium text-gray-700">الجدول: </span>{selectedEntry.table_name}</div>
            <div><span className="font-medium text-gray-700">المعرف: </span><code className="text-xs bg-gray-100 px-1 rounded">{selectedEntry.record_id}</code></div>
            {selectedEntry.old_values && <div><span className="font-medium text-gray-700">القيم السابقة:</span><pre className="mt-1 rounded-lg bg-red-50 p-3 text-xs overflow-auto max-h-40 text-left" dir="ltr">{JSON.stringify(selectedEntry.old_values, null, 2)}</pre></div>}
            {selectedEntry.new_values && <div><span className="font-medium text-gray-700">القيم الجديدة:</span><pre className="mt-1 rounded-lg bg-green-50 p-3 text-xs overflow-auto max-h-40 text-left" dir="ltr">{JSON.stringify(selectedEntry.new_values, null, 2)}</pre></div>}
          </div>
        )}
      </Modal>
    </div>
  )
}
