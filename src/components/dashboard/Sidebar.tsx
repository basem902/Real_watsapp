'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Users,
  CalendarDays,
  UserCog,
  Settings,
  ClipboardList,
  X,
} from 'lucide-react'
import { useOrg, PermissionGate } from '@/components/providers/OrgProvider'
import type { Permission } from '@/types'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  permission?: Permission
}

const navItems: NavItem[] = [
  { label: 'لوحة التحكم', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'العقارات', href: '/dashboard/properties', icon: <Building2 size={20} />, permission: 'properties:read' },
  { label: 'المحادثات', href: '/dashboard/conversations', icon: <MessageSquare size={20} />, permission: 'conversations:read' },
  { label: 'العملاء المحتملين', href: '/dashboard/leads', icon: <Users size={20} />, permission: 'leads:read' },
  { label: 'المواعيد', href: '/dashboard/appointments', icon: <CalendarDays size={20} />, permission: 'appointments:read' },
  { label: 'الفريق', href: '/dashboard/team', icon: <UserCog size={20} />, permission: 'team:read' },
  { label: 'الإعدادات', href: '/dashboard/settings', icon: <Settings size={20} />, permission: 'settings:read' },
  { label: 'سجل العمليات', href: '/dashboard/audit-log', icon: <ClipboardList size={20} />, permission: 'audit:read' },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
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
          fixed right-0 top-0 z-50 h-full w-64 bg-[#1a365d] text-white transition-transform duration-300
          lg:static lg:translate-x-0
          ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <h1 className="text-lg font-bold">العقارات الذكية</h1>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white" aria-label="إغلاق القائمة">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const link = (
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

            if (item.permission) {
              return (
                <PermissionGate key={item.href} permission={item.permission}>
                  {link}
                </PermissionGate>
              )
            }
            return link
          })}
        </nav>
      </aside>
    </>
  )
}
