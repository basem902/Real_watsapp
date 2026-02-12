'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      if (user.user_metadata?.is_super_admin !== true) { router.push('/dashboard'); return }
      setAdminEmail(user.email || '')
      setLoading(false)
    }
    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50" dir="rtl">
        <div className="hidden lg:block w-64 bg-white border-l">
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 rounded-lg" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-9 rounded-lg" />)}
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="h-16 bg-white border-b flex items-center px-6">
            <Skeleton className="h-8 w-48 rounded-lg" />
          </div>
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      <Toaster position="top-left" toastOptions={{ duration: 4000 }} />
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} adminEmail={adminEmail} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
