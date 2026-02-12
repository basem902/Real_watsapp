'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users } from 'lucide-react'
import { useOrg } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Skeleton from '@/components/ui/Skeleton'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import { formatDate, formatPrice } from '@/lib/utils/formatters'
import type { Lead, LeadStatus } from '@/types'
import toast from 'react-hot-toast'

const LEAD_STATUSES: LeadStatus[] = ['جديد', 'مهتم', 'معاينة', 'تفاوض', 'مغلق_ناجح', 'مغلق_فاشل']
const PAGE_SIZE = 10

const statusColors: Record<string, string> = {
  'جديد': 'bg-blue-100 text-blue-700',
  'مهتم': 'bg-purple-100 text-purple-700',
  'معاينة': 'bg-yellow-100 text-yellow-700',
  'تفاوض': 'bg-orange-100 text-orange-700',
  'مغلق_ناجح': 'bg-green-100 text-green-700',
  'مغلق_فاشل': 'bg-red-100 text-red-700',
}

export default function LeadsPage() {
  const { organization } = useOrg()
  const orgId = organization?.id
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchLeads = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (statusFilter) query = query.eq('lead_status', statusFilter)
    if (search) query = query.or(`customer_name.ilike.%${search}%,phone.ilike.%${search}%`)

    const { data, count, error } = await query
    if (error) toast.error('خطأ في تحميل العملاء')
    setLeads((data || []) as Lead[])
    setTotal(count || 0)
    setLoading(false)
  }, [orgId, page, statusFilter, search])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const updateStatus = async (leadId: string, newStatus: LeadStatus) => {
    const supabase = createClient()
    const { error } = await supabase.from('leads').update({ lead_status: newStatus }).eq('id', leadId)
    if (error) toast.error('خطأ في تحديث الحالة')
    else { toast.success('تم تحديث الحالة'); fetchLeads() }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">العملاء المحتملين</h1>
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="flex-1 min-w-[200px]" />
        <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} options={[{ label: 'كل الحالات', value: '' }, ...LEAD_STATUSES.map(s => ({ label: s.replace('_', ' '), value: s }))]} />
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center">
          <Users size={48} className="mx-auto text-gray-300" />
          <p className="mt-4 text-gray-500">لا يوجد عملاء محتملين</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-right">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">الاسم</th>
                <th className="px-4 py-3 font-medium text-gray-600">الهاتف</th>
                <th className="px-4 py-3 font-medium text-gray-600">الميزانية</th>
                <th className="px-4 py-3 font-medium text-gray-600">المنطقة</th>
                <th className="px-4 py-3 font-medium text-gray-600">المصدر</th>
                <th className="px-4 py-3 font-medium text-gray-600">الحالة</th>
                <th className="px-4 py-3 font-medium text-gray-600">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.customer_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.budget_min || lead.budget_max ? `${lead.budget_min ? formatPrice(lead.budget_min) : ''} - ${lead.budget_max ? formatPrice(lead.budget_max) : ''}` : '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.preferred_area || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.lead_source}</td>
                  <td className="px-4 py-3">
                    <select value={lead.lead_status} onChange={e => updateStatus(lead.id, e.target.value as LeadStatus)} className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer ${statusColors[lead.lead_status] || 'bg-gray-100'}`}>
                      {LEAD_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(lead.created_at)}</td>
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
