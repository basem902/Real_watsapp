'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Building2,
  Clock,
  FlaskConical,
  CheckCircle2,
  Users,
  Home,
  MessageSquare,
  Eye,
  Check,
  X,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import type { PlatformStats, PlatformCompanyStats } from '@/types'

const companyTypeLabels: Record<string, string> = {
  agency: 'مكتب عقاري',
  developer: 'شركة تطوير',
  individual: 'مسوّق فردي',
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [pendingCompanies, setPendingCompanies] = useState<PlatformCompanyStats[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ open: boolean; companyId: string; companyName: string }>({
    open: false,
    companyId: '',
    companyName: '',
  })
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const json = await res.json()
      if (json.success) {
        setStats(json.data)
      } else {
        toast.error('فشل تحميل الإحصائيات')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/companies?status=pending&pageSize=5')
      const json = await res.json()
      if (json.success) {
        setPendingCompanies(json.data)
      } else {
        toast.error('فشل تحميل الشركات المعلقة')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoadingCompanies(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchPending()
  }, [fetchStats, fetchPending])

  const handleApprove = async (companyId: string) => {
    setActionLoading(companyId)
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('تم قبول الشركة بنجاح')
        fetchPending()
        fetchStats()
      } else {
        toast.error(json.error || 'فشل في قبول الشركة')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض')
      return
    }
    setActionLoading(rejectModal.companyId)
    try {
      const res = await fetch(`/api/admin/companies/${rejectModal.companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejection_reason: rejectionReason }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('تم رفض الشركة')
        setRejectModal({ open: false, companyId: '', companyName: '' })
        setRejectionReason('')
        fetchPending()
        fetchStats()
      } else {
        toast.error(json.error || 'فشل في رفض الشركة')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setActionLoading(null)
    }
  }

  const statsCards = [
    { label: 'إجمالي الشركات', value: stats?.total_companies, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'بانتظار الموافقة', value: stats?.pending_companies, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'فترة تجريبية', value: stats?.trial_companies, icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'نشطة', value: stats?.active_companies, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'إجمالي المستخدمين', value: stats?.total_users, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'إجمالي العقارات', value: stats?.total_properties, icon: Home, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 mt-1">نظرة عامة على المنصة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statsCards.map((card, idx) => (
          <Card key={idx}>
            {loadingStats ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value ?? 0}</p>
                </div>
                <div className={`rounded-lg p-2 ${card.bg}`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Pending Approvals */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">طلبات الموافقة المعلقة</h2>
            <p className="text-sm text-gray-500">الشركات التي تنتظر مراجعتك</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/companies?status=pending')}
          >
            عرض الكل
          </Button>
        </div>

        {loadingCompanies ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : pendingCompanies.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle2 size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">لا توجد طلبات معلقة</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingCompanies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/admin/companies/${company.id}`)}
                      className="font-medium text-gray-900 hover:text-purple-700 transition-colors text-sm truncate"
                    >
                      {company.name}
                    </button>
                    <Badge variant="info">
                      {companyTypeLabels[company.company_type] || company.company_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    تاريخ التسجيل: {new Date(company.created_at).toLocaleDateString('ar-SA')}
                    {company.trial_ends_at && (
                      <span className="mr-3">
                        انتهاء التجربة: {new Date(company.trial_ends_at).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 mr-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/companies/${company.id}`)}
                  >
                    <Eye size={14} />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading === company.id}
                    onClick={() => handleApprove(company.id)}
                  >
                    <Check size={14} />
                    <span>قبول</span>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={actionLoading === company.id}
                    onClick={() =>
                      setRejectModal({ open: true, companyId: company.id, companyName: company.name })
                    }
                  >
                    <X size={14} />
                    <span>رفض</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Conversations stat card */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-3 bg-teal-50">
                <MessageSquare size={24} className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">إجمالي المحادثات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_conversations}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, companyId: '', companyName: '' })
          setRejectionReason('')
        }}
        title={`رفض شركة: ${rejectModal.companyName}`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              سبب الرفض
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="اكتب سبب رفض هذه الشركة..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setRejectModal({ open: false, companyId: '', companyName: '' })
                setRejectionReason('')
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading === rejectModal.companyId}
              onClick={handleReject}
            >
              تأكيد الرفض
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
