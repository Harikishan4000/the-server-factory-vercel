import Link from 'next/link';

export function CtaBlock({ heading, subheading, ctaText, ctaLink }: { heading?: string; subheading?: string; ctaText?: string; ctaLink?: string }) {
  return (
    <section className="container-page py-10 sm:py-12 md:py-16">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 px-5 py-10 text-center text-white shadow-brand sm:rounded-3xl sm:px-8 sm:py-12 md:px-16 md:py-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          {heading && <h2 className="heading-section font-display font-extrabold">{heading}</h2>}
          {subheading && <p className="mx-auto mt-3 max-w-2xl text-sm text-white/90 sm:mt-4 sm:text-base md:text-lg">{subheading}</p>}
          {ctaText && ctaLink && (
            <Link href={ctaLink} className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-xl transition hover:scale-105 sm:mt-8 sm:px-8 sm:text-base">
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
