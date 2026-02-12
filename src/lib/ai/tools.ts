// ═══════════════════════════════════════════════
// AI Tool Definitions — OpenAI Function Calling
// ═══════════════════════════════════════════════

import { AIToolDefinition } from '@/types'

export const AI_TOOLS: AIToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_properties',
      description: 'البحث عن عقارات متاحة حسب المعايير المحددة',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'نص البحث الحر (مثل: شقة في الرياض)' },
          property_type: {
            type: 'string',
            enum: ['شقة', 'فيلا', 'دوبلكس', 'أرض', 'مكتب', 'محل تجاري'],
            description: 'نوع العقار',
          },
          listing_type: {
            type: 'string',
            enum: ['بيع', 'إيجار'],
            description: 'نوع الإعلان',
          },
          min_price: { type: 'number', description: 'أقل سعر' },
          max_price: { type: 'number', description: 'أعلى سعر' },
          bedrooms: { type: 'integer', description: 'عدد الغرف' },
          city: { type: 'string', description: 'المدينة' },
          district: { type: 'string', description: 'الحي' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_property_details',
      description: 'الحصول على تفاصيل عقار محدد بمعرفته',
      parameters: {
        type: 'object',
        properties: {
          property_id: { type: 'string', description: 'معرف العقار (UUID)' },
        },
        required: ['property_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_lead',
      description: 'تسجيل عميل محتمل مهتم بالعقارات',
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string', description: 'اسم العميل' },
          phone: { type: 'string', description: 'رقم الهاتف' },
          budget_min: { type: 'number', description: 'أقل ميزانية' },
          budget_max: { type: 'number', description: 'أعلى ميزانية' },
          preferred_area: { type: 'string', description: 'المنطقة المفضلة' },
          notes: { type: 'string', description: 'ملاحظات إضافية' },
        },
        required: ['phone'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'schedule_appointment',
      description: 'حجز موعد معاينة لعقار',
      parameters: {
        type: 'object',
        properties: {
          property_id: { type: 'string', description: 'معرف العقار' },
          preferred_date: { type: 'string', description: 'التاريخ المفضل (YYYY-MM-DD)' },
          preferred_time: { type: 'string', description: 'الوقت المفضل (HH:MM)' },
          customer_name: { type: 'string', description: 'اسم العميل' },
          phone: { type: 'string', description: 'رقم الهاتف' },
        },
        required: ['property_id', 'preferred_date', 'preferred_time', 'phone'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_human',
      description: 'تحويل المحادثة لمستشار عقاري بشري',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'سبب التحويل' },
          urgency: {
            type: 'string',
            enum: ['عادي', 'عاجل'],
            description: 'مستوى الاستعجال',
          },
        },
        required: ['reason'],
      },
    },
  },
]
