'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getPermissions } from '@/lib/auth/permissions'
import type { Organization, OrgMember, OrgSettings, Permission } from '@/types'

interface OrgContextValue {
  organization: Organization | null
  orgMember: OrgMember | null
  settings: OrgSettings | null
  permissions: Permission[]
  loading: boolean
  error: string | null
  hasPermission: (p: Permission) => boolean
  reload: () => Promise<void>
}

const OrgContext = createContext<OrgContextValue>({
  organization: null,
  orgMember: null,
  settings: null,
  permissions: [],
  loading: true,
  error: null,
  hasPermission: () => false,
  reload: async () => {},
})

export function OrgProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [orgMember, setOrgMember] = useState<OrgMember | null>(null)
  const [settings, setSettings] = useState<OrgSettings | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrgData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        // Not logged in — redirect to login
        router.push('/login')
        return
      }

      // Get org member
      const { data: member, error: memberError } = await supabase
        .from('org_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (memberError || !member) {
        setError('لم يتم العثور على عضوية مؤسسة. تواصل مع المسؤول.')
        setLoading(false)
        return
      }

      setOrgMember(member)
      setPermissions(getPermissions(member.role))

      // Fetch organization and settings in parallel
      const [{ data: org, error: orgError }, { data: orgSettings }] = await Promise.all([
        supabase
          .from('organizations')
          .select('*')
          .eq('id', member.organization_id)
          .single(),
        supabase
          .from('org_settings')
          .select('*')
          .eq('organization_id', member.organization_id)
          .single(),
      ])

      if (orgError || !org) {
        setError('حدث خطأ في تحميل بيانات المؤسسة')
        setLoading(false)
        return
      }

      setOrganization(org)
      setSettings(orgSettings)
    } catch {
      setError('حدث خطأ غير متوقع في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadOrgData()
  }, [loadOrgData])

  const hasPermissionFn = (p: Permission): boolean => {
    return permissions.includes(p)
  }

  return (
    <OrgContext.Provider
      value={{
        organization,
        orgMember,
        settings,
        permissions,
        loading,
        error,
        hasPermission: hasPermissionFn,
        reload: loadOrgData,
      }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg(): OrgContextValue {
  return useContext(OrgContext)
}

interface PermissionGateProps {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { hasPermission } = useOrg()

  if (!hasPermission(permission)) {
    return <>{fallback ?? null}</>
  }

  return <>{children}</>
}
