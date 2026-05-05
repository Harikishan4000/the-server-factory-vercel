import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Server, Cpu, HardDrive, Repeat } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  servers: Server,
  workstations: Cpu,
  components: HardDrive,
  rentals: Repeat,
};

export async function CategoryGrid({ heading }: { heading?: string }) {
  const cats = await prisma.category
    .findMany({ where: { parentId: null, isVisible: true }, orderBy: { sortOrder: 'asc' } })
    .catch(() => []);
  if (!cats.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h2 className="mb-10 font-display text-3xl font-bold md:text-4xl">
        {heading ?? 'Shop by Category'}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cats.map((cat) => {
          const Icon = ICONS[cat.slug] ?? Server;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-soft transition hover:-translate-y-1 hover:border-brand hover:shadow-brand"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-50 transition-transform duration-500 group-hover:scale-150" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-ink dark:text-gray-100">{cat.name}</h3>
                {cat.description && <p className="mt-2 text-sm text-ink-muted">{cat.description}</p>}
                <span className="mt-4 inline-block text-sm font-semibold text-brand">Explore →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
