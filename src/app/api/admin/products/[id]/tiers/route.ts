import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

const tierSchema = z.object({
  name: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']),
  label: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
  priceOverride: z.number().nullable(),
  isActive: z.boolean(),
  selectionValueIds: z.array(z.string()),
});

// Upsert (create or update) a single tier
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const parsed = z.object({ tier: tierSchema }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { tier } = parsed.data;
    const productId = params.id;

    // Upsert the tier
    const existing = await prisma.productTier.findUnique({
      where: { productId_name: { productId, name: tier.name } },
    });

    const saved = existing
      ? await prisma.productTier.update({
          where: { id: existing.id },
          data: {
            label: tier.label,
            description: tier.description || null,
            priceOverride: tier.priceOverride,
            isActive: tier.isActive,
            selections: {
              deleteMany: {},
              create: tier.selectionValueIds.map((vid) => ({ optionValueId: vid })),
            },
          },
        })
      : await prisma.productTier.create({
          data: {
            productId,
            name: tier.name,
            label: tier.label,
            description: tier.description || null,
            priceOverride: tier.priceOverride,
            isActive: tier.isActive,
            sortOrder: tier.name === 'BASIC' ? 0 : tier.name === 'INTERMEDIATE' ? 1 : 2,
            selections: {
              create: tier.selectionValueIds.map((vid) => ({ optionValueId: vid })),
            },
          },
        });

    return NextResponse.json({ tier: saved });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const url = new URL(req.url);
    const name = url.searchParams.get('name');
    if (!name || !['BASIC', 'INTERMEDIATE', 'ADVANCED'].includes(name)) {
      return NextResponse.json({ error: 'Invalid tier name' }, { status: 400 });
    }
    await prisma.productTier.delete({
      where: { productId_name: { productId: params.id, name: name as any } },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
