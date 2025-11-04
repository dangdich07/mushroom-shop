import { Skeleton } from '../../../../components/ui/Skeleton';

export default function LoadingProductPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="h-5 w-40 bg-gray-200 rounded" />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl border bg-white p-3">
          <Skeleton className="aspect-square w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </section>
      <section>
        <Skeleton className="h-5 w-28" />
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-3">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
