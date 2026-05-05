import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string | null;
    basePrice: any;
    shortDesc: string | null;
    images: { url: string; alt: string | null }[];
    category?: { name: string; slug: string } | null;
  };
};

export function ProductCard({ product }: Props) {
  const img = product.images[0];
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft transition hover:-translate-y-1 hover:border-brand hover:shadow-brand dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {img ? (
          <Image
            src={img.url}
            alt={img.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 dark:text-gray-600">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {product.brand && (
          <p className="text-xs font-bold uppercase tracking-wider text-brand">{product.brand}</p>
        )}
        <h3 className="mt-1 line-clamp-2 font-display text-base font-bold group-hover:text-brand-700 dark:group-hover:text-brand-400 sm:text-lg">
          {product.name}
        </h3>
        {product.shortDesc && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-muted dark:text-gray-400">{product.shortDesc}</p>
        )}
        <div className="mt-auto pt-4">
          <p className="text-xl font-extrabold sm:text-2xl">{formatINR(product.basePrice)}</p>
          <span className="mt-3 inline-block rounded-full border border-brand px-4 py-2 text-xs font-semibold text-brand transition group-hover:bg-brand group-hover:text-white sm:px-5 sm:text-sm">
            Configure Now
          </span>
        </div>
      </div>
    </Link>
  );
}
