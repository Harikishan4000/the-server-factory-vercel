import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { CONFIGURATOR_SETTINGS_KEY } from '@/lib/site-settings';

const schema = z.object({
  configurator: z.object({
    hideSpecLabels: z.boolean(),
  }),
});

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const value = parsed.data.configurator;
    await prisma.siteSetting.upsert({
      where: { key: CONFIGURATOR_SETTINGS_KEY },
      update: { value },
      create: { key: CONFIGURATOR_SETTINGS_KEY, value },
    });

    // Product pages are ISR'd (revalidate = 300), so without this the change
    // would take up to five minutes to appear.
    revalidatePath('/product/[slug]', 'page');

    return NextResponse.json({ configurator: value });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
