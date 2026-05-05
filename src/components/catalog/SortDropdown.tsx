'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function SortDropdown({ currentSlug, currentSort }: { currentSlug: string; currentSort: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set('sort', value);
    router.push(`/category/${currentSlug}?${next.toString()}`);
  }

  return (
    <label className="text-sm text-ink-muted">
      Sort by:{' '}
      <select
        defaultValue={currentSort}
        onChange={(e) => onChange(e.target.value)}
        className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
      >
        <option value="newest">Newest First</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name">Name: A-Z</option>
      </select>
    </label>
  );
}
