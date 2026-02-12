-- ============================================================================
-- Smart Real Estate Agent — المخطط الأولي لقاعدة البيانات
-- ============================================================================
-- الإصدار: 001
-- الوصف: إنشاء جميع الجداول والفهارس والدوال والسياسات الأمنية
-- ============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. الإضافات (Extensions)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. الجداول (Tables)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول المؤسسات / الشركات العقارية
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    logo_url        TEXT,
    primary_color   TEXT DEFAULT '#1a365d',
    plan            TEXT NOT NULL DEFAULT 'free'
                        CHECK (plan IN ('free','basic','pro','agency')),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE organizations IS 'المؤسسات والشركات العقارية المسجلة في النظام';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول أعضاء المؤسسة
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE org_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'viewer'
                        CHECK (role IN ('owner','admin','agent','viewer')),
    display_name    TEXT,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    -- كل مستخدم ينتمي لمؤسسة واحدة فقط
    UNIQUE(user_id)
);

COMMENT ON TABLE org_members IS 'أعضاء المؤسسة — كل مستخدم ينتمي لمؤسسة واحدة فقط';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول إعدادات المؤسسة
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE org_settings (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id             UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    bot_name                    TEXT DEFAULT 'المساعد العقاري',
    bot_enabled                 BOOLEAN DEFAULT true,
    welcome_message             TEXT DEFAULT 'مرحباً! أنا المساعد العقاري الذكي. كيف يمكنني مساعدتك؟',
    system_prompt               TEXT,
    ai_model                    TEXT DEFAULT 'gpt-4o-mini',
    ai_temperature              NUMERIC(3,2) DEFAULT 0.7,
    max_ai_tokens               INTEGER DEFAULT 1000,
    supported_cities            TEXT[] DEFAULT ARRAY['الرياض','جدة','مكة','الدمام'],
    default_language            TEXT DEFAULT 'ar',
    timezone                    TEXT DEFAULT 'Asia/Riyadh',
    currency                    TEXT DEFAULT 'SAR',
    working_hours_start         TIME DEFAULT '09:00',
    working_hours_end           TIME DEFAULT '22:00',
    max_properties              INTEGER DEFAULT 50,
    max_conversations_per_month INTEGER DEFAULT 500,
    max_team_members            INTEGER DEFAULT 5,
    created_at                  TIMESTAMPTZ DEFAULT now(),
    updated_at                  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE org_settings IS 'إعدادات المؤسسة — سجل واحد لكل مؤسسة';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول التكاملات الخارجية (WaSender, OpenAI, إلخ)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE org_integrations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    wasender_instance_id    TEXT,
    wasender_api_key        TEXT,          -- مشفّر على مستوى التطبيق
    wasender_webhook_secret TEXT,          -- مشفّر على مستوى التطبيق
    wasender_verified       BOOLEAN DEFAULT false,
    openai_api_key          TEXT,          -- مشفّر على مستوى التطبيق — NULL = مفتاح النظام
    google_maps_key         TEXT,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE org_integrations IS 'مفاتيح التكاملات الخارجية — مشفّرة على مستوى التطبيق';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول العقارات
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE properties (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    property_type   TEXT NOT NULL
                        CHECK (property_type IN ('شقة','فيلا','دوبلكس','أرض','مكتب','محل تجاري')),
    listing_type    TEXT NOT NULL
                        CHECK (listing_type IN ('بيع','إيجار')),
    price           NUMERIC(12,2) NOT NULL,
    area_sqm        NUMERIC(10,2),
    bedrooms        INTEGER DEFAULT 0,
    bathrooms       INTEGER DEFAULT 0,
    city            TEXT NOT NULL,
    district        TEXT,
    address         TEXT,
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    features        TEXT[] DEFAULT '{}',
    images          TEXT[] DEFAULT '{}',
    status          TEXT DEFAULT 'متاح'
                        CHECK (status IN ('متاح','محجوز','مباع')),
    views_count     INTEGER DEFAULT 0,
    is_deleted      BOOLEAN DEFAULT false,
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    -- عمود البحث النصي الكامل
    fts             TSVECTOR
);

COMMENT ON TABLE properties IS 'العقارات المعروضة — بيع وإيجار';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول المحادثات (واتساب)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    whatsapp_number TEXT NOT NULL,
    customer_name   TEXT,
    status          TEXT DEFAULT 'نشطة'
                        CHECK (status IN ('نشطة','منتهية','تحتاج_متابعة')),
    bot_enabled     BOOLEAN DEFAULT true,
    tags            TEXT[] DEFAULT '{}',
    last_message_at TIMESTAMPTZ DEFAULT now(),
    assigned_to     UUID REFERENCES auth.users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE conversations IS 'محادثات واتساب مع العملاء';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول الرسائل
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender              TEXT NOT NULL
                            CHECK (sender IN ('customer','bot','agent')),
    sender_user_id      UUID REFERENCES auth.users(id),
    content             TEXT NOT NULL,
    message_type        TEXT DEFAULT 'text'
                            CHECK (message_type IN ('text','image','location','document')),
    wasender_message_id TEXT,
    created_at          TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE messages IS 'رسائل المحادثات — واردة وصادرة';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول العملاء المحتملين (Leads)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id),
    customer_name   TEXT,
    phone           TEXT NOT NULL,
    email           TEXT,
    interested_in   TEXT,
    budget_min      NUMERIC(12,2),
    budget_max      NUMERIC(12,2),
    preferred_area  TEXT,
    lead_status     TEXT DEFAULT 'جديد'
                        CHECK (lead_status IN ('جديد','مهتم','معاينة','تفاوض','مغلق_ناجح','مغلق_فاشل')),
    lead_source     TEXT DEFAULT 'whatsapp',
    assigned_to     UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE leads IS 'العملاء المحتملون — مسار المبيعات';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول المواعيد
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE appointments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES leads(id),
    property_id     UUID REFERENCES properties(id),
    scheduled_at    TIMESTAMPTZ NOT NULL,
    status          TEXT DEFAULT 'مجدول'
                        CHECK (status IN ('مجدول','مؤكد','منتهي','ملغي')),
    assigned_to     UUID REFERENCES auth.users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE appointments IS 'مواعيد المعاينات والزيارات';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول سجل التدقيق
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    table_name      TEXT NOT NULL,
    record_id       TEXT NOT NULL,
    action          TEXT NOT NULL
                        CHECK (action IN ('create','update','delete','status_change')),
    old_values      JSONB,
    new_values      JSONB,
    performed_by    UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE audit_log IS 'سجل التدقيق لتتبع جميع التغييرات';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول الإشعارات
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    target_user_id  UUID REFERENCES auth.users(id),
    title           TEXT NOT NULL,
    body            TEXT,
    type            TEXT NOT NULL
                        CHECK (type IN ('new_conversation','human_requested','new_lead','new_appointment','team_update')),
    reference_id    TEXT,
    is_read         BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE notifications IS 'إشعارات المستخدمين';

