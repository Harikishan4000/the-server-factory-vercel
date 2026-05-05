import { TableSkeleton, Skeleton } from '@/components/ui/Loading';
export default function Loading() {
  return (
    <div className="p-4 md:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-48" />
      <div className="mt-8"><TableSkeleton rows={8} cols={6} /></div>
    </div>
  );
}
