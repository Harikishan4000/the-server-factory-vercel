import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';

export async function FeaturedProducts({ heading, limit = 8 }: { heading?: string; limit?: number }) {
  const products = await prisma.product
    .findMany({
      where: { isActive: true, isFeatured: true },
      take: limit,
      include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, category: true },
      orderBy: { createdAt: 'desc' },
    })
    .catch(() => []);

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          {heading ?? 'Featured '}<span className="text-brand">Hardware</span>
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
