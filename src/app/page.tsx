'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const stats = [
  { number: '24/7', label: 'متاح على مدار الساعة', icon: '🕐' },
  { number: '<3s', label: 'متوسط وقت الرد', icon: '⚡' },
  { number: '95%', label: 'دقة فهم الطلبات', icon: '🎯' },
  { number: '∞', label: 'عدد المحادثات', icon: '💬' },
]

const features = [
  {
    icon: '🤖',
    title: 'بوت ذكي بالذكاء الاصطناعي',
    desc: 'يفهم طلبات العملاء بالعربي ويبحث عن العقارات المناسبة ويحجز المعاينات تلقائياً',
    color: 'from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
  },
  {
    icon: '📱',
    title: 'واتساب — لا تطبيقات إضافية',
    desc: 'العملاء يتواصلون من واتساب مباشرة. لا حاجة لتحميل أي تطبيق جديد',
    color: 'from-green-500/10 to-emerald-500/10',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
  },
  {
    icon: '📊',
    title: 'لوحة تحكم متكاملة',
    desc: 'إدارة العقارات، العملاء، المواعيد، الفريق، والمحادثات من مكان واحد',
    color: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
  },
  {
    icon: '👥',
    title: 'إدارة فريق العمل',
    desc: 'أضف وكلاء ومدراء بصلاحيات مختلفة. كل واحد يشوف اللي يخصه',
    color: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
  },
  {
    icon: '🔒',
    title: 'أمان وخصوصية',
    desc: 'بيانات مشفرة، صلاحيات على مستوى الصفوف، كل منظمة معزولة تماماً',
    color: 'from-red-500/10 to-rose-500/10',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
  },
  {
    icon: '⚡',
    title: 'تحديث لحظي',
    desc: 'الرسائل والإشعارات تظهر فوراً بتقنية Realtime. لا تفوتك أي محادثة',
    color: 'from-cyan-500/10 to-teal-500/10',
    border: 'border-cyan-200',
    iconBg: 'bg-cyan-100',
  },
]

const flowSteps = [
  { icon: '💬', label: 'العميل يرسل واتساب', color: 'bg-green-500' },
  { icon: '🤖', label: 'البوت يرد ويبحث', color: 'bg-blue-500' },
  { icon: '📝', label: 'يسجل العميل تلقائياً', color: 'bg-purple-500' },
  { icon: '🏠', label: 'يعرض العقارات', color: 'bg-amber-500' },
  { icon: '📅', label: 'يحجز معاينة', color: 'bg-teal-500' },
  { icon: '👤', label: 'يحول للوكيل', color: 'bg-indigo-500' },
  { icon: '🎉', label: 'صفقة ناجحة!', color: 'bg-rose-500' },
]

const journeys = [
  {
    slug: 'owner',
    icon: '👑',
    title: 'رحلة المالك',
    desc: 'أنشئ منظمتك، ابنِ فريقك، وراقب كل شيء من لوحة تحكم واحدة',
    steps: ['إنشاء المنظمة', 'إعداد البوت', 'بناء الفريق', 'مراقبة الأداء'],
    accent: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-100 text-amber-700',
  },
  {
    slug: 'developer',
    icon: '🏗️',
    title: 'رحلة شركة التطوير',
    desc: 'ارفع مشاريعك، وخلّ البوت يبيع لك. أتمتة كاملة للمبيعات العقارية',
    steps: ['رفع المشاريع', 'تفعيل واتساب', 'أتمتة المبيعات', 'تقارير الأداء'],
    accent: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    dotColor: 'bg-blue-400',
    badgeBg: 'bg-blue-100 text-blue-700',
  },
  {
    slug: 'marketer',
    icon: '📣',
    title: 'رحلة المسوق العقاري',
    desc: 'استقبل العملاء، تابع المحادثات، واغلق الصفقات بمساعدة الذكاء الاصطناعي',
    steps: ['استقبال العملاء', 'متابعة المحادثات', 'جدولة المعاينات', 'إغلاق الصفقات'],
    accent: 'green',
    gradient: 'from-green-500 to-emerald-500',
    lightBg: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverBorder: 'hover:border-green-400',
    dotColor: 'bg-green-400',
    badgeBg: 'bg-green-100 text-green-700',
  },
  {
    slug: 'customer',
    icon: '🏡',
    title: 'رحلة العميل',
    desc: 'رسالة واتساب واحدة تكفي. البوت يبحث لك، يعرض الخيارات، ويحجز المعاينة',
    steps: ['إرسال واتساب', 'بحث ذكي', 'عرض النتائج', 'حجز معاينة'],
    accent: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    lightBg: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hoverBorder: 'hover:border-teal-400',
    dotColor: 'bg-teal-400',
    badgeBg: 'bg-teal-100 text-teal-700',
  },
]

