'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Building2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

// Translate Supabase auth errors to Arabic
function translateLoginError(message: string): string {
  if (message === 'Invalid login credentials') {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  }
  if (message.includes('Email not confirmed')) {
    return 'لم يتم تأكيد البريد الإلكتروني بعد'
  }
  if (message.includes('too many requests') || message.includes('rate limit')) {
    return 'تم تجاوز عدد المحاولات. حاول بعد دقائق'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'خطأ في الاتصال. تحقق من اتصال الإنترنت'
  }
  if (message.includes('User not found') || message.includes('no user')) {
    return 'لم يتم العثور على حساب بهذا البريد الإلكتروني'
  }
  return 'حدث خطأ في تسجيل الدخول. حاول مرة أخرى'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة'
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
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        const translated = translateLoginError(error.message)
        toast.error(translated)
        return
      }

      toast.success('تم تسجيل الدخول بنجاح')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('حدث خطأ في الاتصال. تحقق من اتصال الإنترنت')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">المساعد العقاري الذكي</h1>
          <p className="mt-2 text-gray-500">تسجيل الدخول إلى حسابك</p>
        </div>

        <Card className="shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                }}
                dir="ltr"
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
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <ArrowLeft className="h-4 w-4" />
            <span>ليس لديك حساب؟</span>
            <Link href="/register" className="text-primary font-medium hover:underline">
              إنشاء حساب جديد
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
