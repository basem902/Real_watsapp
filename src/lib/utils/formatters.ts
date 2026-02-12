import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000
    return `${millions.toLocaleString('ar-SA')} مليون ريال`
  }
  return `${price.toLocaleString('ar-SA')} ريال`
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ar })
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMMM yyyy HH:mm', { locale: ar })
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  return formatDate(dateStr)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('966') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  return phone
}
