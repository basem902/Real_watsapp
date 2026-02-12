import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'المساعد العقاري الذكي',
  description: 'نظام إدارة عقارية متكامل مع واتساب',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-[#f8fafc] dark:bg-gray-950 min-h-screen font-sans antialiased text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'toast-rtl',
            duration: 4000,
            style: {
              direction: 'rtl',
            },
          }}
        />
      </body>
    </html>
  )
}
