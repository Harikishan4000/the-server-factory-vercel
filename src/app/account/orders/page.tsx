import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const metadata = { title: 'My Orders', robots: { index: false } };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <h1 className="font-display text-4xl font-extrabold">My <span className="text-brand">Orders</span></h1>

      {orders.length === 0 ? (
        <div className="card mt-10 p-16 text-center">
          <p className="text-ink-muted">No orders yet.</p>
          <Link href="/" className="btn-brand mt-6">Shop Hardware</Link>
        </div>
      ) : (
        <div className="card mt-10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/account/orders/${o.id}`} className="font-mono font-semibold text-brand hover:underline">{o.orderNumber}</Link>
                  </td>
                  <td className="px-6 py-4 text-ink-muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">{o._count.items}</td>
                  <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                  <td className="px-6 py-4 text-right font-semibold">{formatINR(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
