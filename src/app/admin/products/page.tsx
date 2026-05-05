import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils';
import { Plus, Pencil } from 'lucide-react';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { images: { take: 1 }, category: true, _count: { select: { optionGroups: true, tiers: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-ink-muted dark:text-gray-400">{products.length} total</p>
        </div>
        <Link href="/admin/products/new" className="btn-brand w-full sm:w-auto">
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      {/* Mobile: card list */}
      <div className="mt-6 space-y-3 md:hidden">
        {products.map((p) => (
          <Link key={p.id} href={`/admin/products/${p.id}`} className="card flex gap-3 p-4">
            {p.images[0] && (
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <Image src={p.images[0].url} alt="" fill sizes="64px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="truncate text-xs text-ink-muted dark:text-gray-400">{p.brand} · {p.category.name}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold">{formatINR(p.basePrice)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted dark:text-gray-400">Stock: {p.stock}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="mt-6 hidden md:block">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-ink-muted dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Tiers</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {p.images[0] && (
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                            <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-ink-muted dark:text-gray-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-ink-muted dark:text-gray-400">{p.sku}</td>
                    <td className="px-6 py-3 text-ink-muted dark:text-gray-400">{p.category.name}</td>
                    <td className="px-6 py-3 font-semibold">{formatINR(p.basePrice)}</td>
                    <td className="px-6 py-3">{p.stock}</td>
                    <td className="px-6 py-3">
                      {p._count.tiers > 0 ? (
                        <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand/10 dark:text-brand-400">
                          {p._count.tiers} tier{p._count.tiers === 1 ? '' : 's'}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-muted dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/admin/products/${p.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
