'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPermissions } from '@/lib/auth/permissions'
import type { Organization, OrgMember, OrgSettings, Permission } from '@/types'

interface OrgContextValue {
  organization: Organization | null
  orgMember: OrgMember | null
  settings: OrgSettings | null
  permissions: Permission[]
  loading: boolean
  hasPermission: (p: Permission) => boolean
}

const OrgContext = createContext<OrgContextValue>({
  organization: null,
  orgMember: null,
  settings: null,
  permissions: [],
  loading: true,
  hasPermission: () => false,
})

export function OrgProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [orgMember, setOrgMember] = useState<OrgMember | null>(null)
  const [settings, setSettings] = useState<OrgSettings | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrgData = async () => {
      try {
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Get org member
        const { data: member } = await supabase
          .from('org_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (!member) {
          setLoading(false)
          return
        }

        setOrgMember(member)
        setPermissions(getPermissions(member.role))

        // Fetch organization and settings in parallel
        const [{ data: org }, { data: orgSettings }] = await Promise.all([
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

        setOrganization(org)
        setSettings(orgSettings)
      } catch {
        // Silently fail — loading state will indicate no data
      } finally {
        setLoading(false)
      }
    }

    loadOrgData()
  }, [])

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
        hasPermission: hasPermissionFn,
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
