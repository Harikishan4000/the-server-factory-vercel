import { prisma } from '@/lib/prisma';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { PromoBanner } from '@/components/home/PromoBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { BrandLogos } from '@/components/home/BrandLogos';
import { CtaBlock } from '@/components/home/CtaBlock';

export const revalidate = 60; // ISR - refresh homepage every minute

export default async function HomePage() {
  const blocks = await prisma.landingBlock
    .findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } })
    .catch(() => []);

  return (
    <div>
      {blocks.map((block) => {
        const data = block.data as any;
        switch (block.type) {
          case 'HERO_CAROUSEL':
            return <HeroCarousel key={block.id} slides={data.slides ?? []} />;
          case 'PROMO_BANNER':
            return <PromoBanner key={block.id} text={data.text} link={data.link} bgColor={data.bgColor} />;
          case 'FEATURED_PRODUCTS':
            return <FeaturedProducts key={block.id} heading={data.heading} limit={data.limit ?? 8} />;
          case 'CATEGORY_GRID':
            return <CategoryGrid key={block.id} heading={data.heading} />;
          case 'BRAND_LOGOS':
            return <BrandLogos key={block.id} heading={data.heading} brands={data.brands ?? []} />;
          case 'CTA':
            return <CtaBlock key={block.id} {...data} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
