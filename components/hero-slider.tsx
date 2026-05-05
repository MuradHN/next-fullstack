"use client";

import { Carousel } from "antd";
import Image from "next/image";
import Link from "next/link";

type HeroSlide = {
  eyebrow: string;
  href: string;
  image?: string;
  subtitle: string;
  title: string;
};

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  if (slides.length === 0) {
    return (
      <div className="relative min-h-[280px] overflow-hidden rounded-[7px] bg-white shadow-lg shadow-black/10 lg:col-span-8 lg:min-h-[400px]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#dfe7f7_0%,#f8fbff_70%)]" />
      </div>
    );
  }

  return (
    <div className="hero-carousel min-h-[280px] overflow-hidden rounded-[7px] bg-white shadow-lg shadow-black/10 lg:col-span-8 lg:min-h-[400px]">
      <Carousel
        autoplay={slides.length > 1}
        autoplaySpeed={4200}
        draggable
        effect="scrollx"
        infinite={slides.length > 1}
        pauseOnHover
        speed={900}
      >
        {slides.map((slide, index) => (
          <div key={`${slide.title}-${index}`}>
            <Link
              className="group relative block min-h-[280px] overflow-hidden lg:min-h-[400px]"
              href={slide.href}
            >
              {slide.image ? (
                <Image
                  alt={slide.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 815px"
                  src={slide.image}
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#dfe7f7_0%,#f8fbff_70%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#073199]/55 via-[#073199]/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 max-w-2xl p-5 text-white sm:p-8">
                <p className="mb-3 w-fit rounded bg-[#0dcaf0] px-3 py-1 text-xs font-bold uppercase">
                  {slide.eyebrow}
                </p>
                <h1 className="text-2xl font-black leading-tight sm:text-4xl">{slide.title}</h1>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/90 sm:text-base">
                  {slide.subtitle}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
