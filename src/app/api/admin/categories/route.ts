import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const max = await prisma.category.aggregate({
      where: { parentId: parsed.data.parentId ?? null },
      _max: { sortOrder: true },
    });

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        parentId: parsed.data.parentId || null,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });

    return NextResponse.json({ category });
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Slug or name already exists' }, { status: 409 });
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