-- ─────────────────────────────────────────────────────────────────────────────
-- جدول تتبع الاستخدام
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE usage_tracking (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month                   TEXT NOT NULL,  -- الصيغة: YYYY-MM
    conversations_count     INTEGER DEFAULT 0,
    ai_calls_count          INTEGER DEFAULT 0,
    ai_tokens_used          INTEGER DEFAULT 0,
    whatsapp_messages_sent  INTEGER DEFAULT 0,
    properties_count        INTEGER DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now(),

    -- سجل واحد لكل مؤسسة لكل شهر
    UNIQUE(organization_id, month)
);

COMMENT ON TABLE usage_tracking IS 'تتبع استهلاك الموارد شهرياً لكل مؤسسة';


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. الفهارس (Indexes)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── فهارس العقارات ───
CREATE INDEX idx_properties_org    ON properties(organization_id) WHERE NOT is_deleted;
CREATE INDEX idx_properties_search ON properties USING GIN(fts);
CREATE INDEX idx_properties_trgm   ON properties USING GIN(title gin_trgm_ops);
CREATE INDEX idx_properties_city   ON properties(city)          WHERE NOT is_deleted;
CREATE INDEX idx_properties_type   ON properties(property_type) WHERE NOT is_deleted;
CREATE INDEX idx_properties_price  ON properties(price)         WHERE NOT is_deleted;

-- ─── فهارس المحادثات ───
CREATE UNIQUE INDEX idx_conversations_active   ON conversations(organization_id, whatsapp_number) WHERE status = 'نشطة';
CREATE INDEX        idx_conversations_org      ON conversations(organization_id);
CREATE INDEX        idx_conversations_assigned ON conversations(assigned_to) WHERE assigned_to IS NOT NULL;

-- ─── فهارس الرسائل ───
CREATE INDEX        idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE UNIQUE INDEX idx_messages_wasender     ON messages(wasender_message_id) WHERE wasender_message_id IS NOT NULL;

