import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'رحلة المسوق — المساعد العقاري الذكي',
  description:
    'اكتشف رحلة المسوق العقاري من أول عميل إلى شبكة عملاء واسعة بمساعدة الذكاء الاصطناعي',
}

const steps = [
  {
    number: 1,
    title: 'الانضمام للفريق',
    icon: '🤝',
    bullets: [
      'يتلقى دعوة من المالك أو المدير',
      'يسجل بالبريد الإلكتروني',
      'يدخل لوحة التحكم بصلاحيات "وكيل"',
    ],
  },
  {
    number: 2,
    title: 'استكشاف العقارات المتاحة',
    icon: '🔍',
    bullets: [
      'تصفح كل العقارات المضافة في المنصة',
      'فلترة حسب النوع، المدينة، السعر',
      'معرفة تفاصيل كل عقار (المساحة، الغرف، الصور)',
    ],
  },
  {
    number: 3,
    title: 'استقبال العملاء',
    icon: '💬',
    bullets: [
      'العملاء يتواصلون عبر واتساب',
      'البوت الذكي يرد تلقائياً ويجمع المعلومات',
      'المحادثات تتحول للمسوق تلقائياً أو يدوياً',
      'إشعار فوري عند تحويل محادثة جديدة',
    ],
  },
  {
    number: 4,
    title: 'متابعة المحادثات',
    icon: '📱',
    bullets: [
      'فتح صفحة المحادثات ومتابعة الدردشات',
      'إيقاف البوت والرد يدوياً عند الحاجة',
      'إرسال تفاصيل العقارات مباشرة',
      'تحديث لحظي — الرسائل تظهر فوراً (Realtime)',
    ],
  },
  {
    number: 5,
    title: 'إدارة العملاء المحتملين',
    icon: '📋',
    bullets: [
      'متابعة حالة كل عميل (جديد، مهتم، معاينة، تفاوض)',
      'تحديث الحالة بنقرة واحدة',
      'إضافة ملاحظات على كل عميل',
      'فلترة والبحث بسهولة',
    ],
  },
  {
    number: 6,
    title: 'جدولة المعاينات',
    icon: '📅',
    bullets: [
      'حجز مواعيد معاينات للعملاء',
      'ربط العميل بالعقار المناسب',
      'تتبع حالة الموعد (مجدول، مؤكد، منتهي، ملغي)',
    ],
  },
  {
    number: 7,
    title: 'إغلاق الصفقات',
    icon: '🎯',
    bullets: [
      'تحويل العميل المحتمل لصفقة ناجحة',
      'تحديث حالة العقار (متاح → محجوز → مباع)',
      'تسجيل النتيجة في النظام',
    ],
  },
]

const dailySchedule = [
  {
    time: '8:00',
    label: 'صباحاً',
    task: 'يفتح لوحة التحكم، يراجع الإحصائيات',
    icon: '📊',
  },
  {
    time: '8:30',
    label: 'صباحاً',
    task: 'يتابع المحادثات الجديدة من الليل (البوت رد عليها)',
    icon: '🤖',
  },
  {
    time: '9:00',
    label: 'صباحاً',
    task: 'يتواصل مع عملاء المعاينات المؤكدة',
    icon: '📞',
  },
  {
    time: '11:00',
    label: 'صباحاً',
    task: 'يأخذ عميل لمعاينة عقار',
    icon: '🏠',
  },
  {
    time: '1:00',
    label: 'ظهراً',
    task: 'يحدث حالة العملاء في النظام',
    icon: '✏️',
  },
  {
    time: '3:00',
    label: 'عصراً',
    task: 'يتابع محادثات واتساب الجديدة',
    icon: '💬',
  },
  {
    time: '5:00',
    label: 'مساءً',
    task: 'يراجع ملخص اليوم ويخطط للغد',
    icon: '📝',
  },
]

