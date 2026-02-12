'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { OrgProvider, useOrg } from '@/components/providers/OrgProvider'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import Skeleton from '@/components/ui/Skeleton'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { loading, error, reload } = useOrg()

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50" dir="rtl">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-64 bg-white border-l">
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 rounded-lg" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-9 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        {/* Main content skeleton */}
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

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="max-w-md text-center space-y-4 p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">مشكلة في تحميل البيانات</h2>
          <p className="text-gray-500">{error}</p>
          <Button onClick={() => reload()} className="mx-auto">
            <RefreshCw className="h-4 w-4 me-2" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrgProvider>
      <Toaster position="top-left" toastOptions={{ duration: 4000 }} />
      <DashboardContent>{children}</DashboardContent>
    </OrgProvider>
  )
}
