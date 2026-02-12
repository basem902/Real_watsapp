import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  organizationName: z.string().min(2, 'اسم المكتب يجب أن يكون حرفين على الأقل'),
  companyType: z.enum(['agency', 'developer', 'individual']).default('agency'),
})

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export const propertySchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().optional(),
  property_type: z.enum(['شقة', 'فيلا', 'دوبلكس', 'أرض', 'مكتب', 'محل تجاري']),
  listing_type: z.enum(['بيع', 'إيجار']),
  price: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
  area_sqm: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).default(0),
  bathrooms: z.number().int().min(0).default(0),
  city: z.string().min(1, 'المدينة مطلوبة'),
  district: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
})

export const leadSchema = z.object({
  customer_name: z.string().min(1, 'اسم العميل مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  email: z.string().email().optional().or(z.literal('')),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  preferred_area: z.string().optional(),
  interested_in: z.string().uuid().optional(),
  notes: z.string().optional(),
})

export const appointmentSchema = z.object({
  property_id: z.string().uuid('معرف العقار غير صحيح'),
  scheduled_at: z.string().min(1, 'الموعد مطلوب'),
  customer_name: z.string().min(1, 'اسم العميل مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
})

export const aiPayloadSchema = z.object({
  org_id: z.string().uuid(),
  instance_id: z.string(),
  sender_number: z.string(),
  sender_name: z.string(),
  message_content: z.string(),
  message_id: z.string(),
  message_type: z.string(),
})

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, 'الرسالة مطلوبة'),
})

export const teamInviteSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  fullName: z.string().min(2, 'الاسم مطلوب'),
  role: z.enum(['admin', 'agent', 'viewer']),
})

export const settingsSchema = z.object({
  bot_name: z.string().min(1).optional(),
  bot_enabled: z.boolean().optional(),
  welcome_message: z.string().optional(),
  system_prompt: z.string().nullable().optional(),
  ai_model: z.string().optional(),
  ai_temperature: z.number().min(0).max(2).optional(),
  max_ai_tokens: z.number().int().min(100).max(4000).optional(),
  supported_cities: z.array(z.string()).optional(),
  working_hours_start: z.string().optional(),
  working_hours_end: z.string().optional(),
})

export const integrationsSchema = z.object({
  wasender_instance_id: z.string().optional(),
  wasender_api_key: z.string().optional(),
  wasender_webhook_secret: z.string().optional(),
  openai_api_key: z.string().optional(),
})

export const inviteLinkSchema = z.object({
  default_role: z.enum(['admin', 'agent', 'viewer']).default('agent'),
  max_uses: z.number().int().min(1).optional(),
  expires_in_days: z.number().int().min(1).max(365).optional(),
})

export const inviteRegisterSchema = z.object({
  invite_code: z.string().min(1, 'رمز الدعوة مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
})

export const adminCompanyActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend', 'reactivate']),
  rejection_reason: z.string().optional(),
})