export default function MarketerJourneyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a365d]/5 via-white to-[#1a365d]/5">
      {/* ======================== Header ======================== */}
      <header className="relative overflow-hidden bg-[#1a365d] text-white">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/[0.03]" />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="mb-4 inline-block text-6xl" role="img" aria-label="megaphone">
            📣
          </span>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
            رحلة المسوق العقاري
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            من أول عميل إلى شبكة عملاء واسعة بمساعدة الذكاء الاصطناعي
          </p>
        </div>
      </header>

      {/* ======================== Timeline ======================== */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Intro badge */}
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full bg-[#1a365d]/10 px-5 py-2 text-sm font-semibold text-[#1a365d]">
            7 خطوات لتصبح مسوقاً عقارياً ناجحاً
          </span>
        </div>

        <div className="relative">
          {/* Vertical timeline line -- centered */}
          <div className="absolute right-1/2 top-0 hidden h-full w-0.5 translate-x-1/2 bg-gradient-to-b from-[#1a365d]/30 via-[#1a365d]/20 to-[#1a365d]/5 md:block" />

          <div className="flex flex-col gap-12 md:gap-16">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0
              return (
                <div key={step.number} className="relative">
                  {/* ---- Number circle on timeline (desktop) ---- */}
                  <div className="absolute right-1/2 top-8 z-10 hidden translate-x-1/2 md:flex">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a365d] text-lg font-bold text-white shadow-lg shadow-[#1a365d]/25 ring-4 ring-white">
                      {step.number}
                    </span>
                  </div>

                  {/* ---- Card wrapper -- alternating sides ---- */}
                  <div
                    className={`flex w-full flex-col md:flex-row ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Spacer -- half width on the "other" side */}
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
                              className="flex items-start gap-2 text-gray-600 leading-relaxed"
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

      {/* ======================== Daily Workflow ======================== */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border-2 border-[#1a365d]/10 bg-gradient-to-br from-[#1a365d]/[0.03] to-white">
            {/* Section header */}
            <div className="bg-[#1a365d]/[0.06] px-8 py-6 text-center">
              <span className="mb-2 inline-block text-3xl" role="img" aria-label="clock">
                🕐
              </span>
              <h2 className="text-2xl font-extrabold text-[#1a365d] md:text-3xl">
                يوم في حياة المسوق العقاري
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                كيف يقضي المسوق يومه باستخدام المنصة
              </p>
            </div>

            {/* Timeline */}
            <div className="relative px-6 py-10 sm:px-10">
              {/* Vertical line */}
              <div className="absolute right-10 top-10 hidden h-[calc(100%-5rem)] w-0.5 bg-gradient-to-b from-[#1a365d]/25 via-[#1a365d]/15 to-[#1a365d]/5 sm:right-[3.25rem] sm:block" />

              <div className="flex flex-col gap-6">
                {dailySchedule.map((item, idx) => (
                  <div key={idx} className="group relative flex items-start gap-4 sm:gap-6">
                    {/* Time dot on timeline (desktop) */}
                    <div className="relative z-10 hidden sm:block">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a365d] text-xs text-white shadow ring-4 ring-[#1a365d]/5 transition-all group-hover:ring-[#1a365d]/20 group-hover:shadow-md">
                        {item.icon}
                      </span>
                    </div>

                    {/* Card */}
                    <div className="flex flex-1 items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-[#1a365d]/20">
                      {/* Mobile icon */}
                      <span className="text-xl sm:hidden">{item.icon}</span>

                      {/* Time badge */}
                      <div className="flex shrink-0 flex-col items-center">
                        <span className="text-lg font-bold text-[#1a365d] tabular-nums">
                          {item.time}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {item.label}
                        </span>
                      </div>

                      {/* Separator */}
                      <div className="h-8 w-px bg-gray-200" />

                      {/* Task description */}
                      <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                        {item.task}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CTA Section ======================== */}
      <section className="bg-gradient-to-b from-white to-[#1a365d]/5 px-4 pb-20 pt-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-[#1a365d] p-10 text-center shadow-xl shadow-[#1a365d]/20">
          <span className="mb-4 inline-block text-4xl" role="img" aria-label="rocket">
            🚀
          </span>
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            جاهز لبدء رحلتك كمسوق عقاري؟
          </h2>
          <p className="mb-8 text-white/70">
            انضم لفريقك وابدأ ببناء شبكة عملاء واسعة بمساعدة الذكاء الاصطناعي
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-[#1a365d] shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
            >
              انضم لفريقك الآن
              <span className="text-lg">←</span>
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

      {/* ======================== Footer note ======================== */}
      <footer className="py-8 text-center text-sm text-gray-400">
        المساعد العقاري الذكي &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
