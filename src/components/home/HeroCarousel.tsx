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
    <section className="relative h-[560px] overflow-hidden">
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

      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="animate-slide-up font-display text-5xl font-extrabold leading-tight md:text-6xl">
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
          <p className="mt-6 max-w-2xl text-lg text-gray-200">{slide.subheading}</p>
        )}

        {slide.ctaText && slide.ctaLink && (
          <Link href={slide.ctaLink} className="mt-6 text-sm font-semibold text-brand-300 underline underline-offset-4 hover:text-brand-200">
            {slide.ctaText} →
          </Link>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
            className="absolute left-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-xl dark:bg-gray-900/90 dark:text-gray-100 backdrop-blur transition hover:bg-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setI((v) => (v + 1) % slides.length)}
            className="absolute right-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-xl dark:bg-gray-900/90 dark:text-gray-100 backdrop-blur transition hover:bg-white"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-2 rounded-full transition-all ${idx === i ? 'w-8 bg-brand' : 'w-2 bg-white/50'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
