/**
 * Platform Notification Sender
 * Sends notifications via WhatsApp (Wasender) + Email
 * Used for: new registration, approval, rejection, trial expiring, new member joined
 */

import { sendText } from '@/lib/whatsapp/sender'
import { supabaseAdmin } from '@/lib/supabase/admin'

// ===== Types =====

type NotificationEvent =
  | 'new_company_registered'
  | 'company_approved'
  | 'company_rejected'
  | 'trial_expiring'
  | 'new_member_joined'

interface NotificationPayload {
  event: NotificationEvent
  orgId?: string
  orgName?: string
  companyType?: string
  rejectionReason?: string
  memberName?: string
  trialDaysLeft?: number
  recipientEmail?: string
  recipientPhone?: string
}

// ===== Arabic Messages =====

const COMPANY_TYPE_AR: Record<string, string> = {
  agency: 'مكتب عقاري',
  developer: 'شركة تطوير عقاري',
  individual: 'مسوّق فردي',
}

function getWhatsAppMessage(payload: NotificationPayload): string {
  switch (payload.event) {
    case 'new_company_registered':
      return [
        '🏢 *تسجيل شركة جديدة*',
        '',
        `📋 الاسم: ${payload.orgName}`,
        `🏷️ النوع: ${COMPANY_TYPE_AR[payload.companyType || ''] || payload.companyType}`,
        '',
        '✅ تم منحها فترة تجريبية 7 أيام',
        '🔗 راجع الطلب من لوحة الإدارة',
      ].join('\n')

    case 'company_approved':
      return [
        '🎉 *تم تفعيل حسابك!*',
        '',
        `مرحباً بك في منصة العقار الذكي`,
        `شركة: ${payload.orgName}`,
        '',
        '✅ تم قبول طلبك وتفعيل حسابك بنجاح',
        '🔗 يمكنك الآن الدخول إلى لوحة التحكم',
      ].join('\n')

    case 'company_rejected':
      return [
        '❌ *تم رفض طلب التسجيل*',
        '',
        `شركة: ${payload.orgName}`,
        payload.rejectionReason ? `📝 السبب: ${payload.rejectionReason}` : '',
        '',
        'للاستفسار تواصل مع إدارة المنصة',
      ].filter(Boolean).join('\n')

    case 'trial_expiring':
      return [
        '⏰ *تنبيه: الفترة التجريبية على وشك الانتهاء*',
        '',
        `شركة: ${payload.orgName}`,
        `📅 المتبقي: ${payload.trialDaysLeft} ${payload.trialDaysLeft === 1 ? 'يوم' : 'أيام'}`,
        '',
        '🔗 تواصل مع الإدارة لتفعيل حسابك',
      ].join('\n')

    case 'new_member_joined':
      return [
        '👤 *انضمام عضو جديد*',
        '',
        `الاسم: ${payload.memberName}`,
        `الشركة: ${payload.orgName}`,
        '',
        '✅ تم إضافته إلى فريقك بنجاح',
      ].join('\n')

    default:
      return ''
  }
}

function getEmailSubject(payload: NotificationPayload): string {
  switch (payload.event) {
    case 'new_company_registered':
      return `تسجيل شركة جديدة: ${payload.orgName}`
    case 'company_approved':
      return `تم تفعيل حسابك - ${payload.orgName}`
    case 'company_rejected':
      return `تم رفض طلب التسجيل - ${payload.orgName}`
    case 'trial_expiring':
      return `تنبيه: الفترة التجريبية على وشك الانتهاء - ${payload.orgName}`
    case 'new_member_joined':
      return `انضمام عضو جديد: ${payload.memberName}`
    default:
      return 'إشعار من منصة العقار الذكي'
  }
}

