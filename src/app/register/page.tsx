'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Building2, CheckCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'

type Step = 'form' | 'success'

const COMPANY_TYPE_OPTIONS = [
  { value: 'agency', label: 'مكتب عقاري' },
  { value: 'developer', label: 'شركة تطوير عقاري' },
  { value: 'individual', label: 'مسوّق فردي' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [organizationName, setOrganizationName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyType, setCompanyType] = useState('agency')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!organizationName.trim()) {
      newErrors.organizationName = 'اسم المكتب مطلوب'
    } else if (organizationName.trim().length < 2) {
      newErrors.organizationName = 'اسم المكتب يجب أن يكون حرفين على الأقل'
    }

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

    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: organizationName.trim(),
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          companyType,
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

      // Auto-login
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

      // Show success then redirect to dashboard (trial active)
      setStep('success')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch {
      toast.error('حدث خطأ في الاتصال. تحقق من اتصال الإنترنت')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">تم إنشاء الحساب بنجاح!</h2>
          <p className="text-gray-600">لديك فترة تجريبية مجانية لمدة 7 أيام</p>
          <p className="text-sm text-gray-500">جاري التوجيه إلى لوحة التحكم...</p>
          <div className="mt-4">
            <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-progress bg-primary rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">المساعد العقاري الذكي</h1>
          <p className="mt-2 text-gray-500">إنشاء حساب جديد لمكتبك العقاري</p>
          <p className="mt-1 text-xs text-blue-600">فترة تجريبية مجانية 7 أيام</p>
        </div>

        <Card className="shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="اسم المكتب / الشركة"
                type="text"
                placeholder="مثال: مكتب الأمانة العقاري"
                value={organizationName}
                onChange={(e) => {
                  setOrganizationName(e.target.value)
                  if (errors.organizationName) setErrors(prev => ({ ...prev, organizationName: '' }))
                }}
                required
              />
              {errors.organizationName && (
                <p className="mt-1 text-xs text-red-500">{errors.organizationName}</p>
              )}
            </div>

            <div>
              <Select
                label="نوع النشاط"
                options={COMPANY_TYPE_OPTIONS}
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="الاسم الكامل"
                type="text"
                placeholder="مثال: أحمد محمد"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }))
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
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
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
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
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
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب — تجريبي مجاني'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <ArrowLeft className="h-4 w-4" />
            <span>لديك حساب بالفعل؟</span>
            <Link href="/login" className="text-primary font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
