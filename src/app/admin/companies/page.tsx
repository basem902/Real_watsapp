'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Search,
  Eye,
  Check,
  X,
  Ban,
  RotateCcw,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import Modal from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import type { PlatformCompanyStats, OrgStatus, CompanyType } from '@/types'

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

const statusOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'pending', label: 'بانتظار الموافقة' },
  { value: 'trial', label: 'فترة تجريبية' },
  { value: 'active', label: 'نشطة' },
  { value: 'suspended', label: 'موقوفة' },
  { value: 'rejected', label: 'مرفوضة' },
]

const typeOptions = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'agency', label: 'مكتب عقاري' },
  { value: 'developer', label: 'شركة تطوير' },
  { value: 'individual', label: 'مسوّق فردي' },
]

export default function AdminCompaniesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [companies, setCompanies] = useState<PlatformCompanyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const pageSize = 10

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ open: boolean; companyId: string; companyName: string }>({
    open: false,
    companyId: '',
    companyName: '',
  })
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (typeFilter) params.set('type', typeFilter)
      if (searchQuery) params.set('search', searchQuery)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))

      const res = await fetch(`/api/admin/companies?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setCompanies(json.data)
        setTotal(json.pagination?.total || 0)
      } else {
        toast.error(json.error || 'فشل تحميل الشركات')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter, searchQuery, page])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setPage(1)
  }

  const handleAction = async (companyId: string, action: string, reason?: string) => {
    setActionLoading(companyId)
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
          approve: 'تم قبول الشركة',
          reject: 'تم رفض الشركة',
          suspend: 'تم إيقاف الشركة',
          reactivate: 'تم إعادة تفعيل الشركة',
        }
        toast.success(actionLabels[action] || 'تم تنفيذ الإجراء')
        fetchCompanies()
      } else {
        toast.error(json.error || 'فشل في تنفيذ الإجراء')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض')
      return
    }
    await handleAction(rejectModal.companyId, 'reject', rejectionReason)
    setRejectModal({ open: false, companyId: '', companyName: '' })
    setRejectionReason('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة الشركات</h1>
        <p className="text-sm text-gray-500 mt-1">عرض وإدارة جميع الشركات المسجلة في المنصة</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                placeholder="بحث بالاسم..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="outline" size="md" onClick={handleSearch}>
                <Search size={16} />
              </Button>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              placeholder="الحالة"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              placeholder="النوع"
            />
          </div>
        </div>
      </Card>

      {/* Companies Table */}
      <Card padding={false}>
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={7} />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">لا توجد شركات مطابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-right px-4 py-3 font-medium text-gray-600">اسم الشركة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">النوع</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الأعضاء</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">العقارات</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">تاريخ التسجيل</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">انتهاء التجربة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/admin/companies/${company.id}`)}
                        className="font-medium text-gray-900 hover:text-purple-700 transition-colors"
                      >
                        {company.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">
                        {companyTypeLabels[company.company_type] || company.company_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariants[company.status]}>
                        {statusLabels[company.status] || company.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{company.members_count}</td>
                    <td className="px-4 py-3 text-gray-600">{company.properties_count}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(company.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {company.trial_ends_at
                        ? new Date(company.trial_ends_at).toLocaleDateString('ar-SA')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/companies/${company.id}`)}
                          title="عرض التفاصيل"
                        >
                          <Eye size={14} />
                        </Button>

                        {(company.status === 'pending' || company.status === 'trial') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={actionLoading === company.id}
                            onClick={() => handleAction(company.id, 'approve')}
                            title="قبول"
                          >
                            <Check size={14} className="text-green-600" />
                          </Button>
                        )}

                        {(company.status === 'pending' || company.status === 'trial') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setRejectModal({
                                open: true,
                                companyId: company.id,
                                companyName: company.name,
                              })
                            }
                            title="رفض"
                          >
                            <X size={14} className="text-red-600" />
                          </Button>
                        )}

                        {company.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={actionLoading === company.id}
                            onClick={() => handleAction(company.id, 'suspend')}
                            title="إيقاف"
                          >
                            <Ban size={14} className="text-orange-600" />
                          </Button>
                        )}

                        {company.status === 'suspended' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={actionLoading === company.id}
                            onClick={() => handleAction(company.id, 'reactivate')}
                            title="إعادة تفعيل"
                          >
                            <RotateCcw size={14} className="text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && total > pageSize && (
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

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
