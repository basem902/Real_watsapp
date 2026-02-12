'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  X,
  Shield,
} from 'lucide-react'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'لوحة التحكم', href: '/admin', icon: <LayoutDashboard size={20} /> },
  { label: 'الشركات', href: '/admin/companies', icon: <Building2 size={20} /> },
]

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed right-0 top-0 z-50 h-full w-64 bg-[#2d1b69] text-white transition-transform duration-300
          lg:static lg:translate-x-0
          ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-purple-300" />
            <h1 className="text-lg font-bold">إدارة المنصة</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white"
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                `}
                onClick={onClose}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 right-0 left-0 px-4">
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <p className="text-xs text-white/50">لوحة المشرف العام</p>
          </div>
        </div>
      </aside>
    </>
  )
}
