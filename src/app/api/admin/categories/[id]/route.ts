import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

const patchSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const category = await prisma.category.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  try {
    const [productCount, childCount] = await Promise.all([
      prisma.product.count({ where: { categoryId: params.id } }),
      prisma.category.count({ where: { parentId: params.id } }),
    ]);
    if (productCount > 0) {
      return NextResponse.json({ error: `Cannot delete: ${productCount} products still assigned. Reassign them first.` }, { status: 400 });
    }
    if (childCount > 0) {
      return NextResponse.json({ error: `Cannot delete: ${childCount} sub-categor${childCount === 1 ? 'y' : 'ies'} nested under this one. Delete or move them first.` }, { status: 400 });
    }
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
