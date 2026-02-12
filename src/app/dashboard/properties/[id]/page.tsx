'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Edit2, MapPin, Bed, Bath, Maximize, Eye } from 'lucide-react'
import { useOrg, PermissionGate } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import PropertyForm from '@/components/dashboard/PropertyForm'
import { formatPrice, formatDate } from '@/lib/utils/formatters'
import type { Property } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = params.id === 'new'
  const isEdit = searchParams.get('edit') === 'true' || isNew
  const { organization, loading: orgLoading } = useOrg()
  const orgId = organization?.id
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isNew || orgLoading) return
    if (!orgId || !params.id) {
      setLoading(false)
      return
    }
    const supabase = createClient()

    const fetchProperty = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .eq('organization_id', orgId)
        .eq('is_deleted', false)
        .single()

      if (fetchError || !data) {
        setError('العقار غير موجود')
        toast.error('العقار غير موجود')
        router.push('/dashboard/properties')
        return
      }
      setProperty(data as Property)
      setLoading(false)
    }
    fetchProperty()
  }, [params.id, orgId, isNew, router, orgLoading])

  if (loading || orgLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/properties">
            <button className="rounded-lg p-2 hover:bg-gray-100">
              <ArrowRight size={20} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">خطأ</h1>
        </div>
        <div className="rounded-xl border bg-white py-16 text-center">
          <p className="text-red-500">{error}</p>
          <Link href="/dashboard/properties">
            <button className="mt-4 text-sm text-blue-600 hover:underline">
              العودة للعقارات
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (isEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/properties">
            <button className="rounded-lg p-2 hover:bg-gray-100">
              <ArrowRight size={20} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'إضافة عقار جديد' : 'تعديل العقار'}
          </h1>
        </div>
        <PropertyForm property={property} />
      </div>
    )
  }

  if (!property) return null

  const statusColors: Record<string, string> = {
    'متاح': 'bg-green-100 text-green-700',
    'محجوز': 'bg-yellow-100 text-yellow-700',
    'مباع': 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/properties">
            <button className="rounded-lg p-2 hover:bg-gray-100">
              <ArrowRight size={20} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[property.status] || 'bg-gray-100 text-gray-600'}`}>
            {property.status}
          </span>
        </div>
        <PermissionGate permission="properties:write">
          <Link href={`/dashboard/properties/${property.id}?edit=true`}>
            <Button variant="outline">
              <Edit2 size={16} className="ml-2" />
              تعديل
            </Button>
          </Link>
        </PermissionGate>
      </div>

      {/* Images */}
      {property.images && property.images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {property.images.map((img, i) => (
            <div key={i} className="aspect-video overflow-hidden rounded-xl bg-gray-100">
              <img src={img} alt={`${property.title} - ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Info cards */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">تفاصيل العقار</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-2">
                <Bed size={16} className="text-gray-400" />
                <span className="text-sm">{property.bedrooms} غرف</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath size={16} className="text-gray-400" />
                <span className="text-sm">{property.bathrooms} حمامات</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize size={16} className="text-gray-400" />
                <span className="text-sm">{property.area_sqm || '-'} م&sup2;</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-400" />
                <span className="text-sm">{property.views_count} مشاهدة</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-900">الوصف</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-900">المميزات</h3>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f, i) => (
                  <span key={i} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-3xl font-bold text-[#1a365d]">{formatPrice(property.price)}</p>
            <p className="mt-1 text-sm text-gray-500">{property.property_type} - {property.listing_type}</p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-900">الموقع</h3>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" />
              <div className="text-sm text-gray-600">
                <p>{property.city}{property.district ? ` - ${property.district}` : ''}</p>
                {property.address && <p className="mt-1">{property.address}</p>}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm text-xs text-gray-400">
            <p>تاريخ الإضافة: {formatDate(property.created_at)}</p>
            <p>آخر تحديث: {formatDate(property.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
