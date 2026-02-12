-- ═══════════════════════════════════════════════
-- Migration 002: Multi-Company Platform
-- Adds: company status, trial period, invite links, pending members
-- ═══════════════════════════════════════════════

-- ===== 1. ALTER organizations table =====

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'trial'
        CHECK (status IN ('pending','trial','active','suspended','rejected')),
    ADD COLUMN IF NOT EXISTS company_type TEXT NOT NULL DEFAULT 'agency'
        CHECK (company_type IN ('agency','developer','individual')),
    ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS invite_approval_required BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing orgs to active
UPDATE organizations SET status = 'active' WHERE is_active = true AND status = 'trial';
UPDATE organizations SET status = 'suspended' WHERE is_active = false AND status = 'trial';

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_company_type ON organizations(company_type);

COMMENT ON COLUMN organizations.status IS 'حالة المؤسسة: trial=تجريبية, active=مفعلة, pending=بانتظار, suspended=معلقة, rejected=مرفوضة';
COMMENT ON COLUMN organizations.company_type IS 'نوع الشركة: agency=مكتب عقاري, developer=شركة تطوير, individual=مسوق فردي';
COMMENT ON COLUMN organizations.trial_ends_at IS 'تاريخ انتهاء الفترة التجريبية (7 أيام)';
COMMENT ON COLUMN organizations.invite_approval_required IS 'هل يتطلب انضمام الموظفين موافقة صاحب الشركة';


-- ===== 2. CREATE org_invitations table =====

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

-- updated_at trigger
CREATE TRIGGER set_org_invitations_updated_at
    BEFORE UPDATE ON org_invitations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ===== 3. CREATE pending_members table =====

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


-- ===== 4. RLS for org_invitations =====

ALTER TABLE org_invitations ENABLE ROW LEVEL SECURITY;

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


-- ===== 5. RLS for pending_members =====

ALTER TABLE pending_members ENABLE ROW LEVEL SECURITY;

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


-- ===== 6. FUNCTION: get_org_by_invite_code =====

CREATE OR REPLACE FUNCTION get_org_by_invite_code(p_code TEXT)
RETURNS TABLE (
    organization_id   UUID,
    organization_name TEXT,
    organization_logo TEXT,
    company_type      TEXT,
    default_role      TEXT,
    invite_approval_required BOOLEAN,
    invite_valid      BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        o.logo_url,
        o.company_type,
        inv.default_role,
        o.invite_approval_required,
        (
            inv.is_active = true
            AND o.status IN ('trial', 'active')
            AND (inv.max_uses IS NULL OR inv.used_count < inv.max_uses)
            AND (inv.expires_at IS NULL OR inv.expires_at > now())
        ) AS invite_valid
    FROM org_invitations inv
    JOIN organizations o ON o.id = inv.organization_id
    WHERE inv.invite_code = p_code;
END;
$$;

COMMENT ON FUNCTION get_org_by_invite_code IS 'دالة عامة للتحقق من صلاحية رابط الدعوة — SECURITY DEFINER';


-- ===== 7. UPDATE get_org_by_wasender_instance to check status =====
-- Allow trial and active orgs only
-- Must drop first because return type may differ from original
DROP FUNCTION IF EXISTS get_org_by_wasender_instance(TEXT);

CREATE OR REPLACE FUNCTION get_org_by_wasender_instance(p_instance_id TEXT)
RETURNS TABLE (
    org_id UUID,
    org_name TEXT,
    bot_enabled BOOLEAN,
    bot_name TEXT,
    welcome_message TEXT,
    system_prompt TEXT,
    ai_model TEXT,
    ai_temperature NUMERIC,
    max_ai_tokens INTEGER,
    supported_cities TEXT[],
    wasender_api_key TEXT,
    wasender_instance_id TEXT,
    wasender_webhook_secret TEXT,
    openai_api_key TEXT,
    working_hours_start TEXT,
    working_hours_end TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        s.bot_enabled,
        s.bot_name,
        s.welcome_message,
        s.system_prompt,
        s.ai_model,
        s.ai_temperature,
        s.max_ai_tokens,
        s.supported_cities,
        i.wasender_api_key,
        i.wasender_instance_id,
        i.wasender_webhook_secret,
        i.openai_api_key,
        s.working_hours_start,
        s.working_hours_end
    FROM org_integrations i
    JOIN org_settings s ON s.organization_id = i.organization_id
    JOIN organizations o ON o.id = i.organization_id
    WHERE i.wasender_instance_id = p_instance_id
      AND o.status IN ('trial', 'active');
END;
$$;


-- ===== 8. Update notification type constraint =====

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
        'new_conversation','human_requested','new_lead','new_appointment','team_update',
        'org_approved','org_rejected','new_member_joined','trial_expiring'
    ));


-- ===== 9. Update seed org to active =====

UPDATE organizations
SET status = 'active',
    company_type = 'agency',
    approved_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111';
