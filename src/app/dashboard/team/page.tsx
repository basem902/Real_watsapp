'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserCog, Plus, Shield, Trash2 } from 'lucide-react'
import { useOrg, PermissionGate } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import type { OrgMember, Role } from '@/types'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils/formatters'

const ROLES: { label: string; value: Role }[] = [{ label: 'مالك', value: 'owner' }, { label: 'مدير', value: 'admin' }, { label: 'وكيل', value: 'agent' }, { label: 'مشاهد', value: 'viewer' }]

export default function TeamPage() {
  const { organization, orgMember: currentMember } = useOrg()
  const orgId = organization?.id
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('agent')
  const [inviting, setInviting] = useState(false)

  const fetchMembers = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('org_members').select('*').eq('organization_id', orgId).eq('is_active', true).order('created_at', { ascending: true })
    if (error) toast.error('خطأ في تحميل الفريق')
    setMembers((data || []) as OrgMember[])
    setLoading(false)
  }, [orgId])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    const supabase = createClient()
    const { error } = await supabase.from('org_members').update({ role: newRole }).eq('id', memberId)
    if (error) toast.error('خطأ في تحديث الدور')
    else { toast.success('تم تحديث الدور'); fetchMembers() }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا العضو؟')) return
    const supabase = createClient()
    const { error } = await supabase.from('org_members').update({ is_active: false }).eq('id', memberId)
    if (error) toast.error('خطأ في إزالة العضو')
    else { toast.success('تم إزالة العضو'); fetchMembers() }
  }

  const handleInvite = async () => {
    if (!inviteEmail) { toast.error('البريد الإلكتروني مطلوب'); return }
    setInviting(true)
    try {
      const res = await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail, display_name: inviteName, role: inviteRole }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('تمت إضافة العضو')
      setShowInvite(false); setInviteEmail(''); setInviteName(''); setInviteRole('agent')
      fetchMembers()
    } catch (err: any) { toast.error(err.message || 'خطأ في إضافة العضو') }
    setInviting(false)
  }

  const roleLabels: Record<string, string> = { owner: 'مالك', admin: 'مدير', agent: 'وكيل', viewer: 'مشاهد' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">الفريق</h1>
        <PermissionGate permission="team:manage"><Button onClick={() => setShowInvite(true)}><Plus size={16} className="ml-2" />إضافة عضو</Button></PermissionGate>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : members.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center"><UserCog size={48} className="mx-auto text-gray-300" /><p className="mt-4 text-gray-500">لا يوجد أعضاء</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-right"><tr><th className="px-4 py-3 font-medium text-gray-600">الاسم</th><th className="px-4 py-3 font-medium text-gray-600">الدور</th><th className="px-4 py-3 font-medium text-gray-600">تاريخ الإنضمام</th><th className="px-4 py-3 font-medium text-gray-600">الإجراءات</th></tr></thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a365d] text-xs text-white font-bold">{(member.display_name || '?')[0]}</div><span className="font-medium text-gray-900">{member.display_name || 'بدون اسم'}</span></div></td>
                  <td className="px-4 py-3">{member.role === 'owner' ? <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700"><Shield size={12} />مالك</span> : <PermissionGate permission="team:manage" fallback={<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"><Shield size={12} />{roleLabels[member.role]}</span>}><select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value as Role)} className="rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer bg-gray-100">{ROLES.filter(r => r.value !== 'owner').map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></PermissionGate>}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(member.created_at)}</td>
                  <td className="px-4 py-3">{member.role !== 'owner' && member.id !== currentMember?.id && <PermissionGate permission="team:manage"><button onClick={() => handleRemove(member.id)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"><Trash2 size={16} /></button></PermissionGate>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="إضافة عضو جديد">
        <div className="space-y-4">
          <Input label="البريد الإلكتروني *" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" />
          <Input label="الاسم" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="اسم العضو" />
          <Select label="الدور" value={inviteRole} onChange={e => setInviteRole(e.target.value as Role)} options={ROLES.filter(r => r.value !== 'owner')} />
          <div className="flex gap-3 pt-2"><Button onClick={handleInvite} loading={inviting}>إضافة</Button><Button variant="outline" onClick={() => setShowInvite(false)}>إلغاء</Button></div>
        </div>
      </Modal>
    </div>
  )
}