const chatDemo: { sender: 'customer' | 'bot'; text: string }[] = [
  { sender: 'customer', text: 'السلام عليكم، أبحث عن شقة في الرياض' },
  { sender: 'bot', text: 'أهلاً وسهلاً! أنا المساعد العقاري الذكي 🏠\nكم ميزانيتك التقريبية؟ وكم غرفة تحتاج؟' },
  { sender: 'customer', text: 'ميزانيتي 500 ألف، وأبي 3 غرف' },
  { sender: 'bot', text: 'ممتاز! وجدت لك 3 شقق مناسبة:\n\n1️⃣ شقة حي النرجس — 480,000 ر.س\n2️⃣ شقة حي الياسمين — 520,000 ر.س\n3️⃣ شقة حي الملقا — 490,000 ر.س' },
  { sender: 'customer', text: 'أبي أشوف الأولى' },
  { sender: 'bot', text: 'تم حجز معاينة! 📅\nالأحد 15 يناير — 4:00 مساءً\n📍 حي النرجس، شارع الأمير محمد' },
]

const dashboardFeatures = [
  { icon: '🏠', title: 'العقارات', desc: 'إضافة وتعديل وتصنيف العقارات' },
  { icon: '💬', title: 'المحادثات', desc: 'دردشة مباشرة مع تحديث لحظي' },
  { icon: '👥', title: 'العملاء', desc: 'تتبع حالة كل عميل محتمل' },
  { icon: '📅', title: 'المواعيد', desc: 'جدولة وإدارة المعاينات' },
  { icon: '👤', title: 'الفريق', desc: 'إدارة الأعضاء والصلاحيات' },
  { icon: '📊', title: 'الإحصائيات', desc: 'تقارير الأداء والاستخدام' },
]

