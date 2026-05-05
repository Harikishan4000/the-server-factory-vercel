'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShoppingCart, Sparkles, Wrench } from 'lucide-react';
import { useCart, type CartOption, type CartTier } from '@/components/cart/CartProvider';
import { formatINR, cn } from '@/lib/utils';

type OptionValue = { id: string; label: string; priceDelta: number; isDefault: boolean };
type OptionGroup = { id: string; name: string; label: string; required: boolean; values: OptionValue[] };
type Tier = {
  id: string;
  name: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  label: string;
  description: string | null;
  priceOverride: number | null;
  selectionValueIds: string[]; // option value IDs this tier selects
};
type Product = { id: string; slug: string; name: string; basePrice: number; image?: string };

type Mode = 'quick' | 'custom';

const TIER_ORDER = ['BASIC', 'INTERMEDIATE', 'ADVANCED'] as const;

export function Configurator({ product, groups, tiers }: { product: Product; groups: OptionGroup[]; tiers: Tier[] }) {
  const router = useRouter();
  const { add } = useCart();

  const hasTiers = tiers.length > 0;
  const [mode, setMode] = useState<Mode>(hasTiers ? 'quick' : 'custom');

  // Custom-mode selections
  const initCustom = () => {
    const init: Record<string, string> = {};
    for (const g of groups) {
      const def = g.values.find((v) => v.isDefault) ?? g.values[0];
      if (def) init[g.id] = def.id;
    }
    return init;
  };
  const [customSelections, setCustomSelections] = useState<Record<string, string>>(initCustom);

  // Quick-pick mode: selected tier + editable overrides
  const sortedTiers = useMemo(
    () => [...tiers].sort((a, b) => TIER_ORDER.indexOf(a.name) - TIER_ORDER.indexOf(b.name)),
    [tiers]
  );
  const [activeTierId, setActiveTierId] = useState<string | null>(sortedTiers[0]?.id ?? null);

  // Start tier-selections from the tier's preset bundle. User can override inside quick mode too.
  const tierBaseSelections = useMemo(() => {
    const tier = sortedTiers.find((t) => t.id === activeTierId);
    if (!tier) return {};
    const result: Record<string, string> = {};
    for (const g of groups) {
      const tierPick = g.values.find((v) => tier.selectionValueIds.includes(v.id));
      const def = g.values.find((v) => v.isDefault) ?? g.values[0];
      if (tierPick) result[g.id] = tierPick.id;
      else if (def) result[g.id] = def.id;
    }
    return result;
  }, [activeTierId, sortedTiers, groups]);

  const [quickSelections, setQuickSelections] = useState<Record<string, string>>(tierBaseSelections);
  // Reset quickSelections when tier changes
  useEffect(() => {
    setQuickSelections(tierBaseSelections);
  }, [tierBaseSelections]);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // ── Price calculation ────────────────────
  const activeTier = sortedTiers.find((t) => t.id === activeTierId);
  const activeSelections = mode === 'quick' ? quickSelections : customSelections;

  const unitPrice = useMemo(() => {
    // In quick mode, if tier has an override AND user hasn't customised → use override
    if (mode === 'quick' && activeTier?.priceOverride !== null && activeTier?.priceOverride !== undefined) {
      const customised = Object.keys(quickSelections).some((gid) => quickSelections[gid] !== tierBaseSelections[gid]);
      if (!customised) return Number(activeTier.priceOverride);
    }
    // Otherwise sum up base + selected priceDeltas
    let sum = product.basePrice;
    for (const g of groups) {
      const v = g.values.find((x) => x.id === activeSelections[g.id]);
      if (v) sum += v.priceDelta;
    }
    return sum;
  }, [mode, activeTier, quickSelections, tierBaseSelections, customSelections, product.basePrice, groups, activeSelections]);

  const totalPrice = unitPrice * qty;

  function handleAdd(goToCart = false) {
    const selections = mode === 'quick' ? quickSelections : customSelections;
    const options: CartOption[] = groups
      .map((g) => {
        const v = g.values.find((x) => x.id === selections[g.id]);
        if (!v) return null;
        return {
          groupName: g.name,
          groupLabel: g.label,
          valueId: v.id,
          valueLabel: v.label,
          priceDelta: v.priceDelta,
        };
      })
      .filter(Boolean) as CartOption[];

    const tier: CartTier | undefined = mode === 'quick' && activeTier
      ? { name: activeTier.name, label: activeTier.label }
      : undefined;

    add({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.image,
      basePrice: product.basePrice,
      options,
      tier,
      unitPrice,
      quantity: qty,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    if (goToCart) router.push('/cart');
  }

  return (
    <div className="space-y-6">
      {/* Mode tabs - only if tiers exist */}
      {hasTiers && (
        <div className="flex rounded-full bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
              mode === 'quick' ? 'bg-brand text-white shadow-brand' : 'text-ink-muted dark:text-gray-300'
            )}
          >
            <Sparkles className="h-4 w-4" /> Quick Pick
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
              mode === 'custom' ? 'bg-brand text-white shadow-brand' : 'text-ink-muted dark:text-gray-300'
            )}
          >
            <Wrench className="h-4 w-4" /> Custom Build
          </button>
        </div>
      )}

      <div>
        <h3 className="font-display text-lg font-bold">
          {mode === 'quick' ? 'Choose a configuration' : 'Configure your build'}
        </h3>
        <p className="mt-1 text-sm text-ink-muted dark:text-gray-400">
          {mode === 'quick'
            ? 'Pick a preset, or switch to Custom Build to fine-tune every component.'
            : 'Select components to build your ideal ' + product.name + '.'}
        </p>
      </div>

      {/* Quick pick tiers */}
      {mode === 'quick' && (
        <div className="grid gap-3 sm:grid-cols-3">
          {sortedTiers.map((t) => {
            const selected = activeTierId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTierId(t.id)}
                className={cn(
                  'flex flex-col items-start rounded-2xl border p-5 text-left transition',
                  selected
                    ? 'border-brand bg-brand-50 ring-2 ring-brand/30 dark:bg-brand/10'
                    : 'border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900'
                )}
              >
                <span className={cn('text-xs font-bold uppercase tracking-wider', selected ? 'text-brand' : 'text-ink-muted dark:text-gray-400')}>
                  {t.name}
                </span>
                <span className="mt-1 font-display text-lg font-bold">{t.label}</span>
                {t.description && <span className="mt-2 text-xs text-ink-muted dark:text-gray-400">{t.description}</span>}
                {selected && <Check className="mt-3 h-5 w-5 text-brand" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Option groups - shown in both modes */}
      {groups.map((g) => {
        const selectedId = activeSelections[g.id];
        return (
          <div key={g.id} className="card p-4 sm:p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <label className="font-semibold">
                {g.label}
                {g.required && <span className="ml-1 text-brand">*</span>}
              </label>
              {mode === 'quick' && <span className="text-xs text-ink-muted dark:text-gray-400">Tier default · Tap to override</span>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {g.values.map((v) => {
                const selected = selectedId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      if (mode === 'quick') setQuickSelections((prev) => ({ ...prev, [g.id]: v.id }));
                      else setCustomSelections((prev) => ({ ...prev, [g.id]: v.id }));
                    }}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm transition',
                      selected
                        ? 'border-brand bg-brand-50 ring-2 ring-brand/30 dark:bg-brand/10'
                        : 'border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {selected && <Check className="h-4 w-4 flex-shrink-0 text-brand" />}
                      <span className="font-medium">{v.label}</span>
                    </span>
                    <span className={cn('flex-shrink-0 text-xs font-semibold', v.priceDelta === 0 ? 'text-ink-muted dark:text-gray-400' : 'text-brand-700 dark:text-brand-400')}>
                      {v.priceDelta === 0 ? 'Included' : `+${formatINR(v.priceDelta)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Summary + add to cart */}
      <div className="sticky bottom-0 z-10 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted dark:text-gray-400">Total</p>
            <p className="text-2xl font-extrabold sm:text-3xl">{formatINR(totalPrice)}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 dark:border-gray-700">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="text-lg text-ink-muted hover:text-brand dark:text-gray-400"
              aria-label="Decrease quantity"
            >−</button>
            <span className="min-w-[2ch] text-center font-bold">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="text-lg text-ink-muted hover:text-brand dark:text-gray-400"
              aria-label="Increase quantity"
            >+</button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => handleAdd(false)}
            className={cn('btn-outline flex-1', added && 'border-green-500 text-green-600')}
          >
            {added ? <><Check className="h-4 w-4" /> Added to Cart</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
          </button>
          <button onClick={() => handleAdd(true)} className="btn-brand flex-1">
            Buy Now →
          </button>
        </div>
      </div>
    </div>
  );
}
