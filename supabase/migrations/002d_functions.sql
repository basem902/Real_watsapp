-- ═══════════════════════════════════════════════
-- Migration 002d: Functions + constraints + seed
-- Run this FOURTH (LAST) in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ===== 1. FUNCTION: get_org_by_invite_code =====

DROP FUNCTION IF EXISTS get_org_by_invite_code(TEXT);

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


-- ===== 2. UPDATE get_org_by_wasender_instance to check status =====

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


-- ===== 3. Update notification type constraint =====

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
        'new_conversation','human_requested','new_lead','new_appointment','team_update',
        'org_approved','org_rejected','new_member_joined','trial_expiring'
    ));


-- ===== 4. Update seed org to active =====

UPDATE organizations
SET status = 'active',
    company_type = 'agency',
    approved_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111';
