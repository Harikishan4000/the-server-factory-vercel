import { ConfiguratorSkeleton, Skeleton } from '@/components/ui/Loading';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-10 w-40" />
          <div className="mt-6"><ConfiguratorSkeleton /></div>
        </div>
      </div>
    </div>
  );
}
