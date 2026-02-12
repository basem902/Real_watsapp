'use client'

import { Menu, LogOut, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  onMenuClick: () => void
  adminEmail: string
}

export default function AdminHeader({ onMenuClick, adminEmail }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-purple-600" />
          <h2 className="text-sm font-semibold text-gray-900">
            لوحة إدارة المنصة
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hidden sm:inline">
          {adminEmail}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
          title="تسجيل الخروج"
          aria-label="تسجيل الخروج"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  )
}