/* ================================================================== */
/*  SCROLL REVEAL HOOK                                                 */
/* ================================================================== */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
      {children}
    </div>
  )
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved === 'dark' || (!saved && prefersDark)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDark = useCallback(() => {
    setDark(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden transition-colors duration-300">

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-[#1a365d]/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="text-lg font-bold text-white hidden sm:inline">المساعد العقاري الذكي</span>
            <span className="text-lg font-bold text-white sm:hidden">المساعد الذكي</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-white/80 hover:text-white transition-colors">المميزات</a>
            <a href="#how-it-works" className="text-sm text-white/80 hover:text-white transition-colors">كيف يعمل</a>
            <a href="#journeys" className="text-sm text-white/80 hover:text-white transition-colors">الرحلات</a>
            <a href="#demo" className="text-sm text-white/80 hover:text-white transition-colors">تجربة حية</a>
            <a href="#contact" className="text-sm text-white/80 hover:text-white transition-colors">تواصل معنا</a>
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="dark-toggle bg-white/10 text-white hover:bg-white/20"
              aria-label="تبديل الوضع"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors">
              دخول
            </Link>
            <Link href="/register" className="rounded-lg bg-white px-5 py-2 text-sm font-bold text-[#1a365d] shadow-lg shadow-white/10 hover:bg-gray-100 transition-all">
              ابدأ مجاناً
            </Link>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-white" aria-label="القائمة">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenu
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-white/10 bg-[#1a365d] dark:bg-gray-900 px-4 pb-4 pt-2 animate-fade-in-up">
            <div className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMobileMenu(false)} className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10">المميزات</a>
              <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10">كيف يعمل</a>
              <a href="#journeys" onClick={() => setMobileMenu(false)} className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10">الرحلات</a>
              <a href="#demo" onClick={() => setMobileMenu(false)} className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10">تجربة حية</a>
              <a href="#contact" onClick={() => setMobileMenu(false)} className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10">تواصل معنا</a>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={toggleDark} className="dark-toggle bg-white/10 text-white hover:bg-white/20" aria-label="تبديل الوضع">{dark ? '☀️' : '🌙'}</button>
                <Link href="/login" className="flex-1 rounded-lg border border-white/30 py-2 text-center text-sm font-medium text-white">دخول</Link>
                <Link href="/register" className="flex-1 rounded-lg bg-white py-2 text-center text-sm font-bold text-[#1a365d]">ابدأ مجاناً</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-[#1a365d] via-[#234578] to-[#1a365d] pt-24 pb-0">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-white/[0.03] animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-white/[0.02] animate-float" />
        <div className="shimmer-bg pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Text */}
            <div className="py-16 lg:py-24 text-center lg:text-right">
              <div className="animate-fade-in-up">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm mb-6">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  مدعوم بالذكاء الاصطناعي
                </span>
              </div>

              <h1 className="animate-fade-in-up animate-delay-100 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                وكيلك العقاري
                <br />
                <span className="bg-gradient-to-l from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                  الذكي على واتساب
                </span>
              </h1>

              <p className="animate-fade-in-up animate-delay-200 mt-6 text-lg leading-relaxed text-white/70 sm:text-xl max-w-xl mx-auto lg:mx-0">
                حوّل واتساب شركتك لمحرك مبيعات عقاري يعمل 24 ساعة.
                بوت ذكي يرد، يبحث، يحجز معاينات، ويحوّل الاستفسارات لصفقات.
              </p>

              <div className="animate-fade-in-up animate-delay-300 mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-[#1a365d] shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  ابدأ مجاناً
                  <svg className="h-5 w-5 rotate-180 transition-transform group-hover:translate-x-[-4px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-medium text-white transition-all duration-300 hover:bg-white/10"
                >
                  شاهد العرض
                  <span className="text-xl">▶</span>
                </a>
              </div>

              {/* Stats row */}
              <div className="animate-fade-in-up animate-delay-400 mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((s, i) => (
                  <div key={i} className="rounded-2xl bg-white/[0.08] px-3 py-4 text-center backdrop-blur-sm">
                    <span className="text-2xl">{s.icon}</span>
                    <p className="mt-1 text-2xl font-extrabold text-white">{s.number}</p>
                    <p className="text-xs text-white/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone mockup */}
            <div className="hidden lg:flex justify-center pb-0">
              <div className="animate-scale-in animate-delay-300 relative">
                {/* Glow ring */}
                <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent blur-2xl" />

                {/* Phone */}
                <div className="relative w-[320px] rounded-[2.5rem] border-4 border-gray-700 bg-gray-900 p-3 shadow-2xl shadow-black/50">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 rounded-b-2xl bg-gray-900 z-10" />

                  <div className="overflow-hidden rounded-[2rem] bg-white">
                    {/* WA header */}
                    <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 pt-5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-base">🏠</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">المساعد العقاري</p>
                        <p className="text-[10px] text-white/70">متصل الآن</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-2 px-2 py-3" style={{ background: '#ece5dd', minHeight: '350px' }}>
                      {chatDemo.slice(0, 4).map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${msg.sender === 'customer'
                            ? 'rounded-br-sm bg-white text-gray-800'
                            : 'rounded-bl-sm bg-[#dcf8c6] text-gray-800'
                            }`}>
                            {msg.sender === 'bot' && <span className="text-[9px] font-bold text-[#128c7e] block mb-0.5">المساعد 🤖</span>}
                            <span className="whitespace-pre-line">{msg.text}</span>
                          </div>
                        </div>
                      ))}
                      {/* Typing indicator */}
                      <div className="flex justify-end">
                        <div className="flex gap-1 rounded-xl bg-[#dcf8c6] px-4 py-3 shadow-sm">
                          <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
                          <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
                          <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Input bar */}
                    <div className="flex items-center gap-2 bg-[#f0f0f0] px-3 py-2">
                      <div className="flex-1 rounded-full bg-white px-3 py-1.5 text-[10px] text-gray-400">اكتب رسالة...</div>
                      <div className="h-7 w-7 rounded-full bg-[#25d366] flex items-center justify-center">
                        <svg className="h-3.5 w-3.5 rotate-180 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="relative mt-0">
          <svg className="block w-full h-16 sm:h-24" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none">
            <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 80 1440 80V100H0V40Z" className="fill-white dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="py-12 sm:py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block rounded-full bg-[#1a365d]/10 dark:bg-white/10 px-5 py-2 text-sm font-semibold text-[#1a365d] dark:text-white/90 mb-4">
                لماذا نحن؟
              </span>
              <h2 className="text-3xl font-extrabold text-[#1a365d] dark:text-white sm:text-4xl">
                كل ما تحتاجه في منصة واحدة
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                أدوات متكاملة لأتمتة وإدارة عملك العقاري بالكامل
              </p>
            </div>
          </Section>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Section key={i}>
                <div className={`group relative overflow-hidden rounded-3xl border ${f.border} dark:border-gray-700 bg-gradient-to-br ${f.color} dark:from-gray-800/50 dark:to-gray-900/50 p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                  <span className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg} dark:bg-gray-700 text-3xl transition-transform duration-300 group-hover:scale-110`}>
                    {f.icon}
                  </span>
                  <h3 className="mb-3 text-xl font-bold text-[#1a365d] dark:text-white">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block rounded-full bg-[#1a365d]/10 dark:bg-white/10 px-5 py-2 text-sm font-semibold text-[#1a365d] dark:text-white/90 mb-4">
                بسيط وسريع
              </span>
              <h2 className="text-3xl font-extrabold text-[#1a365d] dark:text-white sm:text-4xl">
                كيف يعمل النظام؟
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                من رسالة واتساب إلى صفقة ناجحة — في 7 خطوات تلقائية
              </p>
            </div>
          </Section>

          {/* Desktop horizontal flow */}
          <Section>
            <div className="hidden lg:block">
              <div className="flex items-start justify-between gap-0">
                {flowSteps.map((step, i) => (
                  <div key={i} className="flex items-start" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex flex-col items-center w-[140px] group">
                      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} text-3xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                        {step.icon}
                      </div>
                      <span className="text-center text-sm font-bold text-[#1a365d] dark:text-white">{step.label}</span>
                      <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a365d] text-xs font-bold text-white">{i + 1}</span>
                    </div>
                    {i < flowSteps.length - 1 && (
                      <div className="mt-7 mx-1 text-gray-300">
                        <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M0 8h24m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Mobile vertical flow */}
          <div className="lg:hidden space-y-4">
            {flowSteps.map((step, i) => (
              <Section key={i}>
                <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.color} text-2xl shadow-sm`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-[#1a365d] dark:text-white">{step.label}</span>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a365d] text-xs font-bold text-white">{i + 1}</span>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ WHATSAPP DEMO ═══════════════ */}
      <section id="demo" className="py-12 sm:py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Text side */}
            <Section>
              <div>
                <span className="inline-block rounded-full bg-[#25d366]/10 dark:bg-[#25d366]/20 px-5 py-2 text-sm font-semibold text-[#128c7e] dark:text-[#25d366] mb-4">
                  محادثة حقيقية
                </span>
                <h2 className="text-3xl font-extrabold text-[#1a365d] dark:text-white sm:text-4xl mb-6">
                  شاهد البوت وهو يعمل
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                  العميل يرسل رسالة عادية على واتساب. البوت الذكي يفهم الطلب، يبحث في قاعدة العقارات، ويعرض النتائج المناسبة — كل هذا في ثواني.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: '⚡', text: 'رد فوري — أقل من 3 ثواني' },
                    { icon: '🧠', text: 'يفهم العربي بكل لهجاته' },
                    { icon: '🔍', text: 'يبحث في قاعدة بياناتك فوراً' },
                    { icon: '📅', text: 'يحجز المعاينات تلقائياً' },
                    { icon: '🔄', text: 'يحول للوكيل البشري عند الحاجة' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a365d]/5 dark:bg-white/10 text-xl">{item.icon}</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Phone mockup */}
            <Section>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[360px]">
                  <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-b from-[#25d366]/10 to-transparent blur-2xl" />
                  <div className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg">🏠</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">المساعد العقاري الذكي</p>
                        <p className="text-xs text-white/70">متصل الآن</p>
                      </div>
                    </div>

                    {/* Chat area */}
                    <div className="space-y-3 px-3 py-4" style={{ background: '#ece5dd' }}>
                      {chatDemo.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.sender === 'customer'
                            ? 'rounded-br-md bg-white text-gray-800'
                            : 'rounded-bl-md bg-[#dcf8c6] text-gray-800'
                            }`}>
                            {msg.sender === 'bot' && <span className="mb-1 block text-xs font-semibold text-[#128c7e]">المساعد العقاري 🤖</span>}
                            <span className="whitespace-pre-line">{msg.text}</span>
                            <span className="mt-1 block text-left text-[10px] text-gray-400">
                              {msg.sender === 'bot' ? '✓✓ ' : ''}{10}:{30 + i} ص
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2 border-t bg-[#f0f0f0] px-3 py-2.5">
                      <div className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-gray-400">اكتب رسالة...</div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366] text-white">
                        <svg className="h-5 w-5 rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ═══════════════ DASHBOARD PREVIEW ═══════════════ */}
      <section className="py-20 bg-gradient-to-b from-[#1a365d] to-[#0f2440] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-16">
              <span className="inline-block rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white/90 mb-4">
                لوحة التحكم
              </span>
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                كل شيء تحت سيطرتك
              </h2>
              <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
                لوحة تحكم عربية بالكامل مع تحديث لحظي وتصميم متجاوب
              </p>
            </div>
          </Section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardFeatures.map((f, i) => (
              <Section key={i}>
                <div className="group rounded-2xl bg-white/[0.08] p-6 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/[0.12] hover:-translate-y-1">
                  <span className="mb-4 block text-4xl transition-transform duration-300 group-hover:scale-110">{f.icon}</span>
                  <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                  <p className="text-sm text-white/60">{f.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ JOURNEYS ═══════════════ */}
      <section id="journeys" className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block rounded-full bg-[#1a365d]/10 dark:bg-white/10 px-5 py-2 text-sm font-semibold text-[#1a365d] dark:text-white/90 mb-4">
                اكتشف رحلتك
              </span>
              <h2 className="text-3xl font-extrabold text-[#1a365d] dark:text-white sm:text-4xl">
                النظام يخدم الجميع
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                سواء كنت مالك شركة، مطور عقاري، مسوق، أو حتى عميل — عندنا رحلة مخصصة لك
              </p>
            </div>
          </Section>

          <div className="grid gap-6 md:grid-cols-2">
            {journeys.map((j, idx) => (
              <Section key={j.slug}>
                <Link
                  href={`/journeys/${j.slug}`}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 ${j.borderColor} dark:border-gray-700 ${j.lightBg} dark:bg-gray-800 p-6 sm:p-8 transition-all duration-300 ${j.hoverBorder} hover:-translate-y-2 hover:shadow-xl`}
                >
                  {/* Badge */}
                  <span className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${j.badgeBg} dark:bg-gray-700 dark:text-gray-200`}>
                    رحلة تفصيلية
                  </span>

                  <div className="flex items-center gap-4 mb-4">
                    <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${j.lightBg} dark:bg-gray-700 text-4xl border ${j.borderColor} dark:border-gray-600 transition-transform duration-300 group-hover:scale-110`}>
                      {j.icon}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-[#1a365d] dark:text-white">{j.title}</h3>
                    </div>
                  </div>

                  <p className="mb-5 text-gray-600 dark:text-gray-400 leading-relaxed">{j.desc}</p>

                  {/* Steps */}
                  <div className="mb-6 grid grid-cols-2 gap-2">
                    {j.steps.map((step, si) => (
                      <div key={si} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className={`inline-block h-2 w-2 rounded-full ${j.dotColor}`} />
                        {step}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center gap-2 text-sm font-bold text-[#1a365d] dark:text-white transition-transform group-hover:translate-x-[-6px]">
                    <span>استكشف الرحلة الكاملة</span>
                    <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </Section>
            ))}
          </div>

          <Section>
            <div className="mt-10 text-center">
              <Link
                href="/journeys"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1a365d] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#1a365d]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                🗺️ شاهد الرحلة الكاملة
              </Link>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════ SYSTEM DIAGRAM ═══════════════ */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block rounded-full bg-[#1a365d]/10 dark:bg-white/10 px-5 py-2 text-sm font-semibold text-[#1a365d] dark:text-white/90 mb-4">
                البنية الكاملة
              </span>
              <h2 className="text-3xl font-extrabold text-[#1a365d] dark:text-white sm:text-4xl">
                كيف يربط النظام الجميع؟
              </h2>
            </div>
          </Section>

          <Section>
            <div className="flex flex-col items-center gap-4">
              {/* Owner */}
              <div className="flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-300 bg-amber-50 dark:bg-amber-900/30 text-3xl shadow-lg animate-float-slow">👑</div>
                <span className="mt-2 text-sm font-bold text-[#1a365d] dark:text-white">المالك</span>
              </div>
              <svg width="2" height="32" className="text-[#1a365d]/20"><line x1="1" y1="0" x2="1" y2="32" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" /></svg>

              {/* Dashboard + Team */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16">
                <div className="flex flex-col items-center">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 shadow-md"><span className="text-lg">📊</span> <span className="text-sm font-bold text-[#1a365d] dark:text-white">لوحة التحكم</span></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 shadow-md"><span className="text-lg">👥</span> <span className="text-sm font-bold text-[#1a365d] dark:text-white">الفريق</span></div>
                </div>
              </div>
              <svg width="2" height="24" className="text-[#1a365d]/20 dark:text-white/20"><line x1="1" y1="0" x2="1" y2="24" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" /></svg>

              {/* Developer + Marketer */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue-300 bg-blue-50 dark:bg-blue-900/30 text-2xl shadow-lg">🏗️</div>
                  <span className="mt-2 text-sm font-bold text-[#1a365d] dark:text-white">شركة التطوير</span>
                </div>
                <div className="hidden md:block text-[#1a365d]/20 dark:text-white/20"><svg width="60" height="2"><line x1="0" y1="1" x2="60" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" /></svg></div>
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-300 bg-green-50 dark:bg-green-900/30 text-2xl shadow-lg">📣</div>
                  <span className="mt-2 text-sm font-bold text-[#1a365d] dark:text-white">المسوق</span>
                </div>
              </div>
              <svg width="2" height="32" className="text-[#1a365d]/20 dark:text-white/20"><line x1="1" y1="0" x2="1" y2="32" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" /></svg>

              {/* Bot */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#1a365d] dark:border-blue-400 bg-[#1a365d]/10 dark:bg-blue-900/30 text-4xl shadow-xl animate-pulse-glow">
                  🤖
                  <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#1a365d]/20 dark:border-blue-400/20" />
                </div>
                <span className="mt-2 text-sm font-bold text-[#1a365d] dark:text-white">البوت الذكي</span>
                <span className="text-xs text-gray-400">يستقبل ويرد ويبحث</span>
              </div>
              <svg width="2" height="32" className="text-[#1a365d]/20 dark:text-white/20"><line x1="1" y1="0" x2="1" y2="32" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" /></svg>

              {/* Customer */}
              <div className="flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-teal-300 bg-teal-50 dark:bg-teal-900/30 text-3xl shadow-lg animate-float">🏡</div>
                <span className="mt-2 text-sm font-bold text-[#1a365d] dark:text-white">العميل</span>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════ CONTACT ═══════════════ */}
      <section id="contact" className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-12">
              <span className="inline-block rounded-full bg-[#1a365d]/10 dark:bg-white/10 px-5 py-2 text-sm font-semibold text-[#1a365d] dark:text-white/90 mb-4">
                تواصل معنا
              </span>
              <h2 className="text-3xl font-extrabold text-[#1a365d] dark:text-white sm:text-4xl">
                جاهزين نساعدك
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                عندك سؤال أو تبي عرض خاص؟ تواصل معنا مباشرة
              </p>
            </div>
          </Section>

          <Section>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/966558048004"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-4 rounded-3xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 sm:p-8 text-center transition-all duration-300 hover:border-green-400 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25d366] text-3xl text-white shadow-lg shadow-[#25d366]/30 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1a365d] dark:text-white">واتساب</h3>
                <p className="text-2xl font-bold text-[#25d366]" dir="ltr">+966 558 048 004</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">أسرع طريقة للتواصل</span>
              </a>

              {/* Phone */}
              <a
                href="tel:+966558048004"
                className="group flex flex-col items-center gap-4 rounded-3xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6 sm:p-8 text-center transition-all duration-300 hover:border-blue-400 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a365d] text-3xl text-white shadow-lg shadow-[#1a365d]/30 transition-transform duration-300 group-hover:scale-110">
                  📞
                </div>
                <h3 className="text-lg font-bold text-[#1a365d] dark:text-white">اتصال مباشر</h3>
                <p className="text-2xl font-bold text-[#1a365d] dark:text-blue-400" dir="ltr">0558048004</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">خلال ساعات العمل</span>
              </a>

              {/* Person */}
              <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-6 sm:p-8 text-center sm:col-span-2 lg:col-span-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500 text-3xl text-white shadow-lg shadow-purple-500/30">
                  👤
                </div>
                <h3 className="text-lg font-bold text-[#1a365d] dark:text-white">المسؤول</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">باسم محمد الحجري</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">المؤسس والمدير التنفيذي</span>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-20 bg-[#1a365d]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Section>
            <span className="mb-6 inline-block text-6xl animate-float">🚀</span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl mb-6">
              جاهز تحوّل واتساب شركتك
              <br />
              <span className="bg-gradient-to-l from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                لمحرك مبيعات ذكي؟
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
              انضم الآن واستمتع بأتمتة عقارية متكاملة. ابدأ في دقائق — بدون خبرة تقنية.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-xl font-bold text-[#1a365d] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                ابدأ مجاناً الآن
                <svg className="h-5 w-5 rotate-180 transition-transform group-hover:translate-x-[-4px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="https://wa.me/966558048004"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-2xl border-2 border-white/30 px-10 py-5 text-xl font-medium text-white transition-all duration-300 hover:bg-white/10"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                تواصل عبر واتساب
              </a>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏠</span>
                <span className="text-lg font-bold text-[#1a365d] dark:text-white">المساعد العقاري الذكي</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                نظام إدارة عقارية متكامل مع واتساب والذكاء الاصطناعي. أتمتة كاملة للمبيعات والتواصل.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-[#1a365d] dark:text-white mb-4">روابط سريعة</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:hover:text-white transition-colors">المميزات</a>
                <a href="#how-it-works" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:hover:text-white transition-colors">كيف يعمل</a>
                <a href="#journeys" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:hover:text-white transition-colors">الرحلات</a>
                <a href="#demo" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:hover:text-white transition-colors">تجربة حية</a>
              </div>
            </div>

            {/* Journeys */}
            <div>
              <h4 className="font-bold text-[#1a365d] dark:text-white mb-4">الرحلات</h4>
              <div className="space-y-2">
                <Link href="/journeys/owner" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:hover:text-white transition-colors">👑 رحلة المالك</Link>
                <Link href="/journeys/developer" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:hover:text-white transition-colors">🏗️ رحلة شركة التطوير</Link>
                <Link href="/journeys/marketer" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:hover:text-white transition-colors">📣 رحلة المسوق</Link>
                <Link href="/journeys/customer" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:hover:text-white transition-colors">🏡 رحلة العميل</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-[#1a365d] dark:text-white mb-4">تواصل معنا</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">باسم محمد الحجري</span>
                </div>
                <a href="https://wa.me/966558048004" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#25d366] transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  <span dir="ltr">+966 558 048 004</span>
                </a>
                <a href="tel:+966558048004" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:hover:text-white transition-colors">
                  <span>📞</span>
                  <span dir="ltr">0558048004</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-100 dark:border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              المساعد العقاري الذكي &copy; {new Date().getFullYear()} — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>

      {/* ═══════════════ FLOATING WHATSAPP BUTTON ═══════════════ */}
      <a
        href="https://wa.me/966558048004"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-[#25d366]/40 transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse-glow"
        aria-label="تواصل عبر واتساب"
      >
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  )
}