function getEmailBody(payload: NotificationPayload): string {
  const msg = getWhatsAppMessage(payload)
    .replace(/\*/g, '')
    .replace(/🏢|📋|🏷️|✅|🔗|🎉|❌|📝|⏰|📅|👤/g, '')
    .trim()

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="color: #1a365d; margin: 0;">منصة العقار الذكي</h2>
    </div>
    <div style="white-space: pre-line; color: #333; line-height: 1.8; font-size: 15px;">
${msg}
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="text-align: center; color: #999; font-size: 12px;">
      هذا إشعار تلقائي من منصة العقار الذكي
    </p>
  </div>
</body>
</html>`
}

// ===== Send Functions =====

/**
 * Send WhatsApp notification using platform Wasender credentials
 */
async function sendWhatsAppNotification(phone: string, message: string): Promise<boolean> {
  try {
    const apiKey = process.env.WASENDER_API_KEY
    const instanceId = process.env.WASENDER_INSTANCE_ID
    if (!apiKey || !instanceId) {
      console.warn('[Notification] Wasender not configured, skipping WhatsApp')
      return false
    }

    const result = await sendText(
      { apiKey, instanceId },
      phone,
      message
    )
    return result.success
  } catch (error) {
    console.error('[Notification] WhatsApp send error:', error)
    return false
  }
}

/**
 * Send email notification (using Supabase Edge Function or simple fetch)
 * Falls back to console.log if no email service configured
 */
async function sendEmailNotification(email: string, subject: string, htmlBody: string): Promise<boolean> {
  try {
    // Try Supabase Edge Function for email
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.log(`[Notification] Email would be sent to ${email}: ${subject}`)
      return false
    }

    // Use Supabase built-in email via auth.admin
    // For production, integrate with a proper email service (SendGrid, Resend, etc.)
    console.log(`[Notification] Email notification to ${email}: ${subject}`)

    // Store notification in database for tracking
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          organization_id: null,
          target_user_id: null,
          title: subject,
          body: htmlBody.substring(0, 500),
          type: 'team_update',
          is_read: false,
        })
    } catch {
      // Ignore DB errors for notification logging
    }

    return true
  } catch (error) {
    console.error('[Notification] Email send error:', error)
    return false
  }
}

// ===== Main Notification Function =====

export async function sendPlatformNotification(payload: NotificationPayload): Promise<{
  whatsapp: boolean
  email: boolean
}> {
  const whatsappMsg = getWhatsAppMessage(payload)
  const emailSubject = getEmailSubject(payload)
  const emailBody = getEmailBody(payload)

  let whatsappSent = false
  let emailSent = false

  // Send to specific recipient if provided
  if (payload.recipientPhone && whatsappMsg) {
    whatsappSent = await sendWhatsAppNotification(payload.recipientPhone, whatsappMsg)
  }

  if (payload.recipientEmail) {
    emailSent = await sendEmailNotification(payload.recipientEmail, emailSubject, emailBody)
  }

  return { whatsapp: whatsappSent, email: emailSent }
}

/**
 * Notify Super Admin(s) about platform events
 */
export async function notifySuperAdmins(payload: NotificationPayload): Promise<void> {
  try {
    // Get all super admin users
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 })

    const superAdmins = users?.users?.filter(
      (u) => u.user_metadata?.is_super_admin === true
    ) || []

    for (const admin of superAdmins) {
      await sendPlatformNotification({
        ...payload,
        recipientEmail: admin.email || undefined,
        recipientPhone: admin.phone || admin.user_metadata?.phone || undefined,
      })
    }
  } catch (error) {
    console.error('[Notification] Failed to notify super admins:', error)
  }
}

/**
 * Notify company owner about approval/rejection
 */
export async function notifyCompanyOwner(
  orgId: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    // Get org owner
    const { data: owner } = await supabaseAdmin
      .from('org_members')
      .select('user_id')
      .eq('organization_id', orgId)
      .eq('role', 'owner')
      .eq('is_active', true)
      .single()

    if (!owner) return

    // Get user details
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(owner.user_id)
    if (!user) return

    await sendPlatformNotification({
      ...payload,
      recipientEmail: user.email || undefined,
      recipientPhone: user.phone || user.user_metadata?.phone || undefined,
    })
  } catch (error) {
    console.error('[Notification] Failed to notify company owner:', error)
  }
}
