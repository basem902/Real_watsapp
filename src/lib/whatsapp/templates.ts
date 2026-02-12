export function welcomeMessage(botName: string): string {
  return `مرحباً! أنا ${botName} 🏠\nكيف يمكنني مساعدتك اليوم؟\n\nيمكنني مساعدتك في:\n• البحث عن عقارات\n• معرفة تفاصيل عقار\n• حجز موعد معاينة\n• التواصل مع مستشار عقاري`
}

export function propertyCard(property: {
  title: string; price: number; city: string; district?: string | null;
  bedrooms: number; bathrooms: number; area_sqm?: number | null;
  property_type: string; listing_type: string;
}): string {
  const price = new Intl.NumberFormat('ar-SA').format(property.price)
  const area = property.area_sqm ? `${property.area_sqm} م²` : ''
  const location = property.district ? `${property.district}، ${property.city}` : property.city

  return `🏠 *${property.title}*\n` +
    `📍 ${location}\n` +
    `💰 ${price} ريال ${property.listing_type === 'إيجار' ? '/ شهرياً' : ''}\n` +
    `🛏 ${property.bedrooms} غرف | 🚿 ${property.bathrooms} حمام${area ? ` | 📐 ${area}` : ''}\n` +
    `📋 ${property.property_type} - ${property.listing_type}`
}

export function noResultsMessage(): string {
  return `عذراً، لم أجد عقارات تطابق بحثك 😕\nجرب تعديل معايير البحث أو تواصل مع مستشارنا العقاري.`
}

export function leadCreatedMessage(customerName: string): string {
  return `شكراً ${customerName}! ✅\nتم تسجيل طلبك بنجاح.\nسيتواصل معك أحد مستشارينا في أقرب وقت.`
}

export function appointmentCreatedMessage(date: string, propertyTitle: string): string {
  return `تم حجز موعد المعاينة بنجاح ✅\n🏠 العقار: ${propertyTitle}\n📅 الموعد: ${date}\n\nسنرسل لك تأكيداً قبل الموعد.`
}

export function escalationMessage(): string {
  return `تم تحويل محادثتك إلى مستشار عقاري متخصص 👨‍💼\nسيتواصل معك في أقرب وقت.\nشكراً لصبرك!`
}

export function errorMessage(): string {
  return `عذراً، حدث خطأ أثناء معالجة طلبك 😔\nيرجى المحاولة مرة أخرى أو كتابة "مساعدة" للتواصل مع مستشار.`
}

export function outsideWorkingHoursMessage(start: string, end: string): string {
  return `شكراً لتواصلك معنا 🌙\nأوقات العمل: ${start} - ${end}\nسنرد على رسالتك في أقرب وقت خلال ساعات العمل.`
}
