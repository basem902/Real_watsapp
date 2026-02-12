-- ═══════════════════════════════════════════════
-- Migration 002a: ALTER organizations table
-- Run this FIRST in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Add columns one by one to avoid issues with IF NOT EXISTS + CHECK
DO $$
BEGIN
    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'status'
    ) THEN
        ALTER TABLE organizations ADD COLUMN status TEXT NOT NULL DEFAULT 'trial';
        ALTER TABLE organizations ADD CONSTRAINT organizations_status_check
            CHECK (status IN ('pending','trial','active','suspended','rejected'));
    END IF;

    -- Add company_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'company_type'
    ) THEN
        ALTER TABLE organizations ADD COLUMN company_type TEXT NOT NULL DEFAULT 'agency';
        ALTER TABLE organizations ADD CONSTRAINT organizations_company_type_check
            CHECK (company_type IN ('agency','developer','individual'));
    END IF;

    -- Add trial_ends_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'trial_ends_at'
    ) THEN
        ALTER TABLE organizations ADD COLUMN trial_ends_at TIMESTAMPTZ;
    END IF;

    -- Add rejection_reason column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE organizations ADD COLUMN rejection_reason TEXT;
    END IF;

    -- Add approved_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE organizations ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;

    -- Add approved_by column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE organizations ADD COLUMN approved_by UUID REFERENCES auth.users(id);
    END IF;

    -- Add invite_approval_required column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'invite_approval_required'
    ) THEN
        ALTER TABLE organizations ADD COLUMN invite_approval_required BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

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
