'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function CategoryFilters({
  brands,
  currentSlug,
  current,
}: {
  brands: string[];
  currentSlug: string;
  current: { brand?: string; min?: string; max?: string; sort?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();

  const selectedBrands = new Set((current.brand ?? '').split(',').filter(Boolean));

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    router.push(`/category/${currentSlug}?${next.toString()}`);
  }

  function toggleBrand(brand: string) {
    if (selectedBrands.has(brand)) selectedBrands.delete(brand);
    else selectedBrands.add(brand);
    setParam('brand', Array.from(selectedBrands).join(','));
  }

  function clearAll() {
    router.push(`/category/${currentSlug}`);
  }

  return (
    <aside className="card h-fit p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <h3 className="font-display text-base font-bold md:text-lg">Filters</h3>
        <button onClick={clearAll} className="text-xs font-semibold text-brand hover:underline md:text-sm">
          Clear All
        </button>
      </div>

      <div className="mb-4 md:mb-6">
        <h4 className="mb-3 text-sm font-semibold">Brand</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={selectedBrands.has(brand)}
                onChange={() => toggleBrand(brand)}
                className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
          {brands.length === 0 && <p className="text-sm text-ink-muted dark:text-gray-400">—</p>}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold">Price Range (₹)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={current.min}
            onBlur={(e) => setParam('min', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={current.max}
            onBlur={(e) => setParam('max', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700"
          />
        </div>
      </div>
    </aside>
  );
}
