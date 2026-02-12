-- ═══════════════════════════════════════════════
-- Migration 002c: RLS policies for new tables
-- Run this THIRD in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ===== RLS for org_invitations =====

ALTER TABLE org_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe re-run)
DROP POLICY IF EXISTS "org_invitations_select" ON org_invitations;
DROP POLICY IF EXISTS "org_invitations_insert" ON org_invitations;
DROP POLICY IF EXISTS "org_invitations_update" ON org_invitations;

CREATE POLICY "org_invitations_select" ON org_invitations
    FOR SELECT USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

CREATE POLICY "org_invitations_insert" ON org_invitations
    FOR INSERT WITH CHECK (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

CREATE POLICY "org_invitations_update" ON org_invitations
    FOR UPDATE USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );


-- ===== RLS for pending_members =====

ALTER TABLE pending_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe re-run)
DROP POLICY IF EXISTS "pending_members_select" ON pending_members;
DROP POLICY IF EXISTS "pending_members_update" ON pending_members;
DROP POLICY IF EXISTS "pending_members_self_select" ON pending_members;

CREATE POLICY "pending_members_select" ON pending_members
    FOR SELECT USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

CREATE POLICY "pending_members_update" ON pending_members
    FOR UPDATE USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

-- Allow the pending user themselves to see their own status
CREATE POLICY "pending_members_self_select" ON pending_members
    FOR SELECT USING (user_id = auth.uid());
