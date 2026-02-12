import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'الرحلة الكاملة — المساعد العقاري الذكي',
  description:
    'اكتشف كيف يخدم النظام كل شخص في منظومة العقارات — المالك، شركة التطوير، المسوق، والعميل',
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const flowSteps = [
  { icon: '💬', label: 'العميل يرسل واتساب' },
  { icon: '🤖', label: 'البوت يرد ويبحث' },
  { icon: '📝', label: 'يسجل العميل' },
  { icon: '📅', label: 'يحجز معاينة' },
  { icon: '🔄', label: 'يحول للوكيل' },
  { icon: '🤝', label: 'الوكيل يغلق الصفقة' },
  { icon: '📊', label: 'المالك يراقب الأداء' },
]

const journeys = [
  {
    slug: 'owner',
    title: 'رحلة المالك',
    icon: '👑',
    description: 'من إنشاء الحساب إلى إدارة إمبراطورية عقارية ذكية',
    points: ['إنشاء المنظمة', 'بناء الفريق', 'مراقبة الأداء'],
    accent: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      badge: 'bg-amber-100 text-amber-800',
      hover: 'hover:border-amber-400 hover:shadow-amber-100',
      icon: 'bg-amber-100',
      dot: 'bg-amber-400',
    },
  },
  {
    slug: 'developer',
    title: 'رحلة شركة التطوير',
    icon: '🏗️',
    description: 'من المشروع الأول إلى إدارة محفظة عقارية ضخمة',
    points: ['رفع المشاريع', 'أتمتة المبيعات', 'تقارير الأداء'],
    accent: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      badge: 'bg-blue-100 text-blue-800',
      hover: 'hover:border-blue-400 hover:shadow-blue-100',
      icon: 'bg-blue-100',
      dot: 'bg-blue-400',
    },
  },
  {
    slug: 'marketer',
    title: 'رحلة المسوق العقاري',
    icon: '📣',
    description: 'من أول عميل إلى شبكة عملاء واسعة',
    points: ['استقبال العملاء', 'المحادثات', 'إغلاق الصفقات'],
    accent: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      badge: 'bg-green-100 text-green-800',
      hover: 'hover:border-green-400 hover:shadow-green-100',
      icon: 'bg-green-100',
      dot: 'bg-green-400',
    },
  },
  {
    slug: 'customer',
    title: 'رحلة العميل',
    icon: '🏡',
    description: 'من رسالة واتساب واحدة إلى عقار أحلامك',
    points: ['رسالة واتساب', 'بحث ذكي', 'حجز معاينة'],
    accent: {
      bg: 'bg-teal-50',
      border: 'border-teal-300',
      badge: 'bg-teal-100 text-teal-800',
      hover: 'hover:border-teal-400 hover:shadow-teal-100',
      icon: 'bg-teal-100',
      dot: 'bg-teal-400',
    },
  },
]

