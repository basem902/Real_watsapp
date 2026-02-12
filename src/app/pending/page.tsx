'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Clock, XCircle, AlertTriangle, RefreshCw, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type OrgStatusType = 'pending' | 'trial_expired' | 'rejected' | 'suspended' | 'unknown'

const STATUS_CONFIG: Record<OrgStatusType, {
  icon: typeof Clock
  iconColor: string
  bgColor: string
  title: string
  description: string
}> = {
  pending: {
    icon: Clock,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    title: 'حسابك في انتظار الموافقة',
    description: 'تم إنشاء حسابك بنجاح وهو قيد المراجعة. سيتم إشعارك عند الموافقة.',
  },
  trial_expired: {
    icon: Clock,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    title: 'انتهت الفترة التجريبية',
    description: 'انتهت فترتك التجريبية المجانية (7 أيام). يرجى انتظار موافقة الإدارة لتفعيل حسابك.',
  },
  rejected: {
    icon: XCircle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    title: 'تم رفض الطلب',
    description: 'للأسف تم رفض طلب التسجيل. يمكنك التواصل مع الإدارة لمزيد من التفاصيل.',
  },
  suspended: {
    icon: AlertTriangle,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-100',
    title: 'تم تعليق الحساب',
    description: 'تم تعليق حسابك مؤقتاً. تواصل مع إدارة المنصة لإعادة التفعيل.',
  },
  unknown: {
    icon: AlertTriangle,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-100',
    title: 'حالة الحساب غير معروفة',
    description: 'حدث خطأ في التحقق من حالة الحساب. حاول إعادة تسجيل الدخول.',
  },
}

function PendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status') as OrgStatusType || 'pending'
  const [checking, setChecking] = useState(false)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)

  const config = STATUS_CONFIG[statusParam] || STATUS_CONFIG.unknown
  const IconComponent = config.icon

  useEffect(() => {
    if (statusParam === 'rejected') {
      const fetchReason = async () => {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          const { data: member } = await supabase
            .from('org_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .single()

          if (member) {
            const { data: org } = await supabase
              .from('organizations')
              .select('rejection_reason')
              .eq('id', member.organization_id)
              .single()
            if (org?.rejection_reason) {
              setRejectionReason(org.rejection_reason)
            }
          }
        } catch { /* ignore */ }
      }
      fetchReason()
    }
  }, [statusParam])

  const handleCheckStatus = async () => {
    setChecking(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: member } = await supabase
        .from('org_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!member) {
        router.push('/login')
        return
      }

      const { data: org } = await supabase
        .from('organizations')
        .select('status, trial_ends_at')
        .eq('id', member.organization_id)
        .single()

      if (!org) return

      if (org.status === 'active') {
        router.push('/dashboard')
        return
      }

      if (org.status === 'trial') {
        const trialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : null
        if (trialEnd && trialEnd > new Date()) {
          router.push('/dashboard')
          return
        }
      }

      router.replace(`/pending?status=${org.status === 'trial' ? 'trial_expired' : org.status}`)
    } catch {
      // ignore
    } finally {
      setChecking(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-lg text-center">
        <div className="space-y-6 py-4">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${config.bgColor}`}>
            <IconComponent className={`h-10 w-10 ${config.iconColor}`} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-500 text-sm">{config.description}</p>
            {rejectionReason && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <strong>السبب:</strong> {rejectionReason}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleCheckStatus}
              loading={checking}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 me-2" />
              التحقق من الحالة
            </Button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
      <Suspense fallback={
        <div className="w-full max-w-md">
          <Card className="shadow-lg text-center">
            <div className="space-y-6 py-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 animate-pulse" />
              <div className="space-y-2">
                <div className="mx-auto h-6 w-48 rounded bg-gray-100 animate-pulse" />
                <div className="mx-auto h-4 w-64 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          </Card>
        </div>
      }>
        <PendingContent />
      </Suspense>
    </div>
  )
}
