import { ConfiguratorSkeleton, Skeleton } from '@/components/ui/Loading';

export default function Loading() {
  return (
    <div className="container-page py-6 md:py-10">
      <Skeleton className="h-4 w-64 max-w-full" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2 md:gap-10">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-10 w-40 max-w-full" />
          <div className="mt-6"><ConfiguratorSkeleton /></div>
        </div>
      </div>
    </div>
  );
}
