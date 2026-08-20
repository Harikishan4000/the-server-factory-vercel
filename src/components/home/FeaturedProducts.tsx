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
    <section className="container-page section-y">
      <div className="mb-6 flex items-end justify-between sm:mb-8 md:mb-10">
        <h2 className="heading-section font-display font-bold">
          {heading ?? 'Featured '}<span className="text-brand">Hardware</span>
        </h2>
      </div>
      <div className="grid gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-3 md:gap-6 xl:grid-cols-4 3xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
