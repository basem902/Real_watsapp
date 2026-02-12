'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Eye, Edit2, Trash2, Building2 } from 'lucide-react'
import { useOrg, PermissionGate } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { formatPrice } from '@/lib/utils/formatters'
import type { Property, PropertyType, ListingType } from '@/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

const PROPERTY_TYPES: PropertyType[] = ['\u0634\u0642\u0629', '\u0641\u064a\u0644\u0627', '\u062f\u0648\u0628\u0644\u0643\u0633', '\u0623\u0631\u0636', '\u0645\u0643\u062a\u0628', '\u0645\u062d\u0644 \u062a\u062c\u0627\u0631\u064a']
const LISTING_TYPES: ListingType[] = ['\u0628\u064a\u0639', '\u0625\u064a\u062c\u0627\u0631']
const PAGE_SIZE = 10

export default function PropertiesPage() {
  const { organization, hasPermission, loading: orgLoading } = useOrg()
  const orgId = organization?.id
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [propertyType, setPropertyType] = useState<string>('')
  const [listingType, setListingType] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    setError(null)
    const supabase = createClient()

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (propertyType) query = query.eq('property_type', propertyType)
    if (listingType) query = query.eq('listing_type', listingType)
    if (search) query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%,district.ilike.%${search}%`)

    const { data, count, error: fetchError } = await query
    if (fetchError) {
      setError('خطأ في تحميل العقارات')
      toast.error('خطأ في تحميل العقارات')
    } else {
      setProperties((data || []) as Property[])
      setTotal(count || 0)
    }
    setLoading(false)
  }, [orgId, page, search, propertyType, listingType])

  useEffect(() => {
    if (!orgLoading && orgId) {
      fetchProperties()
    } else if (!orgLoading && !orgId) {
      setLoading(false)
    }
  }, [fetchProperties, orgLoading, orgId])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) return
    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('properties')
      .update({ is_deleted: true })
      .eq('id', id)

    if (deleteError) {
      toast.error('خطأ في حذف العقار')
    } else {
      toast.success('تم حذف العقار')
      fetchProperties()
    }
  }

  const statusColors: Record<string, string> = {
    'متاح': 'bg-green-100 text-green-700',
    'محجوز': 'bg-yellow-100 text-yellow-700',
    'مباع': 'bg-red-100 text-red-700',
  }

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">العقارات</h1>
        <div className="rounded-xl border bg-white py-16 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => fetchProperties()}
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">العقارات</h1>
        <PermissionGate permission="properties:write">
          <Link href="/dashboard/properties/new">
            <Button>
              <Plus size={16} className="ml-2" />
              إضافة عقار
            </Button>
          </Link>
        </PermissionGate>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="بحث بالعنوان أو المدينة..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pr-10"
          />
        </div>
        <Select
          value={propertyType}
          onChange={(e) => { setPropertyType(e.target.value); setPage(1) }}
          options={[{ label: 'كل الأنواع', value: '' }, ...PROPERTY_TYPES.map(t => ({ label: t, value: t }))]}
        />
        <Select
          value={listingType}
          onChange={(e) => { setListingType(e.target.value); setPage(1) }}
          options={[{ label: 'بيع وإيجار', value: '' }, ...LISTING_TYPES.map(t => ({ label: t, value: t }))]}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center">
          <Building2 size={48} className="mx-auto text-gray-300" />
          <p className="mt-4 text-gray-500">لا توجد عقارات</p>
          <PermissionGate permission="properties:write">
            <Link href="/dashboard/properties/new">
              <Button className="mt-4" variant="outline">إضافة أول عقار</Button>
            </Link>
          </PermissionGate>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-right">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">العنوان</th>
                <th className="px-4 py-3 font-medium text-gray-600">النوع</th>
                <th className="px-4 py-3 font-medium text-gray-600">الغرض</th>
                <th className="px-4 py-3 font-medium text-gray-600">السعر</th>
                <th className="px-4 py-3 font-medium text-gray-600">المدينة</th>
                <th className="px-4 py-3 font-medium text-gray-600">الحالة</th>
                <th className="px-4 py-3 font-medium text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => (
                <tr key={prop.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{prop.title}</td>
                  <td className="px-4 py-3 text-gray-600">{prop.property_type}</td>
                  <td className="px-4 py-3 text-gray-600">{prop.listing_type}</td>
                  <td className="px-4 py-3 text-gray-600">{formatPrice(prop.price)}</td>
                  <td className="px-4 py-3 text-gray-600">{prop.city}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[prop.status] || 'bg-gray-100 text-gray-600'}`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/properties/${prop.id}`}>
                        <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600">
                          <Eye size={16} />
                        </button>
                      </Link>
                      <PermissionGate permission="properties:write">
                        <Link href={`/dashboard/properties/${prop.id}?edit=true`}>
                          <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-yellow-600">
                            <Edit2 size={16} />
                          </button>
                        </Link>
                      </PermissionGate>
                      <PermissionGate permission="properties:delete">
                        <button
                          onClick={() => handleDelete(prop.id)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
