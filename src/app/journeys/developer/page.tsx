import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'رحلة شركة التطوير — المساعد العقاري الذكي',
  description:
    'من المشروع الأول إلى إدارة محفظة عقارية ضخمة بالذكاء الاصطناعي',
}

const steps = [
  {
    number: 1,
    title: 'تسجيل الشركة',
    icon: '🏢',
    bullets: [
      'إنشاء حساب المنظمة باسم الشركة',
      'إدخال بيانات الشركة (الاسم، اللون الرسمي)',
      'الحصول على لوحة تحكم مخصصة',
    ],
  },
  {
    number: 2,
    title: 'رفع المشاريع والوحدات',
    icon: '🏗️',
    bullets: [
      'إضافة المشاريع العقارية (أبراج، مجمعات سكنية، فلل)',
      'تفصيل كل وحدة (شقة، فيلا، محل تجاري)',
      'إدخال المواصفات: المساحة، السعر، الطابق، عدد الغرف',
      'تحديد الحالة: متاح، محجوز، مباع',
    ],
  },
  {
    number: 3,
    title: 'تفعيل قناة واتساب',
    icon: '📱',
    bullets: [
      'ربط رقم واتساب الشركة عبر Wasender',
      'البوت يستقبل استفسارات العملاء تلقائياً 24/7',
      'لا حاجة لموظف متفرغ للرد على الاستفسارات',
    ],
  },
  {
    number: 4,
    title: 'البوت يبيع لك',
    icon: '🤖',
    bullets: [
      'عميل يسأل: "أبي شقة 3 غرف في الرياض بـ 600 ألف"',
      'البوت يبحث في قاعدة البيانات فوراً',
      'يعرض الوحدات المتاحة مع التفاصيل',
      'يحجز معاينة تلقائياً',
      'يسجل العميل كعميل محتمل',
    ],
  },
  {
    number: 5,
    title: 'إدارة العملاء المحتملين',
    icon: '📋',
    bullets: [
      'كل استفسار يتحول لعميل محتمل تلقائياً',
      'تتبع حالة العميل: جديد → مهتم → معاينة → تفاوض → إغلاق',
      'معرفة مصدر كل عميل (واتساب، مباشر)',
      'تقارير التحويل',
    ],
  },
  {
    number: 6,
    title: 'تنسيق الفريق',
    icon: '👥',
    bullets: [
      'إضافة مدراء المبيعات والوكلاء',
      'توزيع العملاء على الوكلاء تلقائياً',
      'كل وكيل يشوف محادثاته فقط',
      'المدير يشوف كل شيء',
    ],
  },
  {
    number: 7,
    title: 'المتابعة والتقارير',
    icon: '📊',
    bullets: [
      'إحصائيات المبيعات: كم استفسار، كم معاينة، كم صفقة',
      'مراقبة أداء الوكلاء',
      'تقارير الاستخدام الشهري',
      'سجل العمليات الكامل',
    ],
  },
  {
    number: 8,
    title: 'التوسع والنمو',
    icon: '🚀',
    bullets: [
      'إضافة مشاريع جديدة بسهولة',
      'توسيع الفريق حسب الحاجة',
      'تحسين ردود البوت بناءً على تحليل المحادثات',
      'ربط أرقام واتساب إضافية',
    ],
  },
]

export default function DeveloperJourneyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a365d]/5 via-white to-[#1a365d]/5">
      {/* ======================== Header ======================== */}
      <header className="relative overflow-hidden bg-[#1a365d] text-white">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/[0.03]" />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="mb-4 inline-block text-6xl" role="img" aria-label="construction">
            🏗️
          </span>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
            رحلة شركة التطوير العقاري
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            من المشروع الأول إلى إدارة محفظة عقارية ضخمة بالذكاء الاصطناعي
          </p>
        </div>
      </header>

      {/* ======================== Timeline ======================== */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Intro badge */}
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full bg-[#1a365d]/10 px-5 py-2 text-sm font-semibold text-[#1a365d]">
            8 خطوات نحو إدارة مشاريع ذكية
          </span>
        </div>

        <div className="relative">
          {/* Vertical timeline line — centered */}
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

                  {/* ---- Card wrapper — alternating sides ---- */}
                  <div
                    className={`flex w-full flex-col md:flex-row ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Spacer — half width on the "other" side */}
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

      {/* ======================== Use Case Box ======================== */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-[#1a365d]/10 border-r-4 border-r-[#1a365d] bg-gradient-to-l from-[#1a365d]/[0.04] to-white p-8 shadow-sm">
          {/* Decorative background element */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#1a365d]/5" />

          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a365d]/10 text-xl">
                💡
              </span>
              <h3 className="text-xl font-bold text-[#1a365d]">مثال عملي</h3>
            </div>

            <p className="text-lg leading-loose text-gray-700">
              شركة النخبة العقارية أضافت{' '}
              <span className="font-bold text-[#1a365d]">150 وحدة</span> في{' '}
              <span className="font-bold text-[#1a365d]">3 مشاريع</span>.
              البوت استقبل{' '}
              <span className="font-bold text-[#1a365d]">500 استفسار شهرياً</span>،
              حوّل{' '}
              <span className="font-bold text-[#1a365d]">120 منها لمعاينات</span>،
              وأغلق{' '}
              <span className="font-bold text-[#1a365d]">35 صفقة</span> —
              بدون موظف واحد متفرغ للردود.
            </p>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { value: '150', label: 'وحدة عقارية' },
                { value: '500', label: 'استفسار/شهر' },
                { value: '120', label: 'معاينة' },
                { value: '35', label: 'صفقة مغلقة' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white p-4 text-center shadow-sm border border-gray-100"
                >
                  <div className="text-2xl font-extrabold text-[#1a365d]">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CTA Section ======================== */}
      <section className="bg-gradient-to-b from-white to-[#1a365d]/5 px-4 pb-20 pt-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-[#1a365d] p-10 text-center shadow-xl shadow-[#1a365d]/20">
          <span className="mb-4 inline-block text-4xl" role="img" aria-label="sparkles">
            ✨
          </span>
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            جاهز لتطوير مشاريعك بذكاء؟
          </h2>
          <p className="mb-8 text-white/70">
            انضم إلى شركات التطوير العقاري التي تدير مبيعاتها بالذكاء الاصطناعي
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-[#1a365d] shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
            >
              سجّل شركتك الآن
              <span className="text-lg">←</span>
            </Link>

            <Link
              href="/journeys"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              استكشف الرحلات الأخرى
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
