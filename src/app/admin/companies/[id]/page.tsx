'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  Building2,
  Users,
  Home,
  MessageSquare,
  UserPlus,
  Calendar,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Shield,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { TableSkeleton } from '@/components/ui/Skeleton'
import type { Organization, OrgStatus, CompanyType, Role } from '@/types'

interface CompanyDetail extends Organization {
  members: {
    id: string
    user_id: string
    display_name: string
    role: Role
    is_active: boolean
    created_at: string
  }[]
  stats: {
    properties_count: number
    conversations_count: number
    leads_count: number
  }
}

const statusLabels: Record<OrgStatus, string> = {
  pending: 'بانتظار الموافقة',
  trial: 'فترة تجريبية',
  active: 'نشطة',
  suspended: 'موقوفة',
  rejected: 'مرفوضة',
}

const statusVariants: Record<OrgStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  trial: 'info',
  active: 'success',
  rejected: 'danger',
  suspended: 'default',
}

const companyTypeLabels: Record<CompanyType, string> = {
  agency: 'مكتب عقاري',
  developer: 'شركة تطوير',
  individual: 'مسوّق فردي',
}

const roleLabels: Record<Role, string> = {
  owner: 'مالك',
  admin: 'مدير',
  agent: 'وكيل',
  viewer: 'مشاهد',
}

export default function AdminCompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchCompany = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`)
      const json = await res.json()
      if (json.success) {
        setCompany(json.data)
      } else {
        toast.error(json.error || 'فشل تحميل بيانات الشركة')
        router.push('/admin/companies')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }, [companyId, router])

  useEffect(() => {
    fetchCompany()
  }, [fetchCompany])

  const handleAction = async (action: string, reason?: string) => {
    setActionLoading(true)
    try {
      const body: Record<string, string> = { action }
      if (reason) body.rejection_reason = reason

      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        const actionLabels: Record<string, string> = {
          approve: 'تم قبول الشركة بنجاح',
          reject: 'تم رفض الشركة',
          suspend: 'تم إيقاف الشركة',
          reactivate: 'تم إعادة تفعيل الشركة',
        }
        toast.success(actionLabels[action] || 'تم تنفيذ الإجراء')
        setRejectModal(false)
        setRejectionReason('')
        fetchCompany()
      } else {
        toast.error(json.error || 'فشل في تنفيذ الإجراء')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض')
      return
    }
    await handleAction('reject', rejectionReason)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-56" />
              </div>
            </Card>
            <Card>
              <Skeleton className="h-6 w-32 mb-4" />
              <TableSkeleton rows={3} cols={4} />
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                {[1, 2].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">لم يتم العثور على الشركة</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/companies')}>
          العودة للشركات
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/companies')}
          >
            <ArrowRight size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <Badge variant={statusVariants[company.status]}>
                {statusLabels[company.status]}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{company.slug}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الشركة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">اسم الشركة</p>
                  <p className="text-sm font-medium text-gray-900">{company.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">النوع</p>
                  <Badge variant="info">
                    {companyTypeLabels[company.company_type] || company.company_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400">الخطة</p>
                  <p className="text-sm font-medium text-gray-900">{company.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">اللون الرئيسي</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded border"
                      style={{ backgroundColor: company.primary_color }}
                    />
                    <span className="text-sm text-gray-600">{company.primary_color}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">تاريخ التسجيل</p>
                  <p className="text-sm text-gray-600">
                    {new Date(company.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                {company.trial_ends_at && (
                  <div>
                    <p className="text-xs text-gray-400">انتهاء الفترة التجريبية</p>
                    <p className="text-sm text-gray-600">
                      {new Date(company.trial_ends_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
                {company.approved_at && (
                  <div>
                    <p className="text-xs text-gray-400">تاريخ الموافقة</p>
                    <p className="text-sm text-gray-600">
                      {new Date(company.approved_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
                {company.rejection_reason && (
                  <div>
                    <p className="text-xs text-gray-400">سبب الرفض</p>
                    <p className="text-sm text-red-600">{company.rejection_reason}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">الموافقة على الدعوات</p>
                  <p className="text-sm text-gray-600">
                    {company.invite_approval_required ? 'مطلوبة' : 'غير مطلوبة'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Members Table */}
          <Card padding={false}>
            <div className="p-6 pb-0">
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">أعضاء الفريق</h2>
                <Badge variant="default">{company.members.length}</Badge>
              </div>
            </div>
            {company.members.length === 0 ? (
              <div className="text-center py-8 text-gray-400 px-6 pb-6">
                <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا يوجد أعضاء</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-right px-4 py-3 font-medium text-gray-600">الاسم</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">الدور</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">تاريخ الانضمام</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.members.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{member.display_name}</td>
                        <td className="px-4 py-3">
                          <Badge variant={member.role === 'owner' ? 'info' : 'default'}>
                            {roleLabels[member.role] || member.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={member.is_active ? 'success' : 'danger'}>
                            {member.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(member.created_at).toLocaleDateString('ar-SA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">إحصائيات الشركة</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Home size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-700">العقارات</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {company.stats.properties_count}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-green-600" />
                  <span className="text-sm text-gray-700">المحادثات</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {company.stats.conversations_count}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-purple-600" />
                  <span className="text-sm text-gray-700">العملاء المحتملين</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {company.stats.leads_count}
                </span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">الإجراءات</h3>
            <div className="space-y-2">
              {(company.status === 'pending' || company.status === 'trial') && (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  loading={actionLoading}
                  onClick={() => handleAction('approve')}
                >
                  <CheckCircle2 size={16} />
                  <span>قبول الشركة</span>
                </Button>
              )}

              {(company.status === 'pending' || company.status === 'trial') && (
                <Button
                  variant="danger"
                  size="md"
                  className="w-full"
                  onClick={() => setRejectModal(true)}
                >
                  <XCircle size={16} />
                  <span>رفض الشركة</span>
                </Button>
              )}

              {company.status === 'active' && (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                  loading={actionLoading}
                  onClick={() => handleAction('suspend')}
                >
                  <Ban size={16} />
                  <span>إيقاف الشركة</span>
                </Button>
              )}

              {company.status === 'suspended' && (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                  loading={actionLoading}
                  onClick={() => handleAction('reactivate')}
                >
                  <RotateCcw size={16} />
                  <span>إعادة تفعيل الشركة</span>
                </Button>
              )}

              {company.status === 'rejected' && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 text-sm mb-1">
                    <Shield size={14} />
                    <span className="font-medium">شركة مرفوضة</span>
                  </div>
                  {company.rejection_reason && (
                    <p className="text-xs text-red-600">{company.rejection_reason}</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Timeline Info */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">الجدول الزمني</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">تاريخ التسجيل</p>
                  <p className="text-sm text-gray-700">
                    {new Date(company.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
              {company.trial_ends_at && (
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">انتهاء التجربة</p>
                    <p className="text-sm text-gray-700">
                      {new Date(company.trial_ends_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              )}
              {company.approved_at && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-green-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">تاريخ الموافقة</p>
                    <p className="text-sm text-gray-700">
                      {new Date(company.approved_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">آخر تحديث</p>
                  <p className="text-sm text-gray-700">
                    {new Date(company.updated_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal}
        onClose={() => {
          setRejectModal(false)
          setRejectionReason('')
        }}
        title={`رفض شركة: ${company.name}`}
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
                setRejectModal(false)
                setRejectionReason('')
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading}
              onClick={handleRejectSubmit}
            >
              تأكيد الرفض
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
