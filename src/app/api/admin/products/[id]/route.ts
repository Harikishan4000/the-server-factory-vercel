import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

const schema = z.object({
  sku: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  brand: z.string().optional(),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().optional(),
  stock: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { imageUrl, ...data } = parsed.data;
    const product = await prisma.product.update({ where: { id: params.id }, data });

    // Swap primary image if provided
    if (imageUrl) {
      const existing = await prisma.productImage.findFirst({ where: { productId: params.id }, orderBy: { sortOrder: 'asc' } });
      if (existing) {
        await prisma.productImage.update({ where: { id: existing.id }, data: { url: imageUrl } });
      } else {
        await prisma.productImage.create({ data: { productId: params.id, url: imageUrl, sortOrder: 0 } });
      }
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    // Safe delete - product is referenced by order items
    // Soft delete: just mark inactive
    await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Cannot delete — product may be referenced by orders' }, { status: 500 });
  }
}
