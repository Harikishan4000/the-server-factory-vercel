import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle2 } from 'lucide-react';

export const metadata = { title: 'Order Details', robots: { index: false } };

export default async function OrderDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { success?: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { options: true } } },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      {searchParams.success && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-green-800">
          <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Order placed successfully!</p>
            <p className="text-sm">We&apos;ll follow up shortly to confirm payment and provisioning.</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">Order Number</p>
          <h1 className="font-display text-3xl font-extrabold font-mono">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-muted">Placed on {new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="card overflow-hidden">
          <h2 className="border-b border-gray-100 px-6 py-4 font-display font-bold">Items</h2>
          <ul className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <li key={item.id} className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-xs font-mono text-ink-muted">{item.productSku}</p>
                    {item.options.length > 0 && (
                      <ul className="mt-2 space-y-0.5 text-xs text-ink-muted">
                        {item.options.map((o) => (
                          <li key={o.id}>
                            <span className="font-semibold uppercase tracking-wider">{o.groupName}:</span> {o.valueLabel}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatINR(item.lineTotal)}</p>
                    <p className="text-xs text-ink-muted">Qty {item.quantity} × {formatINR(item.unitPrice)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <h3 className="font-display font-bold">Summary</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Tax</dt><dd>{formatINR(order.tax)}</dd></div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
            </dl>
          </div>
          <div className="card p-6">
            <h3 className="font-display font-bold">Billing</h3>
            <p className="mt-3 text-sm">{order.billingName}</p>
            <p className="text-sm text-ink-muted">{order.billingEmail}</p>
            {order.billingPhone && <p className="text-sm text-ink-muted">{order.billingPhone}</p>}
            <p className="mt-3 whitespace-pre-line text-sm text-ink-muted">{order.billingAddress}</p>
          </div>
          <Link href="/account/orders" className="btn-outline w-full">Back to orders</Link>
        </aside>
      </div>
    </div>
  );
}
