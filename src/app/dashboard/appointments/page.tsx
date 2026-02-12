'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import { useOrg } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Skeleton from '@/components/ui/Skeleton'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { formatDate } from '@/lib/utils/formatters'
import type { AppointmentStatus } from '@/types'
import toast from 'react-hot-toast'

const STATUSES: AppointmentStatus[] = ['مجدول', 'مؤكد', 'منتهي', 'ملغي']
const PAGE_SIZE = 10
const statusColors: Record<string, string> = { 'مجدول': 'bg-blue-100 text-blue-700', 'مؤكد': 'bg-green-100 text-green-700', 'منتهي': 'bg-gray-100 text-gray-600', 'ملغي': 'bg-red-100 text-red-700' }

export default function AppointmentsPage() {
  const { organization } = useOrg()
  const orgId = organization?.id
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchAppointments = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('appointments').select('*, properties(title, city), leads(customer_name, phone)', { count: 'exact' }).eq('organization_id', orgId).order('scheduled_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    if (statusFilter) query = query.eq('status', statusFilter)
    const { data, count, error } = await query
    if (error) toast.error('خطأ في تحميل المواعيد')
    setAppointments(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [orgId, page, statusFilter])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    const supabase = createClient()
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) toast.error('خطأ في تحديث الحالة')
    else { toast.success('تم تحديث الحالة'); fetchAppointments() }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">المواعيد</h1>
      <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} options={[{ label: 'كل الحالات', value: '' }, ...STATUSES.map(s => ({ label: s, value: s }))]} />
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : appointments.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center"><CalendarDays size={48} className="mx-auto text-gray-300" /><p className="mt-4 text-gray-500">لا توجد مواعيد</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-right"><tr><th className="px-4 py-3 font-medium text-gray-600">العقار</th><th className="px-4 py-3 font-medium text-gray-600">العميل</th><th className="px-4 py-3 font-medium text-gray-600">التاريخ</th><th className="px-4 py-3 font-medium text-gray-600">الحالة</th><th className="px-4 py-3 font-medium text-gray-600">ملاحظات</th></tr></thead>
            <tbody>
              {appointments.map((appt: any) => (
                <tr key={appt.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{appt.properties?.title || 'غير محدد'}</p><p className="text-xs text-gray-500">{appt.properties?.city || ''}</p></td>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{appt.leads?.customer_name || 'غير محدد'}</p><p className="text-xs text-gray-500">{appt.leads?.phone || ''}</p></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1 text-gray-600"><Clock size={14} /><span>{new Date(appt.scheduled_at).toLocaleDateString('ar-SA')} {new Date(appt.scheduled_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span></div></td>
                  <td className="px-4 py-3"><select value={appt.status} onChange={e => updateStatus(appt.id, e.target.value as AppointmentStatus)} className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer ${statusColors[appt.status] || 'bg-gray-100'}`}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{appt.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > PAGE_SIZE && <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />}
    </div>
  )
}
