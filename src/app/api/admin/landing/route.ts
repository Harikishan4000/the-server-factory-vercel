import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

const BLOCK_TYPES = ['HERO_CAROUSEL', 'PROMO_BANNER', 'FEATURED_PRODUCTS', 'CATEGORY_GRID', 'TESTIMONIALS', 'BRAND_LOGOS', 'CTA', 'RICH_TEXT'] as const;

const schema = z.object({
  type: z.enum(BLOCK_TYPES),
  title: z.string().optional().nullable(),
  data: z.any(),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const block = await prisma.landingBlock.create({
      data: {
        type: parsed.data.type,
        title: parsed.data.title ?? null,
        data: parsed.data.data,
        sortOrder: parsed.data.sortOrder ?? 0,
        isVisible: parsed.data.isVisible ?? true,
      },
    });
    return NextResponse.json({ block });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
