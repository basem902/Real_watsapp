'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrg } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Property, PropertyType, ListingType, PropertyStatus } from '@/types'
import toast from 'react-hot-toast'

interface PropertyFormProps {
  property?: Property | null
}

const PROPERTY_TYPES: PropertyType[] = ['\u0634\u0642\u0629', '\u0641\u064a\u0644\u0627', '\u062f\u0648\u0628\u0644\u0643\u0633', '\u0623\u0631\u0636', '\u0645\u0643\u062a\u0628', '\u0645\u062d\u0644 \u062a\u062c\u0627\u0631\u064a']
const LISTING_TYPES: ListingType[] = ['\u0628\u064a\u0639', '\u0625\u064a\u062c\u0627\u0631']
const STATUS_OPTIONS: PropertyStatus[] = ['\u0645\u062a\u0627\u062d', '\u0645\u062d\u062c\u0648\u0632', '\u0645\u0628\u0627\u0639']

export default function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const { organization, orgMember } = useOrg()
  const orgId = organization?.id
  const userId = orgMember?.user_id
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: property?.title || '',
    description: property?.description || '',
    property_type: property?.property_type || '\u0634\u0642\u0629',
    listing_type: property?.listing_type || '\u0628\u064a\u0639',
    price: property?.price || 0,
    area_sqm: property?.area_sqm || 0,
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    city: property?.city || '',
    district: property?.district || '',
    address: property?.address || '',
    features: property?.features?.join(', ') || '',
    status: property?.status || '\u0645\u062a\u0627\u062d',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    setSaving(true)

    const supabase = createClient()
    const payload = {
      organization_id: orgId,
      title: form.title,
      description: form.description || null,
      property_type: form.property_type as PropertyType,
      listing_type: form.listing_type as ListingType,
      price: Number(form.price),
      area_sqm: Number(form.area_sqm) || null,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      city: form.city,
      district: form.district || null,
      address: form.address || null,
      features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
      status: form.status as PropertyStatus,
      created_by: userId || null,
    }

    let error
    if (property) {
      ;({ error } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', property.id))
    } else {
      ;({ error } = await supabase
        .from('properties')
        .insert(payload))
    }

    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(property ? 'تم تحديث العقار' : 'تم إضافة العقار')
      router.push('/dashboard/properties')
    }
  }

  const update = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="عنوان العقار *" value={form.title} onChange={e => update('title', e.target.value)} required />
        <Input label="المدينة *" value={form.city} onChange={e => update('city', e.target.value)} required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          label="نوع العقار"
          value={form.property_type}
          onChange={e => update('property_type', e.target.value)}
          options={PROPERTY_TYPES.map(t => ({ label: t, value: t }))}
        />
        <Select
          label="الغرض"
          value={form.listing_type}
          onChange={e => update('listing_type', e.target.value)}
          options={LISTING_TYPES.map(t => ({ label: t, value: t }))}
        />
        <Select
          label="الحالة"
          value={form.status}
          onChange={e => update('status', e.target.value)}
          options={STATUS_OPTIONS.map(s => ({ label: s, value: s }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Input label="السعر (ر.س) *" type="number" value={form.price} onChange={e => update('price', e.target.value)} required />
        <Input label="المساحة (م&sup2;)" type="number" value={form.area_sqm} onChange={e => update('area_sqm', e.target.value)} />
        <Input label="غرف النوم" type="number" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} min={0} />
        <Input label="الحمامات" type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} min={0} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="الحي" value={form.district} onChange={e => update('district', e.target.value)} />
        <Input label="العنوان التفصيلي" value={form.address} onChange={e => update('address', e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
        <textarea
          value={form.description}
          onChange={e => update('description', e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <Input
        label="المميزات (مفصولة بفاصلة)"
        value={form.features}
        onChange={e => update('features', e.target.value)}
        placeholder="مسبح, حديقة, موقف سيارات, مصعد"
      />

      <div className="flex items-center gap-3 pt-4 border-t">
        <Button type="submit" loading={saving}>
          {property ? 'حفظ التعديلات' : 'إضافة العقار'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/properties')}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
