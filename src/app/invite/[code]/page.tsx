'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Building2, CheckCircle, AlertCircle, Shield, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'

interface InviteInfo {
  invite_valid: boolean
  org_name?: string
  company_type?: string
  default_role?: string
  reason?: string
}

const COMPANY_TYPE_LABELS: Record<string, string> = {
  agency: 'مكتب عقاري',
  developer: 'شركة تطوير عقاري',
  individual: 'مسوّق فردي',
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'مدير',
  agent: 'وكيل',
  viewer: 'مشاهد',
}

const ROLE_BADGE_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  admin: 'info',
  agent: 'success',
  viewer: 'warning',
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [loading, setLoading] = useState(true)
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<'joined' | 'pending_approval' | null>(null)

  useEffect(() => {
    const validateInvite = async () => {
      try {
        const res = await fetch(`/api/invite/${code}`)
        const result = await res.json()
        if (result.success && result.data) {
          setInviteInfo(result.data)
        } else {
          setInviteInfo({ invite_valid: false, reason: 'رمز الدعوة غير صالح' })
        }
      } catch {
        setInviteInfo({ invite_valid: false, reason: 'حدث خطأ في التحقق من الرابط' })
      }
      setLoading(false)
    }
    validateInvite()
  }, [code])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب'
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'الاسم يجب أن يكون حرفين على الأقل'
    }

    if (!email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة'
    } else if (password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setErrors({})

    try {
      const res = await fetch('/api/auth/register-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          invite_code: code,
        }),
      })

      const result = await res.json()

      if (!result.success) {
        if (res.status === 409) {
          setErrors({ email: result.error })
        } else {
          toast.error(result.error || 'فشل إنشاء الحساب')
        }
        return
      }

      const status = result.data?.status as 'joined' | 'pending_approval'
      setSuccess(status)

      if (status === 'joined') {
        // Auto-login and redirect to dashboard
        const supabase = createClient()
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })

        if (loginError) {
          toast.error('تم إنشاء الحساب لكن فشل تسجيل الدخول التلقائي')
          router.push('/login')
          return
        }

        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        // Pending approval
        setTimeout(() => {
          router.push('/pending?status=pending')
        }, 3000)
      }
    } catch {
      toast.error('حدث خطأ في الاتصال. تحقق من اتصال الإنترنت')
    } finally {
      setSubmitting(false)
    }
  }

  // ===== Loading State =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#1a365d] mx-auto" />
          <p className="text-gray-500">جاري التحقق من رابط الدعوة...</p>
        </div>
      </div>
    )
  }

  // ===== Invalid Invite =====
  if (!inviteInfo?.invite_valid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="w-full max-w-md">
          <Card className="shadow-lg text-center">
            <div className="space-y-6 py-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-gray-900">رابط الدعوة غير صالح</h1>
                <p className="text-gray-500 text-sm">
                  {inviteInfo?.reason || 'رمز الدعوة غير صحيح أو منتهي الصلاحية'}
                </p>
              </div>
              <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                الذهاب لتسجيل الدخول
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ===== Success State =====
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          {success === 'joined' ? (
            <>
              <h2 className="text-xl font-bold text-gray-900">تم التسجيل بنجاح!</h2>
              <p className="text-gray-600">تم انضمامك إلى {inviteInfo.org_name}</p>
              <p className="text-sm text-gray-500">جاري التوجيه إلى لوحة التحكم...</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900">تم إرسال طلب الانضمام</h2>
              <p className="text-gray-600">
                طلبك للانضمام إلى {inviteInfo.org_name} بانتظار موافقة المدير
              </p>
              <p className="text-sm text-gray-500">سيتم إشعارك عند الموافقة على طلبك...</p>
            </>
          )}
          <div className="mt-4">
            <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-progress bg-[#1a365d] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== Registration Form =====
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1a365d]/10">
            <Building2 className="h-7 w-7 text-[#1a365d]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">انضم إلى {inviteInfo.org_name}</h1>
          <p className="mt-2 text-gray-500">تمت دعوتك للانضمام كعضو في الفريق</p>

          <div className="mt-4 flex items-center justify-center gap-3">
            {inviteInfo.company_type && (
              <Badge variant="default">
                {COMPANY_TYPE_LABELS[inviteInfo.company_type] || inviteInfo.company_type}
              </Badge>
            )}
            {inviteInfo.default_role && (
              <Badge variant={ROLE_BADGE_VARIANT[inviteInfo.default_role] || 'default'}>
                <Shield size={12} className="me-1" />
                {ROLE_LABELS[inviteInfo.default_role] || inviteInfo.default_role}
              </Badge>
            )}
          </div>
        </div>

        <Card className="shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="الاسم الكامل"
                type="text"
                placeholder="مثال: أحمد محمد"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }))
                }}
                required
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                }}
                dir="ltr"
                required
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <Input
                label="كلمة المرور"
                type="password"
                placeholder="8 أحرف على الأقل"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                }}
                dir="ltr"
                minLength={8}
                required
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              loading={submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب والانضمام'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <span>لديك حساب بالفعل؟ </span>
            <a href="/login" className="text-[#1a365d] font-medium hover:underline">
              تسجيل الدخول
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
