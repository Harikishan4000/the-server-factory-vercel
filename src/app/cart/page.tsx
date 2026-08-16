import { CartView } from '@/components/cart/CartView';

export const metadata = { title: 'Your Cart', robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 md:py-10">
      <h1 className="heading-page font-display font-extrabold">
        Your <span className="text-brand">Cart</span>
      </h1>
      <CartView />
    </div>
  );
}
