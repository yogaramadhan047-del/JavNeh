"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { getHotCarouselItems } from "@/lib/carousel";
import { MovieCardItem } from "@/components/ui/movie-card";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedCarouselProps {
  initialItems?: MovieCardItem[];
}

export function FeaturedCarousel({ initialItems }: FeaturedCarouselProps) {
  const [items, setItems] = useState<MovieCardItem[]>(initialItems || []);
  const [loading, setLoading] = useState<boolean>(!initialItems);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: 4500, stopOnInteraction: true }),
  ]);

  const scrollPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (emblaApi) emblaApi.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (emblaApi) emblaApi.scrollNext();
    },
    [emblaApi]
  );

  useEffect(() => {
    if (initialItems !== undefined) {
      return;
    }

    let isMounted = true;
    async function fetchFeatured() {
      try {
        const hotItems = await getHotCarouselItems();
        if (isMounted) {
          setItems(hotItems);
        }
      } catch (error) {
        console.error("Error fetching hot carousel items:", error);
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchFeatured();

    return () => {
      isMounted = false;
    };
  }, [initialItems]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 mt-6 mb-2">
        <div className="h-[250px] md:h-[450px] w-full bg-card-dark/80 rounded-2xl border border-border-dark animate-pulse shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
            <div className="h-6 md:h-10 bg-gray-800 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Gracefully hide itself if there are zero Hot items
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-6 mb-2 relative group">
      <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {items.map((item) => {
            const itemHref = `/movies/${item.slug || item.id}`;

            const singleImage = item.bannerUrl || item.posterUrl || item.thumbnailUrl || "";

            return (
              <div className="flex-[0_0_100%] min-w-0 relative" key={item.id}>
                <Link
                  prefetch={false}
                  href={itemHref}
                  className="block relative w-full h-[250px] md:h-[450px] bg-background-dark outline-none cursor-pointer overflow-hidden"
                >
                  <SafeImage
                    src={singleImage}
                    alt={item.title}
                    type="banner"
                    fill
                    className="object-cover md:object-[center_20%] opacity-80 hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    sizes="(max-width: 768px) 100vw, 1280px"
                    priority
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent pointer-events-none" />

                  <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full pointer-events-none">
                    <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded mb-3 shadow-lg uppercase tracking-wider">
                      HOT
                    </span>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                      {item.title}
                    </h2>
                    <div className="flex items-center gap-3 text-sm md:text-base text-gray-300">
                      {item.year && <span>{item.year}</span>}
                      {item.resolution && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs">
                            {item.resolution}
                          </span>
                        </>
                      )}
                      {item.genres && item.genres.length > 0 && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span>{item.genres.slice(0, 2).join(", ")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-primary-blue backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl z-10 cursor-pointer"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-primary-blue backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl z-10 cursor-pointer"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </>
      )}
    </div>
  );
}
