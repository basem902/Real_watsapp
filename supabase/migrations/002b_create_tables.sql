-- ═══════════════════════════════════════════════
-- Migration 002b: Create org_invitations + pending_members tables
-- Run this SECOND in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ===== 1. CREATE org_invitations table =====

CREATE TABLE IF NOT EXISTS org_invitations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invite_code     TEXT NOT NULL,
    created_by      UUID NOT NULL REFERENCES auth.users(id),
    default_role    TEXT NOT NULL DEFAULT 'agent'
                        CHECK (default_role IN ('admin','agent','viewer')),
    max_uses        INTEGER,
    used_count      INTEGER NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE org_invitations IS 'روابط دعوة الموظفين — رابط فريد لكل مؤسسة';

-- Unique partial index for active invite codes
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_code_active
    ON org_invitations(invite_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_invitations_org
    ON org_invitations(organization_id);

-- updated_at trigger (safe: drop if exists first)
DROP TRIGGER IF EXISTS set_org_invitations_updated_at ON org_invitations;
CREATE TRIGGER set_org_invitations_updated_at
    BEFORE UPDATE ON org_invitations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ===== 2. CREATE pending_members table =====

CREATE TABLE IF NOT EXISTS pending_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id),
    invite_id       UUID REFERENCES org_invitations(id),
    display_name    TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected')),
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE pending_members IS 'طلبات الانضمام المعلقة — تُستخدم عند تفعيل خيار الموافقة على الدعوات';

CREATE INDEX IF NOT EXISTS idx_pending_members_org
    ON pending_members(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_pending_members_user
    ON pending_members(user_id);
