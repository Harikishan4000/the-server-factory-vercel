import { CartView } from '@/components/cart/CartView';

export const metadata = { title: 'Your Cart', robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 md:py-10">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">
        Your <span className="text-brand">Cart</span>
      </h1>
      <CartView />
    </div>
  );
}