const stats = [
  { icon: '⚡', label: 'رد فوري خلال ثواني' },
  { icon: '🕐', label: 'متاح 24/7' },
  { icon: '🤖', label: 'ذكاء اصطناعي متقدم' },
  { icon: '📱', label: 'واتساب — لا تطبيقات إضافية' },
  { icon: '🔒', label: 'بيانات مشفرة وآمنة' },
  { icon: '👥', label: 'دعم فرق العمل' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function JourneysPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] via-white to-[#f0f4f8]">
      {/* ─────────────────────── Hero ─────────────────────── */}
      <section className="relative overflow-hidden bg-[#1a365d] text-white">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <span className="mb-4 inline-block text-6xl">🗺️</span>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
            رحلة المساعد العقاري الذكي
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-blue-200 md:text-xl">
            اكتشف كيف يخدم النظام كل شخص في منظومة العقارات
          </p>
        </div>
      </section>

      {/* ─────────────── Complete Flow Diagram ─────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-[#1a365d] md:text-3xl">
          المسار الكامل للنظام
        </h2>
        <p className="mb-10 text-center text-gray-500">
          من أول رسالة واتساب إلى إغلاق الصفقة ومتابعة الأداء
        </p>

        {/* Desktop: horizontal flow */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between gap-0">
            {flowSteps.map((step, i) => (
              <div key={i} className="flex items-center">
                {/* card */}
                <div className="flex w-36 flex-col items-center rounded-2xl border border-gray-200 bg-white px-3 py-5 shadow-sm">
                  <span className="mb-2 text-3xl">{step.icon}</span>
                  <span className="text-center text-sm font-semibold text-[#1a365d]">
                    {step.label}
                  </span>
                </div>
                {/* arrow */}
                {i < flowSteps.length - 1 && (
                  <div className="mx-1 flex items-center text-[#1a365d]/40">
                    <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                      <path
                        d="M0 8h24m0 0l-6-6m6 6l-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile / Tablet: vertical flow */}
        <div className="lg:hidden">
          <div className="relative mx-auto flex max-w-xs flex-col items-center">
            {flowSteps.map((step, i) => (
              <div key={i} className="flex w-full flex-col items-center">
                <div className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="text-sm font-semibold text-[#1a365d]">
                    {step.label}
                  </span>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="my-2 text-[#1a365d]/40">
                    <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
                      <path
                        d="M8 0v24m0 0l-6-6m6 6l6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── Journey Cards 2×2 Grid ─────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-[#1a365d] md:text-3xl">
          اختر رحلتك
        </h2>
        <p className="mb-10 text-center text-gray-500">
          أربع رحلات — أربعة أدوار — نظام واحد متكامل
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {journeys.map((j) => (
            <Link
              key={j.slug}
              href={`/journeys/${j.slug}`}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 ${j.accent.border} ${j.accent.bg} p-8 shadow-md transition-all duration-300 ${j.accent.hover} hover:-translate-y-1 hover:shadow-xl`}
            >
              {/* icon + title */}
              <div className="mb-4 flex items-center gap-4">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${j.accent.icon}`}
                >
                  {j.icon}
                </span>
                <h3 className="text-xl font-bold text-[#1a365d]">{j.title}</h3>
              </div>

              {/* description */}
              <p className="mb-5 text-gray-600">{j.description}</p>

              {/* key points */}
              <ul className="mb-6 space-y-2">
                {j.points.map((pt, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className={`inline-block h-2 w-2 rounded-full ${j.accent.dot}`} />
                    {pt}
                  </li>
                ))}
              </ul>

              {/* CTA arrow */}
              <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#1a365d] transition-transform group-hover:translate-x-[-4px]">
                <span>استكشف الرحلة</span>
                <svg
                  className="h-4 w-4 rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────── How the System Connects Everyone ─────────── */}
      <section className="bg-[#1a365d]/[0.03] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-2 text-center text-2xl font-bold text-[#1a365d] md:text-3xl">
            كيف يربط النظام الجميع؟
          </h2>
          <p className="mb-12 text-center text-gray-500">
            منظومة متكاملة تجمع كل الأطراف في مكان واحد
          </p>

          <div className="flex flex-col items-center gap-4">
            {/* Owner - Top */}
            <div className="flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-300 bg-amber-50 text-3xl shadow-md">
                👑
              </div>
              <span className="mt-2 text-sm font-bold text-[#1a365d]">المالك</span>
            </div>

            {/* Branches down */}
            <div className="flex items-center gap-2 text-[#1a365d]/30">
              <svg width="2" height="32" viewBox="0 0 2 32">
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="32"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            {/* Dashboard + Team row */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16">
              {/* Dashboard */}
              <div className="flex flex-col items-center">
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm">
                  <span className="text-lg">📊</span>
                  <span className="ms-2 text-sm font-semibold text-[#1a365d]">
                    لوحة التحكم
                  </span>
                </div>
                <span className="mt-1 text-xs text-gray-400">يدير ويراقب</span>
              </div>
              {/* Team */}
              <div className="flex flex-col items-center">
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm">
                  <span className="text-lg">👥</span>
                  <span className="ms-2 text-sm font-semibold text-[#1a365d]">الفريق</span>
                </div>
                <span className="mt-1 text-xs text-gray-400">يبني الفريق</span>
              </div>
            </div>

            {/* connectors */}
            <div className="flex items-center gap-2 text-[#1a365d]/30">
              <svg width="2" height="24" viewBox="0 0 2 24">
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            {/* Developer + Marketer row */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16">
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue-300 bg-blue-50 text-2xl shadow-md">
                  🏗️
                </div>
                <span className="mt-2 text-sm font-bold text-[#1a365d]">شركة التطوير</span>
                <span className="text-xs text-gray-400">ترفع العقارات</span>
              </div>

              {/* horizontal connector */}
              <div className="hidden text-[#1a365d]/30 md:block">
                <svg width="60" height="2" viewBox="0 0 60 2">
                  <line
                    x1="0"
                    y1="1"
                    x2="60"
                    y2="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-300 bg-green-50 text-2xl shadow-md">
                  📣
                </div>
                <span className="mt-2 text-sm font-bold text-[#1a365d]">المسوق</span>
                <span className="text-xs text-gray-400">يتابع العملاء</span>
              </div>
            </div>

            {/* connector down to bot */}
            <div className="flex items-center gap-2 text-[#1a365d]/30">
              <svg width="2" height="32" viewBox="0 0 2 32">
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="32"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            {/* Smart Bot - Center */}
            <div className="flex flex-col items-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#1a365d] bg-[#1a365d]/10 text-4xl shadow-lg">
                🤖
                {/* pulse ring */}
                <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#1a365d]/20" />
              </div>
              <span className="mt-2 text-sm font-bold text-[#1a365d]">البوت الذكي</span>
              <span className="text-xs text-gray-400">يستقبل ويرد ويبحث</span>
            </div>

            {/* connector down to customer */}
            <div className="flex items-center gap-2 text-[#1a365d]/30">
              <svg width="2" height="32" viewBox="0 0 2 32">
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="32"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            {/* Customer - Bottom */}
            <div className="flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-teal-300 bg-teal-50 text-3xl shadow-md">
                🏡
              </div>
              <span className="mt-2 text-sm font-bold text-[#1a365d]">العميل</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── Key Statistics Bar ─────────────── */}
      <section className="bg-[#1a365d] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 px-4 py-6 text-center backdrop-blur-sm"
              >
                <span className="text-3xl">{s.icon}</span>
                <span className="text-sm font-semibold text-white">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── Bottom CTA ─────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-[#1a365d]">
            جاهز تبدأ رحلتك؟
          </h2>
          <p className="mb-8 text-gray-500">
            انضم الآن واستمتع بأتمتة عقارية متكاملة عبر الواتساب والذكاء الاصطناعي
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1a365d] px-10 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#234578] hover:shadow-xl"
            >
              ابدأ الآن مجاناً
              <svg
                className="h-5 w-5 rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#1a365d] px-10 py-4 text-lg font-bold text-[#1a365d] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1a365d]/5 hover:shadow-md"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────── Footer Note ─────────────── */}
      <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-400">
        <p>المساعد العقاري الذكي &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
