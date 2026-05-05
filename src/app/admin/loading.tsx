import { DashboardStatsSkeleton, TableSkeleton, Skeleton } from '@/components/ui/Loading';

export default function Loading() {
  return (
    <div className="p-4 md:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-8"><DashboardStatsSkeleton /></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <TableSkeleton rows={6} cols={4} />
        <TableSkeleton rows={5} cols={2} />
      </div>
    </div>
  );
}
