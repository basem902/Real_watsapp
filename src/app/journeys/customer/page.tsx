import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'رحلة العميل — المساعد العقاري الذكي',
  description:
    'اكتشف كيف يساعدك المساعد العقاري الذكي في إيجاد عقار أحلامك عبر واتساب',
}

/* ------------------------------------------------------------------ */
/*  Journey steps data                                                 */
/* ------------------------------------------------------------------ */
const steps = [
  {
    number: 1,
    title: 'إرسال رسالة واتساب',
    icon: '📲',
    bullets: [
      'العميل يرسل رسالة لرقم الشركة على واتساب',
      'مثال: "السلام عليكم، أبي شقة 3 غرف في الرياض بميزانية 500 ألف"',
      'لا يحتاج تحميل تطبيق أو تسجيل حساب',
      'واتساب فقط — التطبيق اللي يستخدمه كل يوم',
    ],
  },
  {
    number: 2,
    title: 'البوت يرحب ويفهم',
    icon: '🤖',
    bullets: [
      'رد فوري: "أهلاً وسهلاً! أنا المساعد العقاري الذكي 🏠"',
      'البوت يفهم الطلب بالذكاء الاصطناعي',
      'يسأل أسئلة توضيحية إذا لزم (الحي المفضل؟ شقة أو فيلا؟)',
      'يتعامل بلغة طبيعية — مثل ما تكلم شخص حقيقي',
    ],
  },
  {
    number: 3,
    title: 'عرض العقارات المناسبة',
    icon: '🏠',
    bullets: [
      'البوت يبحث في قاعدة البيانات فوراً',
      '📍 الموقع والحي',
      '💰 السعر',
      '📐 المساحة وعدد الغرف',
      '📸 الصور',
      'يرتب حسب الأنسب',
    ],
  },
  {
    number: 4,
    title: 'الاستفسار والمقارنة',
    icon: '💬',
    bullets: [
      'العميل يسأل عن تفاصيل أكثر عن أي عقار',
      '"كم إيجار الشقة الثانية؟"',
      '"فيه موقف سيارة؟"',
      '"قريبة من مدارس؟"',
      'البوت يرد بالمعلومات المتاحة',
    ],
  },
  {
    number: 5,
    title: 'حجز معاينة',
    icon: '📅',
    bullets: [
      'العميل يطلب معاينة: "أبي أشوف الشقة الأولى"',
      'البوت يحجز موعد تلقائياً',
      'يرسل تأكيد: "تم حجز معاينة يوم الأحد الساعة 4 مساءً 📍 حي النرجس"',
      'تذكير قبل الموعد',
    ],
  },
  {
    number: 6,
    title: 'التحويل لوكيل بشري',
    icon: '👤',
    bullets: [
      'إذا العميل يحتاج تفاصيل أدق أو تفاوض',
      'البوت يحول المحادثة لوكيل عقاري متخصص',
      '"سأحولك الآن للأستاذ أحمد من فريقنا لمساعدتك بالتفاصيل 🤝"',
      'الوكيل يكمل المحادثة من نفس الشات',
    ],
  },
  {
    number: 7,
    title: 'إتمام الصفقة',
    icon: '🎉',
    bullets: [
      'الوكيل يرتب المعاينة ويتابع مع العميل',
      'التفاوض والاتفاق على السعر',
      'إتمام الإجراءات',
      'عميل سعيد بعقاره الجديد!',
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  WhatsApp conversation messages                                     */
/* ------------------------------------------------------------------ */
const chatMessages: { sender: 'customer' | 'bot'; text: string }[] = [
  {
    sender: 'customer',
    text: 'السلام عليكم، أبحث عن شقة في الرياض',
  },
  {
    sender: 'bot',
    text: 'أهلاً وسهلاً! أنا المساعد العقاري الذكي 🏠\nكم ميزانيتك التقريبية؟ وكم غرفة تحتاج؟',
  },
  {
    sender: 'customer',
    text: 'ميزانيتي 500 ألف، وأبي 3 غرف',
  },
  {
    sender: 'bot',
    text: 'ممتاز! وجدت لك 3 شقق مناسبة:\n\n1️⃣ شقة حي النرجس — 480,000 ر.س — 3 غرف — 120م²\n2️⃣ شقة حي الياسمين — 520,000 ر.س — 3 غرف — 135م²\n3️⃣ شقة حي الملقا — 490,000 ر.س — 3 غرف — 125م²',
  },
  {
    sender: 'customer',
    text: 'أبي أشوف الأولى',
  },
  {
    sender: 'bot',
    text: 'تم حجز معاينة! 📅\nالتاريخ: الأحد 15 يناير\nالوقت: 4:00 مساءً\nالموقع: حي النرجس، شارع الأمير محمد',
  },
]

/* ------------------------------------------------------------------ */
/*  Key benefits                                                       */
/* ------------------------------------------------------------------ */
const benefits = [
  { icon: '⚡', text: 'رد فوري — لا انتظار' },
  { icon: '🕐', text: 'متاح 24/7 — حتى الساعة 3 فجراً' },
  { icon: '🎯', text: 'نتائج دقيقة — يفهم طلبك بالضبط' },
  { icon: '📱', text: 'بدون تطبيقات — واتساب فقط' },
  { icon: '🤝', text: 'تحويل سلس — من بوت لوكيل بشري' },
]

/* ================================================================== */
/*  Page Component                                                     */
/* ================================================================== */
export default function CustomerJourneyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a365d]/5 via-white to-[#1a365d]/5">
      {/* ======================== Header ======================== */}
      <header className="relative overflow-hidden bg-[#1a365d] text-white">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-40 w-40 rounded-full bg-white/[0.03]" />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <span
            className="mb-4 inline-block text-6xl"
            role="img"
            aria-label="home"
          >
            🏡
          </span>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
            رحلة العميل
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            من رسالة واتساب واحدة إلى عقار أحلامك
          </p>
        </div>
      </header>

      {/* ======================== Timeline ======================== */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Intro badge */}
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full bg-[#1a365d]/10 px-5 py-2 text-sm font-semibold text-[#1a365d]">
            7 خطوات نحو عقار أحلامك
          </span>
        </div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute right-1/2 top-0 hidden h-full w-0.5 translate-x-1/2 bg-gradient-to-b from-[#1a365d]/30 via-[#1a365d]/20 to-[#1a365d]/5 md:block" />

          <div className="flex flex-col gap-12 md:gap-16">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0
              return (
                <div key={step.number} className="relative">
                  {/* Number circle on timeline (desktop) */}
                  <div className="absolute right-1/2 top-8 z-10 hidden translate-x-1/2 md:flex">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a365d] text-lg font-bold text-white shadow-lg shadow-[#1a365d]/25 ring-4 ring-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Card wrapper — alternating sides */}
                  <div
                    className={`flex w-full flex-col md:flex-row ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Spacer */}
                    <div className="hidden md:block md:w-1/2" />

                    {/* Card */}
                    <div className="w-full md:w-1/2">
                      <div
                        className={`group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                          isEven ? 'md:ml-10' : 'md:mr-10'
                        }`}
                      >
                        {/* Mobile number badge */}
                        <div className="mb-4 flex items-center gap-3 md:hidden">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a365d] text-sm font-bold text-white">
                            {step.number}
                          </span>
                          <span className="text-2xl">{step.icon}</span>
                        </div>

                        {/* Desktop icon + title */}
                        <div className="hidden items-center gap-3 md:flex">
                          <span className="text-3xl">{step.icon}</span>
                          <h3 className="text-xl font-bold text-[#1a365d]">
                            {step.title}
                          </h3>
                        </div>

                        {/* Mobile title */}
                        <h3 className="mb-3 text-lg font-bold text-[#1a365d] md:hidden">
                          {step.title}
                        </h3>

                        {/* Divider */}
                        <div className="my-3 h-px w-full bg-gradient-to-l from-transparent via-[#1a365d]/15 to-transparent" />

                        {/* Bullets */}
                        <ul className="space-y-2.5">
                          {step.bullets.map((bullet, bIdx) => (
                            <li
                              key={bIdx}
                              className="flex items-start gap-2 leading-relaxed text-gray-600"
                            >
                              <span className="mt-1.5 block h-2 w-2 shrink-0 rounded-full bg-[#1a365d]/30" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* End-of-timeline marker */}
          <div className="mt-12 hidden justify-center md:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a365d]/10 text-xl">
              ✅
            </span>
          </div>
        </div>
      </section>

      {/* ======================== WhatsApp Mockup ======================== */}
      <section className="bg-gradient-to-b from-white to-[#e8f5e9]/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-[#25d366]/10 px-5 py-2 text-sm font-semibold text-[#128c7e]">
              شكل المحادثة الفعلية
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#1a365d] md:text-3xl">
              محادثة واتساب حقيقية
            </h2>
          </div>

          {/* Phone frame */}
          <div className="mx-auto max-w-md overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-2xl shadow-gray-300/30">
            {/* WhatsApp header bar */}
            <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg">
                🏠
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  المساعد العقاري الذكي
                </p>
                <p className="text-xs text-white/70">متصل الآن</p>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </div>
            </div>

            {/* Chat area */}
            <div
              className="space-y-3 px-3 py-4"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'p\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23d5e8d4\' fill-opacity=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill=\'%23ece5dd\' width=\'200\' height=\'200\'/%3E%3Crect fill=\'url(%23p)\' width=\'200\' height=\'200\'/%3E%3C/svg%3E")',
                backgroundSize: '200px 200px',
              }}
            >
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === 'customer' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'customer'
                        ? 'rounded-br-md bg-white text-gray-800'
                        : 'rounded-bl-md bg-[#dcf8c6] text-gray-800'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <span className="mb-1 block text-xs font-semibold text-[#128c7e]">
                        المساعد العقاري 🤖
                      </span>
                    )}
                    <span className="whitespace-pre-line">{msg.text}</span>
                    <span className="mt-1 block text-left text-[10px] text-gray-400">
                      {msg.sender === 'bot' ? '✓✓' : ''}{' '}
                      {i % 2 === 0 ? '10:30' : '10:3' + (i + 1)} ص
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 border-t border-gray-100 bg-[#f0f0f0] px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <div className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-gray-400">
                اكتب رسالة...
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white">
                <svg
                  className="h-5 w-5 rotate-180"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== Benefits ======================== */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-[#1a365d]/10 px-5 py-2 text-sm font-semibold text-[#1a365d]">
            لماذا يحبنا العملاء؟
          </span>
          <h2 className="mt-4 text-2xl font-bold text-[#1a365d] md:text-3xl">
            مزايا التجربة
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a365d]/5 text-2xl transition-transform duration-300 group-hover:scale-110">
                {b.icon}
              </span>
              <p className="text-base font-medium text-gray-700">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================== CTA Section ======================== */}
      <section className="bg-gradient-to-b from-white to-[#1a365d]/5 px-4 pb-20 pt-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-[#1a365d] p-10 text-center shadow-xl shadow-[#1a365d]/20">
          <span
            className="mb-4 inline-block text-4xl"
            role="img"
            aria-label="whatsapp"
          >
            💬
          </span>
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            مستعد تلاقي عقار أحلامك؟
          </h2>
          <p className="mb-8 text-white/70">
            جرّب الآن — أرسل رسالة واتساب وابدأ رحلتك
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="#"
              className="inline-flex items-center gap-3 rounded-xl bg-[#25d366] px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-[#25d366]/30 transition-all duration-200 hover:bg-[#20bd5a] hover:shadow-xl"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              جرّب الآن — أرسل رسالة واتساب
            </Link>

            <Link
              href="/journeys"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              اكتشف الرحلات الأخرى
            </Link>
          </div>
        </div>
      </section>

      {/* ======================== Footer ======================== */}
      <footer className="py-8 text-center text-sm text-gray-400">
        المساعد العقاري الذكي &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
