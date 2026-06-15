export function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: 'var(--glass-bg)',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-6" style={{ animation: 'fadeIn 0.3s ease' }}>
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
