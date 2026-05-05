import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
  tier: z.object({
    name: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']),
    label: z.string(),
  }).optional(),
  options: z.array(z.object({
    groupName: z.string(),
    groupLabel: z.string(),
    valueId: z.string(),
    valueLabel: z.string(),
    priceDelta: z.number(),
  })),
});

const billingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  company: z.string().optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  notes: z.string().optional().or(z.literal('')),
});

const schema = z.object({
  items: z.array(itemSchema).min(1),
  billing: billingSchema,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { items, billing } = parsed.data;

    // Server-side price recomputation — never trust the client for totals
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true, name: true, sku: true, basePrice: true, stock: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const allValueIds = items.flatMap((i) => i.options.map((o) => o.valueId));
    const values = await prisma.optionValue.findMany({
      where: { id: { in: allValueIds } },
      select: { id: true, priceDelta: true, label: true, group: { select: { name: true, label: true } } },
    });
    const valueMap = new Map(values.map((v) => [v.id, v]));

    let subtotal = 0;
    const orderItemsData = await Promise.all(items.map(async (item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product unavailable: ${item.productId}`);

      // Base price path
      let unitPrice = Number(product.basePrice);
      const optionSnapshots = item.options.map((o) => {
        const val = valueMap.get(o.valueId);
        if (!val) throw new Error(`Invalid option selected`);
        const priceDelta = Number(val.priceDelta);
        unitPrice += priceDelta;
        return {
          optionValueId: val.id,
          groupName: val.group.name,
          valueLabel: val.label,
          priceDelta,
        };
      });

      // If tier was picked, check whether its selections match exactly → use override
      if (item.tier) {
        const tier = await prisma.productTier.findFirst({
          where: { productId: product.id, name: item.tier.name, isActive: true },
          include: { selections: true },
        });
        if (tier?.priceOverride != null) {
          const tierValueIds = new Set(tier.selections.map((s) => s.optionValueId));
          const pickedIds = new Set(item.options.map((o) => o.valueId));
          const matches = tierValueIds.size === pickedIds.size && [...tierValueIds].every((id) => pickedIds.has(id));
          if (matches) unitPrice = Number(tier.priceOverride);
        }
      }

      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        tierName: item.tier?.name ?? null,
        tierLabel: item.tier?.label ?? null,
        options: { create: optionSnapshots },
      };
    }));

    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    // Update user profile with billing info for convenience next time
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: billing.name,
        phone: billing.phone,
        company: billing.company || null,
        gstNumber: billing.gstNumber || null,
        addressLine1: billing.addressLine1,
        addressLine2: billing.addressLine2 || null,
        city: billing.city,
        state: billing.state,
        postalCode: billing.postalCode,
        country: billing.country,
      },
    });

    const billingAddressText = [
      billing.addressLine1,
      billing.addressLine2,
      `${billing.city}, ${billing.state} ${billing.postalCode}`,
      billing.country,
    ].filter(Boolean).join('\n');

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        status: 'PENDING',
        subtotal,
        tax,
        total,
        currency: 'INR',
        billingName: billing.name,
        billingEmail: billing.email,
        billingPhone: billing.phone,
        billingAddress: billingAddressText,
        notes: billing.notes || null,
        items: { create: orderItemsData },
      },
    });

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (err) {
    console.error('Order creation error:', err);
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ orders });
}
