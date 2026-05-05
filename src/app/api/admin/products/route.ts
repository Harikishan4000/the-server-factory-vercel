import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

const schema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  brand: z.string().optional(),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().min(0),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  categoryId: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { imageUrl, ...data } = parsed.data;

    const product = await prisma.product.create({
      data: {
        ...data,
        ...(imageUrl ? { images: { create: [{ url: imageUrl, sortOrder: 0 }] } } : {}),
      },
    });
    return NextResponse.json({ product });
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'SKU or slug already exists' }, { status: 409 });
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
