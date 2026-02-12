interface SkeletonProps {
  className?: string
  count?: number
}

export default function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
      ))}
    </>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }, (_, j) => (
            <div key={j} className="animate-pulse bg-gray-200 rounded h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="animate-pulse bg-gray-200 rounded h-6 w-1/3" />
      <div className="animate-pulse bg-gray-200 rounded h-10 w-2/3" />
      <div className="animate-pulse bg-gray-200 rounded h-4 w-1/2" />
    </div>
  )
}