-- ─── فهارس العملاء المحتملين ───
CREATE INDEX idx_leads_org      ON leads(organization_id);
CREATE INDEX idx_leads_status   ON leads(lead_status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to) WHERE assigned_to IS NOT NULL;

-- ─── فهارس المواعيد ───
CREATE INDEX idx_appointments_org  ON appointments(organization_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_at);

-- ─── فهارس الإشعارات ───
CREATE INDEX idx_notifications_user ON notifications(target_user_id, is_read);

-- ─── فهارس سجل التدقيق ───
CREATE INDEX idx_audit_org ON audit_log(organization_id, created_at DESC);

-- ─── فهارس تتبع الاستخدام ───
CREATE INDEX idx_usage_org_month ON usage_tracking(organization_id, month);


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. الدوال (Functions)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- دالة البحث في العقارات مع فلترة متعددة ونتيجة أهمية
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_properties(
    p_org_id        UUID,
    p_query         TEXT        DEFAULT NULL,
    p_property_type TEXT        DEFAULT NULL,
    p_listing_type  TEXT        DEFAULT NULL,
    p_min_price     NUMERIC     DEFAULT NULL,
    p_max_price     NUMERIC     DEFAULT NULL,
    p_bedrooms      INTEGER     DEFAULT NULL,
    p_city          TEXT        DEFAULT NULL,
    p_district      TEXT        DEFAULT NULL,
    p_limit         INTEGER     DEFAULT 20,
    p_offset        INTEGER     DEFAULT 0
)
RETURNS TABLE (
    id              UUID,
    organization_id UUID,
    title           TEXT,
    description     TEXT,
    property_type   TEXT,
    listing_type    TEXT,
    price           NUMERIC,
    area_sqm        NUMERIC,
    bedrooms        INTEGER,
    bathrooms       INTEGER,
    city            TEXT,
    district        TEXT,
    address         TEXT,
    latitude        NUMERIC,
    longitude       NUMERIC,
    features        TEXT[],
    images          TEXT[],
    status          TEXT,
    views_count     INTEGER,
    created_by      UUID,
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ,
    relevance       REAL,
    total_count     BIGINT
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_tsquery TSQUERY;
BEGIN
    -- تحويل نص البحث إلى tsquery إذا كان موجوداً
    IF p_query IS NOT NULL AND p_query <> '' THEN
        BEGIN
            v_tsquery := plainto_tsquery('arabic', p_query);
        EXCEPTION WHEN OTHERS THEN
            v_tsquery := plainto_tsquery('simple', p_query);
        END;
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.organization_id,
        p.title,
        p.description,
        p.property_type,
        p.listing_type,
        p.price,
        p.area_sqm,
        p.bedrooms,
        p.bathrooms,
        p.city,
        p.district,
        p.address,
        p.latitude,
        p.longitude,
        p.features,
        p.images,
        p.status,
        p.views_count,
        p.created_by,
        p.created_at,
        p.updated_at,
        -- حساب درجة الأهمية: FTS أولاً ثم ILIKE كبديل
        CASE
            WHEN v_tsquery IS NOT NULL AND p.fts @@ v_tsquery
                THEN ts_rank(p.fts, v_tsquery)
            WHEN p_query IS NOT NULL AND p_query <> '' AND (
                p.title ILIKE '%' || p_query || '%' OR
                p.description ILIKE '%' || p_query || '%' OR
                p.city ILIKE '%' || p_query || '%' OR
                p.district ILIKE '%' || p_query || '%'
            )
                THEN 0.1::REAL
            WHEN p_query IS NULL OR p_query = ''
                THEN 1.0::REAL
            ELSE 0.0::REAL
        END AS relevance,
        COUNT(*) OVER() AS total_count
    FROM properties p
    WHERE p.organization_id = p_org_id
      AND p.is_deleted = false
      -- فلتر البحث النصي
      AND (
          p_query IS NULL OR p_query = ''
          OR p.fts @@ v_tsquery
          OR p.title ILIKE '%' || p_query || '%'
          OR p.description ILIKE '%' || p_query || '%'
          OR p.city ILIKE '%' || p_query || '%'
          OR p.district ILIKE '%' || p_query || '%'
      )
      -- فلاتر إضافية
      AND (p_property_type IS NULL OR p.property_type = p_property_type)
      AND (p_listing_type  IS NULL OR p.listing_type  = p_listing_type)
      AND (p_min_price     IS NULL OR p.price >= p_min_price)
      AND (p_max_price     IS NULL OR p.price <= p_max_price)
      AND (p_bedrooms      IS NULL OR p.bedrooms >= p_bedrooms)
      AND (p_city          IS NULL OR p.city = p_city)
      AND (p_district      IS NULL OR p.district = p_district)
    ORDER BY relevance DESC, p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION search_properties IS 'البحث في العقارات مع فلترة متعددة ونتيجة أهمية — يستخدم FTS مع بديل ILIKE';

-- ─────────────────────────────────────────────────────────────────────────────
-- دالة استرجاع بيانات المؤسسة بناءً على معرّف WaSender
-- (SECURITY DEFINER — تُنفَّذ بصلاحيات المالك)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_org_by_wasender_instance(p_instance_id TEXT)
RETURNS TABLE (
    organization_id     UUID,
    wasender_api_key    TEXT,
    wasender_webhook_secret TEXT,
    wasender_verified   BOOLEAN,
    bot_enabled         BOOLEAN,
    bot_name            TEXT,
    welcome_message     TEXT,
    system_prompt       TEXT,
    ai_model            TEXT,
    ai_temperature      NUMERIC,
    max_ai_tokens       INTEGER,
    supported_cities    TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.organization_id,
        i.wasender_api_key,
        i.wasender_webhook_secret,
        i.wasender_verified,
        s.bot_enabled,
        s.bot_name,
        s.welcome_message,
        s.system_prompt,
        s.ai_model,
        s.ai_temperature,
        s.max_ai_tokens,
        s.supported_cities
    FROM org_integrations i
    JOIN org_settings s ON s.organization_id = i.organization_id
    JOIN organizations o ON o.id = i.organization_id
    WHERE i.wasender_instance_id = p_instance_id
      AND o.is_active = true;
END;
$$;

COMMENT ON FUNCTION get_org_by_wasender_instance IS 'استرجاع إعدادات المؤسسة عبر معرّف WaSender — للاستخدام في Webhook';

-- ─────────────────────────────────────────────────────────────────────────────
-- دالة زيادة عدّاد الاستخدام (UPSERT)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_usage(
    p_org_id  UUID,
    p_field   TEXT,
    p_amount  INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_month TEXT;
BEGIN
    -- التحقق من أن اسم الحقل مسموح به
    IF p_field NOT IN (
        'conversations_count',
        'ai_calls_count',
        'ai_tokens_used',
        'whatsapp_messages_sent',
        'properties_count'
    ) THEN
        RAISE EXCEPTION 'حقل غير مسموح: %', p_field;
    END IF;

    -- الشهر الحالي بصيغة YYYY-MM
    v_month := to_char(now(), 'YYYY-MM');

    -- إدراج أو تحديث السجل
    EXECUTE format(
        'INSERT INTO usage_tracking (organization_id, month, %I)
         VALUES ($1, $2, $3)
         ON CONFLICT (organization_id, month)
         DO UPDATE SET %I = usage_tracking.%I + $3,
                       updated_at = now()',
        p_field, p_field, p_field
    ) USING p_org_id, v_month, p_amount;
END;
$$;

COMMENT ON FUNCTION increment_usage IS 'زيادة عدّاد استخدام معيّن للشهر الحالي — UPSERT آمن';


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. المُشغِّلات (Triggers)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- دالة تحديث حقل updated_at تلقائياً
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- تطبيق المُشغِّل على الجداول التي تحتوي updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON org_members
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON org_settings
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON org_integrations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON usage_tracking
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- دالة تحديث عمود البحث النصي الكامل (FTS) للعقارات
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_properties_fts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fts :=
        setweight(to_tsvector('arabic', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('arabic', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(NEW.city, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(NEW.district, '')), 'C');
    RETURN NEW;
END;
$$;

CREATE TRIGGER properties_fts_update
    BEFORE INSERT OR UPDATE OF title, description, city, district
    ON properties
    FOR EACH ROW
    EXECUTE FUNCTION trigger_properties_fts();

-- ─────────────────────────────────────────────────────────────────────────────
-- دالة إنشاء الإعدادات والتكاملات تلقائياً عند إنشاء مؤسسة جديدة
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_org_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- إنشاء سجل الإعدادات الافتراضية
    INSERT INTO org_settings (organization_id) VALUES (NEW.id);

    -- إنشاء سجل التكاملات الفارغ
    INSERT INTO org_integrations (organization_id) VALUES (NEW.id);

    RETURN NEW;
END;
$$;

CREATE TRIGGER org_create_defaults
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_org_defaults();

-- ─────────────────────────────────────────────────────────────────────────────
-- دالة سجل التدقيق العامة
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_action     TEXT;
    v_old_values JSONB;
    v_new_values JSONB;
    v_record_id  TEXT;
    v_org_id     UUID;
BEGIN
    -- تحديد نوع العملية
    IF TG_OP = 'INSERT' THEN
        v_action     := 'create';
        v_old_values := NULL;
        v_new_values := to_jsonb(NEW);
        v_record_id  := NEW.id::TEXT;
        v_org_id     := NEW.organization_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- التحقق من تغيّر الحالة
        IF TG_TABLE_NAME = 'properties' AND OLD.status IS DISTINCT FROM NEW.status THEN
            v_action := 'status_change';
        ELSIF TG_TABLE_NAME = 'leads' AND OLD.lead_status IS DISTINCT FROM NEW.lead_status THEN
            v_action := 'status_change';
        ELSIF TG_TABLE_NAME = 'appointments' AND OLD.status IS DISTINCT FROM NEW.status THEN
            v_action := 'status_change';
        ELSE
            v_action := 'update';
        END IF;
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        v_record_id  := NEW.id::TEXT;
        v_org_id     := NEW.organization_id;
    ELSIF TG_OP = 'DELETE' THEN
        v_action     := 'delete';
        v_old_values := to_jsonb(OLD);
        v_new_values := NULL;
        v_record_id  := OLD.id::TEXT;
        v_org_id     := OLD.organization_id;
    END IF;

    -- إدراج سجل التدقيق
    INSERT INTO audit_log (
        organization_id, table_name, record_id, action,
        old_values, new_values, performed_by
    ) VALUES (
        v_org_id, TG_TABLE_NAME, v_record_id, v_action,
        v_old_values, v_new_values, auth.uid()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- تطبيق مُشغِّل التدقيق على الجداول المطلوبة
CREATE TRIGGER audit_properties
    AFTER INSERT OR UPDATE OR DELETE ON properties
    FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_leads
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_appointments
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();


-- ══════════════════════════════════════════════════════════════════════════════
-- 6. سياسات أمان الصفوف (Row Level Security)
-- ══════════════════════════════════════════════════════════════════════════════

-- تفعيل RLS على جميع الجداول
ALTER TABLE organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking   ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- دالة مساعدة: معرّف مؤسسة المستخدم الحالي
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id
    FROM org_members
    WHERE user_id = auth.uid()
      AND is_active = true
    LIMIT 1;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- دالة مساعدة: دور المستخدم الحالي في مؤسسته
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM org_members
    WHERE user_id = auth.uid()
      AND is_active = true
    LIMIT 1;
$$;

-- ─── سياسات جدول المؤسسات ───
CREATE POLICY "organizations_select" ON organizations
    FOR SELECT USING (
        id = auth_user_org_id()
    );

CREATE POLICY "organizations_update" ON organizations
    FOR UPDATE USING (
        id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

-- ─── سياسات جدول أعضاء المؤسسة ───
CREATE POLICY "org_members_select" ON org_members
    FOR SELECT USING (
        organization_id = auth_user_org_id()
    );

CREATE POLICY "org_members_insert" ON org_members
    FOR INSERT WITH CHECK (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

CREATE POLICY "org_members_update" ON org_members
    FOR UPDATE USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

CREATE POLICY "org_members_delete" ON org_members
    FOR DELETE USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() = 'owner'
    );

-- ─── سياسات إعدادات المؤسسة ───
CREATE POLICY "org_settings_select" ON org_settings
    FOR SELECT USING (
        organization_id = auth_user_org_id()
    );

CREATE POLICY "org_settings_update" ON org_settings
    FOR UPDATE USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

-- ─── سياسات التكاملات — المالك فقط ───
CREATE POLICY "org_integrations_select" ON org_integrations
    FOR SELECT USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() = 'owner'
    );

CREATE POLICY "org_integrations_update" ON org_integrations
    FOR UPDATE USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() = 'owner'
    );

-- ─── سياسات العقارات ───
CREATE POLICY "properties_select" ON properties
    FOR SELECT USING (
        organization_id = auth_user_org_id()
    );

CREATE POLICY "properties_insert" ON properties
    FOR INSERT WITH CHECK (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin', 'agent')
    );

CREATE POLICY "properties_update" ON properties
    FOR UPDATE USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin', 'agent')
    );

CREATE POLICY "properties_delete" ON properties
    FOR DELETE USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

-- ─── سياسات المحادثات ───
CREATE POLICY "conversations_select" ON conversations
    FOR SELECT USING (
        organization_id = auth_user_org_id()
        AND (
            auth_user_role() IN ('owner', 'admin')
            OR assigned_to = auth.uid()
            OR assigned_to IS NULL
        )
    );

CREATE POLICY "conversations_insert" ON conversations
    FOR INSERT WITH CHECK (
        organization_id = auth_user_org_id()
    );

CREATE POLICY "conversations_update" ON conversations
    FOR UPDATE USING (
        organization_id = auth_user_org_id()
        AND (
            auth_user_role() IN ('owner', 'admin')
            OR assigned_to = auth.uid()
        )
    );

-- ─── سياسات الرسائل ───
CREATE POLICY "messages_select" ON messages
    FOR SELECT USING (
        organization_id = auth_user_org_id()
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
              AND c.organization_id = auth_user_org_id()
              AND (
                  auth_user_role() IN ('owner', 'admin')
                  OR c.assigned_to = auth.uid()
                  OR c.assigned_to IS NULL
              )
        )
    );

CREATE POLICY "messages_insert" ON messages
    FOR INSERT WITH CHECK (
        organization_id = auth_user_org_id()
    );

-- ─── سياسات العملاء المحتملين ───
CREATE POLICY "leads_select" ON leads
    FOR SELECT USING (
        organization_id = auth_user_org_id()
    );

CREATE POLICY "leads_insert" ON leads
    FOR INSERT WITH CHECK (
        organization_id = auth_user_org_id()
    );

CREATE POLICY "leads_update" ON leads
    FOR UPDATE USING (
        organization_id = auth_user_org_id()
    );

-- ─── سياسات المواعيد ───
CREATE POLICY "appointments_select" ON appointments
    FOR SELECT USING (
        organization_id = auth_user_org_id()
    );

CREATE POLICY "appointments_insert" ON appointments
    FOR INSERT WITH CHECK (
        organization_id = auth_user_org_id()
    );

CREATE POLICY "appointments_update" ON appointments
    FOR UPDATE USING (
        organization_id = auth_user_org_id()
    );

-- ─── سياسات سجل التدقيق — المالك والمدير فقط ───
CREATE POLICY "audit_log_select" ON audit_log
    FOR SELECT USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );

-- ─── سياسات الإشعارات — المستخدم يرى إشعاراته فقط ───
CREATE POLICY "notifications_select" ON notifications
    FOR SELECT USING (
        target_user_id = auth.uid()
    );

CREATE POLICY "notifications_update" ON notifications
    FOR UPDATE USING (
        target_user_id = auth.uid()
    );

-- ─── سياسات تتبع الاستخدام — المالك والمدير فقط ───
CREATE POLICY "usage_tracking_select" ON usage_tracking
    FOR SELECT USING (
        organization_id = auth_user_org_id()
        AND auth_user_role() IN ('owner', 'admin')
    );


-- ══════════════════════════════════════════════════════════════════════════════
-- 7. تخزين الملفات (Storage)
-- ══════════════════════════════════════════════════════════════════════════════

-- إنشاء سلة تخزين صور العقارات (عامة للقراءة)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- سياسة القراءة العامة لصور العقارات
CREATE POLICY "property_images_public_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'property-images'
    );

-- سياسة الرفع — المستخدمون المسجلون في مؤسسة فقط
CREATE POLICY "property_images_auth_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'property-images'
        AND auth.uid() IS NOT NULL
        AND auth_user_org_id() IS NOT NULL
    );

-- سياسة التحديث — المستخدمون المسجلون في مؤسسة فقط
CREATE POLICY "property_images_auth_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'property-images'
        AND auth.uid() IS NOT NULL
        AND auth_user_org_id() IS NOT NULL
    );

-- سياسة الحذف — المالك والمدير فقط
CREATE POLICY "property_images_auth_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'property-images'
        AND auth.uid() IS NOT NULL
        AND auth_user_role() IN ('owner', 'admin')
    );


-- ══════════════════════════════════════════════════════════════════════════════
-- ✅ اكتمل المخطط الأولي — 12 جدول، فهارس، دوال، مُشغِّلات، وسياسات أمان
-- ══════════════════════════════════════════════════════════════════════════════
