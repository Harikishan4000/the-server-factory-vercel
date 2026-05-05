import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';
import { Search } from 'lucide-react';

export const metadata = { title: 'Search Results' };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();

  const products = q
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { shortDesc: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, category: true },
        take: 48,
      }).catch(() => [])
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="font-display text-4xl font-extrabold">Search</h1>
      <form action="/search" className="mt-6 flex items-center gap-2 rounded-full bg-white p-2 shadow-soft">
        <Search className="ml-4 h-5 w-5 text-brand" />
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Search for servers, workstations, CPUs..."
          className="flex-1 bg-transparent px-2 py-2 text-base outline-none placeholder:text-gray-400"
        />
        <button className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-600">Search</button>
      </form>

      {q ? (
        <p className="mt-6 text-sm text-ink-muted">
          {products.length} result{products.length === 1 ? '' : 's'} for &ldquo;<span className="font-semibold text-ink dark:text-gray-100">{q}</span>&rdquo;
        </p>
      ) : (
        <p className="mt-6 text-sm text-ink-muted">Enter a search term to find products.</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
