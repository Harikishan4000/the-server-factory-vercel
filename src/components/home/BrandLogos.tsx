'use client';

const LINKS: Record<string, string> = {
  Dell: 'https://www.dell.com/en-in/work/shop/enterprise/sc/servers',
  HP: 'https://www.hpe.com/in/en/servers.html',
  Lenovo: 'https://www.lenovo.com/in/en/servers-storage/',
  NVIDIA: 'https://www.nvidia.com/en-in/data-center/products/dgx-platform/',
  Intel: 'https://www.intel.in/content/www/in/en/products/details/processors/xeon.html',
  Samsung: 'https://semiconductor.samsung.com/in/us/consumer-storage/internal-ssd/',
};

export function BrandLogos({ heading, brands }: { heading?: string; brands: string[] }) {
  if (brands.length === 0) return null;
  return (
    <section className="border-y border-gray-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {heading && <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">{heading}</p>}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {brands.map((brand) => {
            const link = LINKS[brand];
            return link ? (
              <a key={brand} href={link} target="_blank" rel="noopener noreferrer" className="font-display text-2xl font-bold text-gray-400 transition hover:text-brand">{brand}</a>
            ) : (
              <span key={brand} className="font-display text-2xl font-bold text-gray-400">{brand}</span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
