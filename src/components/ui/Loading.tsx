import { cn } from '@/lib/utils';

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-[3px]', lg: 'h-12 w-12 border-4' };
  return (
    <div
      className={cn(
        'inline-block animate-[spin_0.8s_linear_infinite] rounded-full border-brand/20 border-t-brand',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-ink-muted dark:text-gray-400">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4"><Skeleton className="h-4 w-full max-w-[150px]" /></td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 dark:bg-gray-800/50">
        <Skeleton className="h-3 w-32" />
      </div>
      <table className="w-full">
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: rows }).map((_, i) => <TableRowSkeleton key={i} cols={cols} />)}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-8 w-32" />
        </div>
      ))}
    </div>
  );
}

export function ConfiguratorSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-5">
          <Skeleton className="h-4 w-20" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-12 w-full rounded-xl" />)}
          </div>
        </div>
      ))}
    </div>
  );
}
