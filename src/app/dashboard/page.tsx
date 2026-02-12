'use client'

import { useState, useEffect } from 'react'
import { Building2, MessageSquare, Users, CalendarDays } from 'lucide-react'
import { useOrg } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import StatCard from '@/components/dashboard/StatCard'
import Skeleton from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils/formatters'

interface DashboardStats {
  propertiesCount: number
  conversationsCount: number
  leadsCount: number
  appointmentsToday: number
}

export default function DashboardPage() {
  const { organization, loading: orgLoading } = useOrg()
  const orgId = organization?.id
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentConversations, setRecentConversations] = useState<any[]>([])
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orgLoading) return
    if (!orgId) {
      setLoading(false)
      return
    }
    const supabase = createClient()

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const tomorrowStart = new Date(todayStart)
        tomorrowStart.setDate(tomorrowStart.getDate() + 1)

        // Fetch counts in parallel
        const [propsRes, convsRes, leadsRes, apptsRes, recentConvRes, todayApptsRes] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).eq('is_deleted', false),
          supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
          supabase.from('leads').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
          supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).gte('scheduled_at', todayStart.toISOString()).lt('scheduled_at', tomorrowStart.toISOString()),
          supabase.from('conversations').select('id, customer_name, whatsapp_number, status, last_message_at').eq('organization_id', orgId).order('last_message_at', { ascending: false }).limit(5),
          supabase.from('appointments').select('id, scheduled_at, status, notes, properties(title), leads(customer_name, phone)').eq('organization_id', orgId).gte('scheduled_at', todayStart.toISOString()).lt('scheduled_at', tomorrowStart.toISOString()).order('scheduled_at', { ascending: true }).limit(5),
        ])

        setStats({
          propertiesCount: propsRes.count || 0,
          conversationsCount: convsRes.count || 0,
          leadsCount: leadsRes.count || 0,
          appointmentsToday: apptsRes.count || 0,
        })
        setRecentConversations(recentConvRes.data || [])
        setTodayAppointments(todayApptsRes.data || [])
      } catch {
        setError('حدث خطأ في تحميل البيانات')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [orgId, orgLoading])

  if (loading || orgLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <div className="rounded-xl border bg-white py-16 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="العقارات"
          value={stats?.propertiesCount || 0}
          icon={<Building2 size={24} />}
          color="bg-blue-500"
        />
        <StatCard
          title="المحادثات"
          value={stats?.conversationsCount || 0}
          icon={<MessageSquare size={24} />}
          color="bg-green-500"
        />
        <StatCard
          title="العملاء المحتملين"
          value={stats?.leadsCount || 0}
          icon={<Users size={24} />}
          color="bg-purple-500"
        />
        <StatCard
          title="مواعيد اليوم"
          value={stats?.appointmentsToday || 0}
          icon={<CalendarDays size={24} />}
          color="bg-orange-500"
        />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent conversations */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">آخر المحادثات</h3>
          {recentConversations.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">لا توجد محادثات بعد</p>
          ) : (
            <div className="space-y-3">
              {recentConversations.map((conv: any) => (
                <div key={conv.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {conv.customer_name || conv.whatsapp_number}
                    </p>
                    <p className="text-xs text-gray-500">{conv.whatsapp_number}</p>
                  </div>
                  <div className="text-left">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      conv.status === '\u0646\u0634\u0637\u0629' ? 'bg-green-100 text-green-700' :
                      conv.status === '\u062a\u062d\u062a\u0627\u062c_\u0645\u062a\u0627\u0628\u0639\u0629' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {conv.status}
                    </span>
                    {conv.last_message_at && (
                      <p className="text-[10px] text-gray-400 mt-1">{formatDate(conv.last_message_at)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's appointments */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">مواعيد اليوم</h3>
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">لا توجد مواعيد اليوم</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appt: any) => (
                <div key={appt.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {appt.properties?.title || 'عقار غير محدد'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appt.leads?.customer_name || appt.leads?.phone || 'عميل غير محدد'}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      appt.status === '\u0645\u0624\u0643\u062f' ? 'bg-green-100 text-green-700' :
                      appt.status === '\u0645\u062c\u062f\u0648\u0644' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {appt.status}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(appt.scheduled_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
