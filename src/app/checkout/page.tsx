import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export const metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/checkout');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, email: true, phone: true, company: true, gstNumber: true,
      addressLine1: true, addressLine2: true, city: true, state: true,
      postalCode: true, country: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 md:py-10">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">
        Secure <span className="text-brand">Checkout</span>
      </h1>
      <p className="mt-2 text-sm text-ink-muted dark:text-gray-400 md:text-base">Review your order and confirm billing details.</p>
      <CheckoutForm user={user!} />
    </div>
  );
}
