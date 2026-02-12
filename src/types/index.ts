// ═══════════════════════════════════════════════
// Smart Real Estate Agent — Shared Types
// All types mirror Supabase DB schema exactly
// ═══════════════════════════════════════════════

// ===== ENUMS & UNIONS =====

export type Role = 'owner' | 'admin' | 'agent' | 'viewer';

export type Plan = 'free' | 'basic' | 'pro' | 'agency';

export type PropertyType = 'شقة' | 'فيلا' | 'دوبلكس' | 'أرض' | 'مكتب' | 'محل تجاري';

export type ListingType = 'بيع' | 'إيجار';

export type PropertyStatus = 'متاح' | 'محجوز' | 'مباع';

export type ConversationStatus = 'نشطة' | 'منتهية' | 'تحتاج_متابعة';

export type MessageSender = 'customer' | 'bot' | 'agent';

export type MessageType = 'text' | 'image' | 'location' | 'document';

export type LeadStatus = 'جديد' | 'مهتم' | 'معاينة' | 'تفاوض' | 'مغلق_ناجح' | 'مغلق_فاشل';

export type AppointmentStatus = 'مجدول' | 'مؤكد' | 'منتهي' | 'ملغي';

export type AuditAction = 'create' | 'update' | 'delete' | 'status_change';

export type NotificationType =
  | 'new_conversation'
  | 'human_requested'
  | 'new_lead'
  | 'new_appointment'
  | 'team_update';

// ===== DATABASE ROW TYPES =====

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  plan: Plan;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: Role;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgSettings {
  id: string;
  organization_id: string;
  bot_name: string;
  bot_enabled: boolean;
  welcome_message: string;
  system_prompt: string | null;
  ai_model: string;
  ai_temperature: number;
  max_ai_tokens: number;
  supported_cities: string[];
  default_language: string;
  timezone: string;
  currency: string;
  working_hours_start: string;
  working_hours_end: string;
  max_properties: number;
  max_conversations_per_month: number;
  max_team_members: number;
  created_at: string;
  updated_at: string;
}

export interface OrgIntegrations {
  id: string;
  organization_id: string;
  // Wasender
  wasender_instance_id: string | null;
  wasender_api_key: string | null;       // encrypted
  wasender_webhook_secret: string | null; // encrypted
  wasender_verified: boolean;
  // OpenAI (optional — NULL = system key)
  openai_api_key: string | null;         // encrypted
  // Google Maps (future)
  google_maps_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  area_sqm: number | null;
  bedrooms: number;
  bathrooms: number;
  city: string;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  features: string[];
  images: string[];
  status: PropertyStatus;
  views_count: number;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  organization_id: string;
  whatsapp_number: string;
  customer_name: string | null;
  status: ConversationStatus;
  bot_enabled: boolean;
  tags: string[];
  last_message_at: string;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  organization_id: string;
  conversation_id: string;
  sender: MessageSender;
  sender_user_id: string | null;
  content: string;
  message_type: MessageType;
  wasender_message_id: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  conversation_id: string | null;
  customer_name: string | null;
  phone: string;
  email: string | null;
  interested_in: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_area: string | null;
  lead_status: LeadStatus;
  lead_source: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  organization_id: string;
  lead_id: string | null;
  property_id: string | null;
  scheduled_at: string;
  status: AppointmentStatus;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  organization_id: string;
  table_name: string;
  record_id: string;
  action: AuditAction;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  performed_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  organization_id: string;
  target_user_id: string | null;
  title: string;
  body: string | null;
  type: NotificationType;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface UsageTracking {
  id: string;
  organization_id: string;
  month: string;
  conversations_count: number;
  ai_calls_count: number;
  ai_tokens_used: number;
  whatsapp_messages_sent: number;
  properties_count: number;
  created_at: string;
  updated_at: string;
}

// ===== AUTH & PERMISSION TYPES =====

export type Permission =
  | 'properties:read'
  | 'properties:write'
  | 'properties:delete'
  | 'conversations:read'
  | 'conversations:write'
  | 'conversations:manage'
  | 'leads:read'
  | 'leads:write'
  | 'appointments:read'
  | 'appointments:write'
  | 'team:read'
  | 'team:manage'
  | 'settings:read'
  | 'settings:manage'
  | 'integrations:manage'
  | 'audit:read';

export interface CurrentUser {
  user: {
    id: string;
    email: string;
  };
  orgId: string;
  orgMember: OrgMember;
  permissions: Permission[];
}

export interface OrgContext {
  organizationId: string;
  settings: OrgSettings;
  integrations: OrgIntegrations; // tokens decrypted
}

// ===== WASENDER TYPES =====

export interface WasenderConfig {
  apiKey: string;
  instanceId: string;
  apiUrl?: string;
}

export interface ParsedMessage {
  senderNumber: string;
  senderName: string;
  messageId: string;
  messageType: 'text' | 'image' | 'location' | 'document' | 'interactive' | 'unknown';
  content: string;
  mediaUrl?: string;
  latitude?: number;
  longitude?: number;
  interactiveType?: string;
  interactiveId?: string;
  timestamp: number;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ===== AI TYPES =====

export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIProcessingPayload {
  org_id: string;
  instance_id: string;
  sender_number: string;
  sender_name: string;
  message_content: string;
  message_id: string;
  message_type: string;
}

// ===== API TYPES =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// ===== SEARCH TYPES =====

export interface PropertySearchResult extends Property {
  relevance: number;
  total_count: number;
}

export interface SearchFilters {
  query?: string;
  property_type?: PropertyType;
  listing_type?: ListingType;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  city?: string;
  district?: string;
}
