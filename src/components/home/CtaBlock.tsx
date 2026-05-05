import Link from 'next/link';

export function CtaBlock({ heading, subheading, ctaText, ctaLink }: { heading?: string; subheading?: string; ctaText?: string; ctaLink?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-400 px-8 py-16 text-center text-white shadow-brand md:px-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          {heading && <h2 className="font-display text-3xl font-extrabold md:text-4xl">{heading}</h2>}
          {subheading && <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{subheading}</p>}
          {ctaText && ctaLink && (
            <Link href={ctaLink} className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-bold text-brand-700 shadow-xl transition hover:scale-105">
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
