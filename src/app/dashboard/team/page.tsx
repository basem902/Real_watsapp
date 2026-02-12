'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserCog, Plus, Shield, Trash2, Link2, Copy, Clock, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useOrg, PermissionGate } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import type { OrgMember, OrgInvitation, PendingMember, Role } from '@/types'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils/formatters'

const ROLES: { label: string; value: Role }[] = [{ label: 'مالك', value: 'owner' }, { label: 'مدير', value: 'admin' }, { label: 'وكيل', value: 'agent' }, { label: 'مشاهد', value: 'viewer' }]

const INVITE_ROLES: { label: string; value: string }[] = [{ label: 'مدير', value: 'admin' }, { label: 'وكيل', value: 'agent' }, { label: 'مشاهد', value: 'viewer' }]

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

  // Invite links state
  const [inviteLinks, setInviteLinks] = useState<OrgInvitation[]>([])
  const [loadingLinks, setLoadingLinks] = useState(false)
  const [showGenerateLink, setShowGenerateLink] = useState(false)
  const [linkRole, setLinkRole] = useState('agent')
  const [linkMaxUses, setLinkMaxUses] = useState('')
  const [linkExpiresDays, setLinkExpiresDays] = useState('')
  const [generatingLink, setGeneratingLink] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')

  // Pending members state
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [loadingPending, setLoadingPending] = useState(false)
  const [processingMember, setProcessingMember] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('org_members').select('*').eq('organization_id', orgId).eq('is_active', true).order('created_at', { ascending: true })
    if (error) toast.error('خطأ في تحميل الفريق')
    setMembers((data || []) as OrgMember[])
    setLoading(false)
  }, [orgId])

  const fetchInviteLinks = useCallback(async () => {
    setLoadingLinks(true)
    try {
      const res = await fetch('/api/team/invite-link')
      const result = await res.json()
      if (result.success && result.data) {
        setInviteLinks(result.data as OrgInvitation[])
      }
    } catch {
      toast.error('خطأ في تحميل روابط الدعوة')
    }
    setLoadingLinks(false)
  }, [])

  const fetchPendingMembers = useCallback(async () => {
    if (!orgId) return
    setLoadingPending(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('pending_members')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
      if (!error && data) {
        setPendingMembers(data as PendingMember[])
      }
    } catch {
      // silent
    }
    setLoadingPending(false)
  }, [orgId])

  useEffect(() => { fetchMembers() }, [fetchMembers])
  useEffect(() => { fetchInviteLinks() }, [fetchInviteLinks])
  useEffect(() => {
    if (organization?.invite_approval_required) {
      fetchPendingMembers()
    }
  }, [organization?.invite_approval_required, fetchPendingMembers])

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطأ في إضافة العضو'
      toast.error(message)
    }
    setInviting(false)
  }

  const handleGenerateLink = async () => {
    setGeneratingLink(true)
    setGeneratedUrl('')
    try {
      const body: Record<string, unknown> = { default_role: linkRole }
      if (linkMaxUses) body.max_uses = Number(linkMaxUses)
      if (linkExpiresDays) body.expires_in_days = Number(linkExpiresDays)

      const res = await fetch('/api/team/invite-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      setGeneratedUrl(result.data.invite_url)
      toast.success('تم إنشاء رابط الدعوة')
      fetchInviteLinks()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطأ في إنشاء الرابط'
      toast.error(message)
    }
    setGeneratingLink(false)
  }

  const handleDeactivateLink = async (linkId: string) => {
    if (!confirm('هل أنت متأكد من تعطيل هذا الرابط؟')) return
    try {
      const res = await fetch('/api/team/invite-link', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: linkId }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success('تم تعطيل الرابط')
      fetchInviteLinks()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطأ في تعطيل الرابط'
      toast.error(message)
    }
  }

  const handleCopyLink = (code: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://real-watsapp.vercel.app'
    const url = `${baseUrl}/invite/${code}`
    navigator.clipboard.writeText(url)
    toast.success('تم نسخ الرابط')
  }

  const handleApproveMember = async (pendingId: string, userId: string, displayName: string) => {
    if (!orgId) return
    setProcessingMember(pendingId)
    try {
      const supabase = createClient()
      // Create org_member
      const { error: memberError } = await supabase
        .from('org_members')
        .insert({
          organization_id: orgId,
          user_id: userId,
          role: 'agent',
          display_name: displayName,
          is_active: true,
        })
      if (memberError) throw memberError

      // Update pending status
      const { error: updateError } = await supabase
        .from('pending_members')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentMember?.user_id || null,
        })
        .eq('id', pendingId)
      if (updateError) throw updateError

      toast.success('تمت الموافقة على العضو')
      fetchPendingMembers()
      fetchMembers()
    } catch {
      toast.error('خطأ في الموافقة على العضو')
    }
    setProcessingMember(null)
  }

  const handleRejectMember = async (pendingId: string) => {
    if (!confirm('هل أنت متأكد من رفض هذا العضو؟')) return
    setProcessingMember(pendingId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('pending_members')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentMember?.user_id || null,
        })
        .eq('id', pendingId)
      if (error) throw error

      toast.success('تم رفض العضو')
      fetchPendingMembers()
    } catch {
      toast.error('خطأ في رفض العضو')
    }
    setProcessingMember(null)
  }

  const roleLabels: Record<string, string> = { owner: 'مالك', admin: 'مدير', agent: 'وكيل', viewer: 'مشاهد' }

  const activeLinks = inviteLinks.filter((l) => l.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">الفريق</h1>
        <PermissionGate permission="team:manage"><Button onClick={() => setShowInvite(true)}><Plus size={16} className="me-2" />إضافة عضو</Button></PermissionGate>
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

      {/* ===== Invite Links Section ===== */}
      <PermissionGate permission="team:manage">
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Link2 size={20} />
              روابط الدعوة
            </h2>
            <Button size="sm" onClick={() => { setShowGenerateLink(true); setGeneratedUrl(''); setLinkRole('agent'); setLinkMaxUses(''); setLinkExpiresDays('') }}>
              <Plus size={14} className="me-1" />
              إنشاء رابط
            </Button>
          </div>

          {loadingLinks ? (
            <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : activeLinks.length === 0 ? (
            <div className="rounded-xl border bg-white py-10 text-center">
              <Link2 size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 text-gray-500 text-sm">لا توجد روابط دعوة نشطة</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50 text-right">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">الرابط</th>
                    <th className="px-4 py-3 font-medium text-gray-600">الدور</th>
                    <th className="px-4 py-3 font-medium text-gray-600">الاستخدام</th>
                    <th className="px-4 py-3 font-medium text-gray-600">الصلاحية</th>
                    <th className="px-4 py-3 font-medium text-gray-600">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLinks.map((link) => {
                    const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
                    const isMaxed = link.max_uses !== null && link.used_count >= link.max_uses
                    return (
                      <tr key={link.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 max-w-[200px] truncate" dir="ltr">
                              /invite/{link.invite_code}
                            </code>
                            <button onClick={() => handleCopyLink(link.invite_code)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-[#1a365d]" title="نسخ الرابط">
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={link.default_role === 'admin' ? 'info' : link.default_role === 'agent' ? 'success' : 'warning'}>
                            {roleLabels[link.default_role] || link.default_role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {link.used_count} / {link.max_uses !== null ? link.max_uses : 'غير محدود'}
                          {isMaxed && <Badge variant="danger" className="ms-2">مكتمل</Badge>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {link.expires_at ? (
                            <span className={isExpired ? 'text-red-500' : ''}>
                              {isExpired ? 'منتهي' : new Date(link.expires_at).toLocaleDateString('ar-SA')}
                            </span>
                          ) : (
                            <span className="text-gray-400">بدون حد</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeactivateLink(link.id)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600" title="تعطيل الرابط">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PermissionGate>

      {/* ===== Pending Members Section ===== */}
      {organization?.invite_approval_required && (
        <PermissionGate permission="team:manage">
          <div className="border-t pt-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Clock size={20} />
              الأعضاء بانتظار الموافقة
            </h2>

            {loadingPending ? (
              <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
            ) : pendingMembers.length === 0 ? (
              <div className="rounded-xl border bg-white py-10 text-center">
                <Users size={36} className="mx-auto text-gray-300" />
                <p className="mt-3 text-gray-500 text-sm">لا يوجد أعضاء بانتظار الموافقة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMembers.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-700">
                        {pm.display_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{pm.display_name}</p>
                        <p className="text-xs text-gray-400">طلب الانضمام {new Date(pm.requested_at).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {processingMember === pm.id ? (
                        <Loader2 size={18} className="animate-spin text-gray-400" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleApproveMember(pm.id, pm.user_id, pm.display_name)}
                            className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 transition-colors"
                            title="موافقة"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleRejectMember(pm.id)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                            title="رفض"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PermissionGate>
      )}

      {/* ===== Add Member Modal ===== */}
      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="إضافة عضو جديد">
        <div className="space-y-4">
          <Input label="البريد الإلكتروني *" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" />
          <Input label="الاسم" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="اسم العضو" />
          <Select label="الدور" value={inviteRole} onChange={e => setInviteRole(e.target.value as Role)} options={ROLES.filter(r => r.value !== 'owner')} />
          <div className="flex gap-3 pt-2"><Button onClick={handleInvite} loading={inviting}>إضافة</Button><Button variant="outline" onClick={() => setShowInvite(false)}>إلغاء</Button></div>
        </div>
      </Modal>

      {/* ===== Generate Invite Link Modal ===== */}
      <Modal isOpen={showGenerateLink} onClose={() => setShowGenerateLink(false)} title="إنشاء رابط دعوة" size="md">
        <div className="space-y-4">
          {!generatedUrl ? (
            <>
              <Select
                label="الدور الافتراضي"
                value={linkRole}
                onChange={e => setLinkRole(e.target.value)}
                options={INVITE_ROLES}
              />
              <Input
                label="الحد الأقصى للاستخدام (اختياري)"
                type="number"
                value={linkMaxUses}
                onChange={e => setLinkMaxUses(e.target.value)}
                placeholder="مثال: 10"
                min={1}
              />
              <Input
                label="صلاحية بالأيام (اختياري)"
                type="number"
                value={linkExpiresDays}
                onChange={e => setLinkExpiresDays(e.target.value)}
                placeholder="مثال: 7"
                min={1}
                max={365}
              />
              <div className="flex gap-3 pt-2">
                <Button onClick={handleGenerateLink} loading={generatingLink}>
                  <Link2 size={16} className="me-2" />
                  إنشاء الرابط
                </Button>
                <Button variant="outline" onClick={() => setShowGenerateLink(false)}>إلغاء</Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">تم إنشاء رابط الدعوة بنجاح. شاركه مع الموظفين الجدد:</p>
              <div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3">
                <code className="flex-1 text-sm text-[#1a365d] break-all" dir="ltr">{generatedUrl}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedUrl); toast.success('تم نسخ الرابط') }}
                  className="shrink-0 rounded-lg bg-[#1a365d] p-2 text-white hover:bg-[#1a365d]/90 transition-colors"
                  title="نسخ الرابط"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowGenerateLink(false)}>إغلاق</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
