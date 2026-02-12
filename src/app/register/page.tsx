'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function RegisterPage() {
  const router = useRouter()
  const [organizationName, setOrganizationName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!organizationName || !fullName || !email || !password) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    if (password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    setLoading(true)
    try {
      // 1. Register via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationName, fullName, email, password }),
      })

      const result = await res.json()
      if (!result.success) {
        toast.error(result.error || 'فشل إنشاء الحساب')
        return
      }

      // 2. Auto-login
      const supabase = createClient()
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        toast.error('تم إنشاء الحساب لكن فشل تسجيل الدخول التلقائي. يرجى تسجيل الدخول يدويًا.')
        router.push('/login')
        return
      }

      toast.success('تم إنشاء الحساب بنجاح')
      router.push('/dashboard')
    } catch {
      toast.error('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">المساعد العقاري الذكي</h1>
          <p className="mt-2 text-gray-600">إنشاء حساب جديد</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="اسم المكتب / الشركة"
              type="text"
              placeholder="مثال: مكتب الأمانة العقاري"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
            />

            <Input
              label="الاسم الكامل"
              type="text"
              placeholder="مثال: أحمد محمد"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              required
            />

            <Input
              label="كلمة المرور"
              type="password"
              placeholder="8 أحرف على الأقل"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              minLength={8}
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              إنشاء حساب
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
