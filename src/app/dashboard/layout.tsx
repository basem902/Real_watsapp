'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { OrgProvider } from '@/components/providers/OrgProvider'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <OrgProvider>
      <Toaster position="top-left" toastOptions={{ duration: 4000 }} />
      <div className="flex h-screen bg-gray-50" dir="rtl">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </OrgProvider>
  )
}
