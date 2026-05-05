import { ProductGridSkeleton, Skeleton } from '@/components/ui/Loading';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-4 h-12 w-80" />
      <Skeleton className="mt-3 h-4 w-96" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <Skeleton className="h-96 w-full" />
        </div>
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}
