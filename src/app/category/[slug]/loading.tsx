import { ProductGridSkeleton, Skeleton } from '@/components/ui/Loading';

export default function Loading() {
  return (
    <div className="container-page py-6 md:py-10">
      <Skeleton className="h-4 w-48 max-w-full" />
      <Skeleton className="mt-4 h-10 w-80 max-w-full md:h-12" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr] md:gap-8 xl:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <Skeleton className="h-96 w-full" />
        </div>
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}
