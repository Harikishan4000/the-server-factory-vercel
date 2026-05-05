import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

const schema = z.object({
  groups: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    label: z.string().min(1),
    required: z.boolean(),
    sortOrder: z.number().int(),
    values: z.array(z.object({
      id: z.string().optional(),
      label: z.string().min(1),
      priceDelta: z.number(),
      isDefault: z.boolean(),
    })),
  })),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const productId = params.id;

    // Use a transaction: wipe old groups/values then recreate
    // Safer: option values may be referenced by OrderItemOption — but that FK uses onDelete: default (RESTRICT).
    // So we only delete groups that aren't referenced. Simpler approach: detach and recreate via upsert-like.
    // For MVP simplicity, delete and recreate — this works for new/uncommitted products. For products with order history,
    // admin should create new groups rather than modify existing ones. We mitigate by only deleting values not in any order.

    // Fetch currently-referenced value IDs
    const referenced = await prisma.orderItemOption.findMany({
      select: { optionValueId: true },
    });
    const referencedIds = new Set(referenced.map((r) => r.optionValueId));

    const existingGroups = await prisma.optionGroup.findMany({
      where: { productId },
      include: { values: true },
    });

    // Safe cleanup - delete only unreferenced values
    for (const group of existingGroups) {
      for (const val of group.values) {
        if (!referencedIds.has(val.id)) {
          await prisma.optionValue.delete({ where: { id: val.id } }).catch(() => {});
        }
      }
      // If group has no remaining values AND no referenced ones, delete it too
      const remaining = await prisma.optionValue.count({ where: { groupId: group.id } });
      if (remaining === 0) {
        await prisma.optionGroup.delete({ where: { id: group.id } }).catch(() => {});
      }
    }

    // Recreate from submitted groups
    for (const g of parsed.data.groups) {
      const grp = await prisma.optionGroup.create({
        data: {
          productId,
          name: g.name,
          label: g.label,
          required: g.required,
          sortOrder: g.sortOrder,
          values: {
            create: g.values.map((v, i) => ({
              label: v.label,
              priceDelta: v.priceDelta,
              isDefault: v.isDefault,
              sortOrder: i,
            })),
          },
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
