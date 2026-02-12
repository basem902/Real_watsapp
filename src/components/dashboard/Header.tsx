'use client'

import { Menu, LogOut } from 'lucide-react'
import { useOrg } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NotificationBell from './NotificationBell'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { organization, orgMember } = useOrg()
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
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {organization?.name || 'جاري التحميل...'}
          </h2>
          <p className="text-xs text-gray-500">
            {orgMember?.display_name || ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
          title="تسجيل الخروج"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
