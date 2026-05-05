import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils';
import { Configurator } from '@/components/product/Configurator';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } }).catch(() => null);
  if (!p) return { title: 'Product not found' };
  return {
    title: p.metaTitle ?? p.name,
    description: p.metaDescription ?? p.shortDesc ?? undefined,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      title: p.name,
      description: p.shortDesc ?? undefined,
    },
  };
}

export async function generateStaticParams() {
  const ps = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true } }).catch(() => []);
  return ps.map((p) => ({ slug: p.slug }));
}

export const revalidate = 300;

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      optionGroups: {
        orderBy: { sortOrder: 'asc' },
        include: { values: { orderBy: { sortOrder: 'asc' } } },
      },
      tiers: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { selections: true },
      },
    },
  }).catch(() => null);

  if (!product || !product.isActive) notFound();

  // JSON-LD Product schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.description ?? product.shortDesc,
    brand: { '@type': 'Brand', name: product.brand ?? 'ServerFactory' },
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: Number(product.basePrice),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 md:py-10">
        <nav className="mb-4 text-xs text-ink-muted dark:text-gray-400 md:mb-6 md:text-sm">
          <Link href="/" className="hover:text-brand">Home</Link> /{' '}
          <Link href={`/category/${product.category.slug}`} className="hover:text-brand">{product.category.name}</Link> /{' '}
          <span className="text-ink dark:text-gray-200">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-2 md:gap-10">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-soft">
              {product.images[0] && (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt ?? product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {product.images.map((img) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <Image src={img.url} alt={img.alt ?? ''} fill sizes="100px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details + configurator */}
          <div>
            {product.brand && (
              <p className="text-xs font-bold uppercase tracking-wider text-brand">{product.brand}</p>
            )}
            <h1 className="mt-1 font-display text-2xl font-extrabold md:text-4xl">{product.name}</h1>
            {product.shortDesc && <p className="mt-2 text-base text-ink-muted dark:text-gray-400 md:mt-3 md:text-lg">{product.shortDesc}</p>}

            <div className="mt-4 flex items-baseline gap-3 border-b border-gray-100 pb-4 dark:border-gray-800 md:mt-6 md:pb-6">
              <span className="text-xs text-ink-muted dark:text-gray-400 md:text-sm">Starting at</span>
              <span className="text-3xl font-extrabold md:text-4xl">{formatINR(product.basePrice)}</span>
            </div>

            <div className="mt-6 md:mt-8">
              <Configurator
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  basePrice: Number(product.basePrice),
                  image: product.images[0]?.url,
                }}
                groups={product.optionGroups.map((g) => ({
                  id: g.id,
                  name: g.name,
                  label: g.label,
                  required: g.required,
                  values: g.values.map((v) => ({
                    id: v.id,
                    label: v.label,
                    priceDelta: Number(v.priceDelta),
                    isDefault: v.isDefault,
                  })),
                }))}
                tiers={product.tiers.map((t) => ({
                  id: t.id,
                  name: t.name,
                  label: t.label ?? t.name.charAt(0) + t.name.slice(1).toLowerCase(),
                  description: t.description,
                  priceOverride: t.priceOverride !== null ? Number(t.priceOverride) : null,
                  selectionValueIds: t.selections.map((s) => s.optionValueId),
                }))}
              />
            </div>
          </div>
        </div>

        {product.description && (
          <section className="mt-10 max-w-4xl md:mt-16">
            <h2 className="font-display text-xl font-bold md:text-2xl">About this {product.category.name}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted dark:text-gray-400 md:mt-4 md:text-base">{product.description}</p>
          </section>
        )}
      </div>
    </>
  );
}
