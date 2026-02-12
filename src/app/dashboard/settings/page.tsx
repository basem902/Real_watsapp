'use client'

import { useState, useEffect } from 'react'
import { Settings, Bot, Link as LinkIcon, BarChart3, Save } from 'lucide-react'
import { useOrg } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import type { OrgSettings, OrgIntegrations, UsageTracking } from '@/types'
import toast from 'react-hot-toast'

type Tab = 'info' | 'bot' | 'integrations' | 'usage'

export default function SettingsPage() {
  const { organization, settings: orgSettings } = useOrg()
  const orgId = organization?.id
  const [tab, setTab] = useState<Tab>('info')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<OrgSettings | null>(null)
  const [integrations, setIntegrations] = useState<Partial<OrgIntegrations>>({})
  const [orgInfo, setOrgInfo] = useState({ name: '', primary_color: '#1a365d', invite_approval_required: false })
  const [usage, setUsage] = useState<UsageTracking | null>(null)

  useEffect(() => {
    if (!orgId) return
    const supabase = createClient()
    const fetchAll = async () => {
      setLoading(true)
      const [settingsRes, integrationsRes, orgRes, usageRes] = await Promise.all([
        supabase.from('org_settings').select('*').eq('organization_id', orgId).single(),
        supabase.from('org_integrations').select('organization_id, wasender_instance_id, wasender_verified, wasender_api_key').eq('organization_id', orgId).single(),
        supabase.from('organizations').select('name, primary_color, invite_approval_required').eq('id', orgId).single(),
        supabase.from('usage_tracking').select('*').eq('organization_id', orgId).order('month', { ascending: false }).limit(1).single(),
      ])
      if (settingsRes.data) setSettings(settingsRes.data as OrgSettings)
      if (integrationsRes.data) setIntegrations(integrationsRes.data)
      if (orgRes.data) setOrgInfo({ name: orgRes.data.name, primary_color: orgRes.data.primary_color || '#1a365d', invite_approval_required: orgRes.data.invite_approval_required ?? false })
      if (usageRes.data) setUsage(usageRes.data as UsageTracking)
      setLoading(false)
    }
    fetchAll()
  }, [orgId])

  const saveOrgInfo = async () => { if (!orgId) return; setSaving(true); const supabase = createClient(); const { error } = await supabase.from('organizations').update(orgInfo).eq('id', orgId); setSaving(false); if (error) toast.error(error.message); else toast.success('تم حفظ المعلومات') }
  const saveBotSettings = async () => { if (!orgId || !settings) return; setSaving(true); const supabase = createClient(); const { error } = await supabase.from('org_settings').update({ bot_name: settings.bot_name, bot_enabled: settings.bot_enabled, welcome_message: settings.welcome_message, ai_model: settings.ai_model, ai_temperature: settings.ai_temperature, max_ai_tokens: settings.max_ai_tokens, working_hours_start: settings.working_hours_start, working_hours_end: settings.working_hours_end }).eq('organization_id', orgId); setSaving(false); if (error) toast.error(error.message); else toast.success('تم حفظ إعدادات البوت') }
  const saveIntegrations = async () => { if (!orgId) return; setSaving(true); const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ integrations }) }); setSaving(false); if (!res.ok) toast.error('خطأ في حفظ التكاملات'); else toast.success('تم حفظ التكاملات') }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [{ id: 'info', label: 'المعلومات', icon: <Settings size={16} /> }, { id: 'bot', label: 'البوت', icon: <Bot size={16} /> }, { id: 'integrations', label: 'التكاملات', icon: <LinkIcon size={16} /> }, { id: 'usage', label: 'الاستخدام', icon: <BarChart3 size={16} /> }]

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">{tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'bg-white shadow text-[#1a365d]' : 'text-gray-500 hover:text-gray-700'}`}>{t.icon}{t.label}</button>)}</div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        {tab === 'info' && <div className="space-y-4 max-w-lg"><h3 className="font-semibold text-gray-900">معلومات المنظمة</h3><Input label="اسم المنظمة" value={orgInfo.name} onChange={e => setOrgInfo(p => ({ ...p, name: e.target.value }))} /><Input label="اللون الأساسي" type="color" value={orgInfo.primary_color} onChange={e => setOrgInfo(p => ({ ...p, primary_color: e.target.value }))} /><div className="border-t pt-4"><div className="flex items-start gap-3"><input type="checkbox" id="invite_approval" checked={orgInfo.invite_approval_required} onChange={e => setOrgInfo(p => ({ ...p, invite_approval_required: e.target.checked }))} className="mt-1 h-4 w-4 rounded border-gray-300" /><div><label htmlFor="invite_approval" className="text-sm font-medium text-gray-700 cursor-pointer">طلب موافقة على الأعضاء الجدد</label><p className="text-xs text-gray-500 mt-1">عند التفعيل، يحتاج الموظفون الذين يسجلون عبر رابط الدعوة إلى موافقتك قبل الدخول</p></div></div></div><Button onClick={saveOrgInfo} loading={saving}><Save size={16} className="me-2" />حفظ</Button></div>}
        {tab === 'bot' && settings && <div className="space-y-4 max-w-lg"><h3 className="font-semibold text-gray-900">إعدادات البوت</h3><Input label="اسم البوت" value={settings.bot_name} onChange={e => setSettings(p => p ? { ...p, bot_name: e.target.value } : p)} /><div className="flex items-center gap-3"><label className="text-sm font-medium text-gray-700">البوت مفعل</label><input type="checkbox" checked={settings.bot_enabled} onChange={e => setSettings(p => p ? { ...p, bot_enabled: e.target.checked } : p)} className="h-4 w-4 rounded border-gray-300" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">رسالة الترحيب</label><textarea value={settings.welcome_message} onChange={e => setSettings(p => p ? { ...p, welcome_message: e.target.value } : p)} rows={3} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div><Select label="نموذج AI" value={settings.ai_model} onChange={e => setSettings(p => p ? { ...p, ai_model: e.target.value } : p)} options={[{ label: 'GPT-4o Mini', value: 'gpt-4o-mini' }, { label: 'GPT-4o', value: 'gpt-4o' }]} /><Input label="درجة الحرارة" type="number" value={settings.ai_temperature} onChange={e => setSettings(p => p ? { ...p, ai_temperature: Number(e.target.value) } : p)} min={0} max={2} step={0.1} /><div className="grid grid-cols-2 gap-4"><Input label="بداية العمل" type="time" value={settings.working_hours_start} onChange={e => setSettings(p => p ? { ...p, working_hours_start: e.target.value } : p)} /><Input label="نهاية العمل" type="time" value={settings.working_hours_end} onChange={e => setSettings(p => p ? { ...p, working_hours_end: e.target.value } : p)} /></div><Button onClick={saveBotSettings} loading={saving}><Save size={16} className="me-2" />حفظ</Button></div>}
        {tab === 'integrations' && <div className="space-y-4 max-w-lg"><h3 className="font-semibold text-gray-900">تكاملات Wasender</h3><Input label="Instance ID" value={integrations.wasender_instance_id || ''} onChange={e => setIntegrations(p => ({ ...p, wasender_instance_id: e.target.value }))} /><Input label="API Key" type="password" value={integrations.wasender_api_key || ''} onChange={e => setIntegrations(p => ({ ...p, wasender_api_key: e.target.value }))} /><div className="flex items-center gap-2 text-sm"><span className={`h-2 w-2 rounded-full ${integrations.wasender_verified ? 'bg-green-500' : 'bg-red-500'}`} /><span className="text-gray-600">{integrations.wasender_verified ? 'متصل' : 'غير متصل'}</span></div><Button onClick={saveIntegrations} loading={saving}><Save size={16} className="me-2" />حفظ</Button></div>}
        {tab === 'usage' && <div className="space-y-4"><h3 className="font-semibold text-gray-900">استخدام الشهر الحالي</h3>{usage ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><div className="rounded-lg bg-gray-50 p-4 text-center"><p className="text-2xl font-bold text-gray-900">{usage.conversations_count}</p><p className="text-xs text-gray-500 mt-1">محادثات</p></div><div className="rounded-lg bg-gray-50 p-4 text-center"><p className="text-2xl font-bold text-gray-900">{usage.ai_calls_count}</p><p className="text-xs text-gray-500 mt-1">استدعاءات AI</p></div><div className="rounded-lg bg-gray-50 p-4 text-center"><p className="text-2xl font-bold text-gray-900">{usage.whatsapp_messages_sent}</p><p className="text-xs text-gray-500 mt-1">رسائل مرسلة</p></div><div className="rounded-lg bg-gray-50 p-4 text-center"><p className="text-2xl font-bold text-gray-900">{usage.properties_count}</p><p className="text-xs text-gray-500 mt-1">عقارات</p></div></div> : <p className="text-sm text-gray-500">لا توجد بيانات استخدام</p>}</div>}
      </div>
    </div>
  )
}
