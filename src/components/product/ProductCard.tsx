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
            sizes="(max-width: 475px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1920px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 dark:text-gray-600">No image</div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3 xs:p-4 sm:p-5">
        {product.brand && (
          <p className="truncate text-[11px] font-bold uppercase tracking-wider text-brand sm:text-xs">{product.brand}</p>
        )}
        <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold group-hover:text-brand-700 dark:group-hover:text-brand-400 xs:text-base sm:text-lg">
          {product.name}
        </h3>
        {product.shortDesc && (
          <p className="mt-2 line-clamp-2 hidden text-sm text-ink-muted dark:text-gray-400 xs:block">{product.shortDesc}</p>
        )}
        <div className="mt-auto pt-3 sm:pt-4">
          <p className="text-lg font-extrabold xs:text-xl sm:text-2xl">{formatINR(product.basePrice)}</p>
          <span className="mt-2 inline-block rounded-full border border-brand px-3 py-1.5 text-xs font-semibold text-brand transition group-hover:bg-brand group-hover:text-white xs:px-4 xs:py-2 sm:mt-3 sm:px-5 sm:text-sm">
            Configure Now
          </span>
        </div>
      </div>
    </Link>
  );
}
