'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-3">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse border rounded-xl p-4 space-y-3 bg-white">
          <div className="aspect-[4/3] w-full bg-gray-100 rounded-lg" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
          <div className="h-3 w-1/3 bg-gray-100 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
