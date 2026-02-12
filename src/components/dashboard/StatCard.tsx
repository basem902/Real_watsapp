interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
}

export default function StatCard({ title, value, icon, trend, color = 'bg-blue-500' }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '\u25B2' : '\u25BC'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`rounded-xl ${color} p-3 text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
