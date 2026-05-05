'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartProvider';

export function CartIcon() {
  const { itemCount } = useCart();
  return (
    <Link
      href="/cart"
      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-ink transition hover:bg-brand dark:bg-gray-800 dark:text-gray-100 hover:text-white"
      aria-label={`Cart (${itemCount} items)`}
    >
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
