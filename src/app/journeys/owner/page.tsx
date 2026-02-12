import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'رحلة المالك — المساعد العقاري الذكي',
  description:
    'اكتشف رحلة المالك من إنشاء الحساب إلى إدارة إمبراطورية عقارية ذكية',
}

const steps = [
  {
    number: 1,
    title: 'إنشاء الحساب والمنظمة',
    icon: '🏢',
    bullets: [
      'التسجيل في المنصة بالبريد الإلكتروني',
      'إنشاء المنظمة (اسم الشركة، اللون الأساسي)',
      'يتم تعيينه تلقائياً كـ "مالك" بكل الصلاحيات',
    ],
  },
  {
    number: 2,
    title: 'إعداد التكاملات',
    icon: '🔗',
    bullets: [
      'ربط حساب Wasender (واتساب API)',
      'إدخال Instance ID و API Key',
      'التحقق من الاتصال (مؤشر أخضر/أحمر)',
    ],
  },
  {
    number: 3,
    title: 'تخصيص البوت الذكي',
    icon: '🤖',
    bullets: [
      'تسمية البوت ورسالة الترحيب',
      'اختيار نموذج AI (GPT-4o / GPT-4o Mini)',
      'ضبط درجة الحرارة وساعات العمل',
      'تفعيل/تعطيل البوت',
    ],
  },
  {
    number: 4,
    title: 'إضافة العقارات',
    icon: '🏠',
    bullets: [
      'إضافة العقارات بالتفاصيل الكاملة (العنوان، النوع، السعر، المساحة، الموقع)',
      'رفع الصور والمرفقات',
      'تصنيف العقارات (شقة، فيلا، أرض، مكتب)',
    ],
  },
  {
    number: 5,
    title: 'بناء الفريق',
    icon: '👥',
    bullets: [
      'دعوة أعضاء الفريق بالبريد الإلكتروني',
      'تعيين الأدوار (مدير، وكيل، مشاهد)',
      'التحكم بصلاحيات كل عضو',
    ],
  },
  {
    number: 6,
    title: 'المراقبة والإدارة',
    icon: '📊',
    bullets: [
      'متابعة الإحصائيات (محادثات، عملاء، مواعيد)',
      'مراجعة سجل العمليات (من عمل إيش ومتى)',
      'مراقبة الاستخدام الشهري (محادثات، استدعاءات AI، رسائل)',
    ],
  },
  {
    number: 7,
    title: 'التوسع',
    icon: '🚀',
    bullets: [
      'زيادة عدد العقارات والوكلاء',
      'تحسين إعدادات البوت بناءً على الأداء',
      'متابعة تقارير التحويل (عملاء → صفقات)',
    ],
  },
]

export default function OwnerJourneyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a365d]/5 via-white to-[#1a365d]/5">
      {/* ======================== Header ======================== */}
      <header className="relative overflow-hidden bg-[#1a365d] text-white">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="mb-4 inline-block text-6xl" role="img" aria-label="crown">
            👑
          </span>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
            رحلة المالك
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            من إنشاء الحساب إلى إدارة إمبراطورية عقارية ذكية
          </p>
        </div>
      </header>

      {/* ======================== Timeline ======================== */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Intro badge */}
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full bg-[#1a365d]/10 px-5 py-2 text-sm font-semibold text-[#1a365d]">
            7 خطوات نحو النجاح
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

      {/* ======================== CTA Section ======================== */}
      <section className="bg-gradient-to-b from-white to-[#1a365d]/5 px-4 pb-20 pt-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-[#1a365d] p-10 text-center shadow-xl shadow-[#1a365d]/20">
          <span className="mb-4 inline-block text-4xl" role="img" aria-label="sparkles">
            ✨
          </span>
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            جاهز لبدء رحلتك؟
          </h2>
          <p className="mb-8 text-white/70">
            انضم إلى المئات من ملاك العقارات الذين يديرون أعمالهم بذكاء
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-[#1a365d] shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
            >
              ابدأ رحلتك الآن
              <span className="text-lg">←</span>
            </Link>

            <Link
              href="/journeys"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              تعرف على الرحلات الأخرى
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
