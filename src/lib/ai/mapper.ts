// ═══════════════════════════════════════════════
// Arabic Dialect Normalization for Property Search
// Maps common Saudi dialect variants to canonical DB values
// ═══════════════════════════════════════════════

const TYPE_MAP: Record<string, string> = {
  'شقه': 'شقة',
  'شقق': 'شقة',
  'فله': 'فيلا',
  'فلل': 'فيلا',
  'فيلات': 'فيلا',
  'دبلكس': 'دوبلكس',
  'دبلوكس': 'دوبلكس',
  'ارض': 'أرض',
  'اراضي': 'أرض',
  'أراضي': 'أرض',
  'مكاتب': 'مكتب',
  'محل': 'محل تجاري',
  'محلات': 'محل تجاري',
  'دكان': 'محل تجاري',
}

const CANONICAL_TYPES = ['شقة', 'فيلا', 'دوبلكس', 'أرض', 'مكتب', 'محل تجاري']

const LISTING_MAP: Record<string, string> = {
  'شراء': 'بيع',
  'اشتري': 'بيع',
  'أشتري': 'بيع',
  'شري': 'بيع',
  'للبيع': 'بيع',
  'ايجار': 'إيجار',
  'استاجر': 'إيجار',
  'أستأجر': 'إيجار',
  'للايجار': 'إيجار',
  'للإيجار': 'إيجار',
  'اجار': 'إيجار',
}

const CANONICAL_LISTINGS = ['بيع', 'إيجار']

const CITY_MAP: Record<string, string> = {
  'رياض': 'الرياض',
  'الرياظ': 'الرياض',
  'جده': 'جدة',
  'جدا': 'جدة',
  'مكه': 'مكة',
  'مكة المكرمة': 'مكة',
  'الدمام': 'الدمام',
  'دمام': 'الدمام',
  'الخبر': 'الخبر',
  'خبر': 'الخبر',
  'المدينه': 'المدينة',
  'المدينة المنورة': 'المدينة',
  'ابها': 'أبها',
  'تبوك': 'تبوك',
  'الطايف': 'الطائف',
  'الطائف': 'الطائف',
}

export function normalizePropertyType(input: string): string | undefined {
  const cleaned = input.trim()
  return TYPE_MAP[cleaned] || (CANONICAL_TYPES.includes(cleaned) ? cleaned : undefined)
}

export function normalizeListingType(input: string): string | undefined {
  const cleaned = input.trim()
  return LISTING_MAP[cleaned] || (CANONICAL_LISTINGS.includes(cleaned) ? cleaned : undefined)
}

export function normalizeCity(input: string): string | undefined {
  const cleaned = input.trim()
  return CITY_MAP[cleaned] || (cleaned.length > 1 ? cleaned : undefined)
}

export function normalizeSearchArgs(args: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...args }

  if (typeof args.property_type === 'string') {
    const mapped = normalizePropertyType(args.property_type)
    if (mapped) normalized.property_type = mapped
  }

  if (typeof args.listing_type === 'string') {
    const mapped = normalizeListingType(args.listing_type)
    if (mapped) normalized.listing_type = mapped
  }

  if (typeof args.city === 'string') {
    const mapped = normalizeCity(args.city)
    if (mapped) normalized.city = mapped
  }

  return normalized
}
