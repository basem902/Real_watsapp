export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '') // remove tashkeel
    .replace(/أ|إ|آ/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim()
    .toLowerCase()
}

export function normalizeArabicNumbers(text: string): string {
  if (!text) return text

  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  const persianNums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  let result = text.toString()

  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicNums[i], 'g'), String(i))
    result = result.replace(new RegExp(persianNums[i], 'g'), String(i))
  }

  return result
}

export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '966' + cleaned.substring(1)
  } else if (!cleaned.startsWith('966')) {
    cleaned = '966' + cleaned
  }
  return cleaned
}
