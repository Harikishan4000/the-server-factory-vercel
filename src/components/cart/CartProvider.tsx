'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type CartOption = {
  groupName: string;
  groupLabel: string;
  valueId: string;
  valueLabel: string;
  priceDelta: number;
};

export type CartTier = {
  name: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  label: string;
};

export type CartItem = {
  key: string;            // hash of productId + option valueIds
  productId: string;
  productSlug: string;
  productName: string;
  productImage?: string;
  basePrice: number;
  options: CartOption[];
  tier?: CartTier;        // optional tier snapshot
  unitPrice: number;      // basePrice + sum of priceDeltas (or tier override)
  quantity: number;
};

type Ctx = {
  items: CartItem[];
  add: (item: Omit<CartItem, 'key'>) => void;
  remove: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<Ctx | null>(null);
const STORAGE_KEY = 'serverfactory.cart.v1';

function hashItem(productId: string, options: CartOption[]): string {
  const opts = [...options].sort((a, b) => a.groupName.localeCompare(b.groupName)).map((o) => `${o.groupName}:${o.valueId}`).join('|');
  return `${productId}__${opts}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, 'key'>) => {
    const key = hashItem(item.productId, item.options);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      return [...prev, { ...item, key }];
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    if (qty <= 0) return remove(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: qty } : i)));
  }, [remove]);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
