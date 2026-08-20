'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = { imageUrl: string; heading: string; subheading?: string; ctaText?: string; ctaLink?: string };

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[i];

  return (
    <section className="relative h-[clamp(20rem,66vh,38rem)] overflow-hidden">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: `linear-gradient(rgba(10,15,26,0.55), rgba(10,15,26,0.65)), url(${s.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center text-white xs:px-14 sm:px-16 2xl:max-w-5xl">
        <h1 className="heading-hero animate-slide-up font-display font-extrabold">
          {slide.heading.split(' ').map((w, idx, arr) => {
            const midpoint = Math.floor(arr.length / 2);
            return idx >= midpoint ? (
              <span key={idx} className="text-brand"> {w}</span>
            ) : (
              <span key={idx}>{idx > 0 ? ' ' : ''}{w}</span>
            );
          })}
        </h1>
        {slide.subheading && (
          <p className="mt-4 max-w-2xl text-sm text-gray-200 sm:mt-6 sm:text-base md:text-lg">{slide.subheading}</p>
        )}

        {slide.ctaText && slide.ctaLink && (
          <Link href={slide.ctaLink} className="mt-5 text-sm font-semibold text-brand-300 underline underline-offset-4 hover:text-brand-200 sm:mt-6">
            {slide.ctaText} →
          </Link>
        )}
      </div>

      {slides.length > 1 && (
        <>
          {/* Hidden on the narrowest phones — the dots below stay reachable and the
              heading gets the full width instead of dodging two floating buttons */}
          <button
            onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-xl backdrop-blur transition hover:bg-white dark:bg-gray-900/90 dark:text-gray-100 xs:flex sm:left-4 sm:h-12 sm:w-12 lg:left-6"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setI((v) => (v + 1) % slides.length)}
            className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-xl backdrop-blur transition hover:bg-white dark:bg-gray-900/90 dark:text-gray-100 xs:flex sm:right-4 sm:h-12 sm:w-12 lg:right-6"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className="flex h-8 items-center px-1"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span className={`block h-2 rounded-full transition-all ${idx === i ? 'w-8 bg-brand' : 'w-2 bg-white/50'}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
