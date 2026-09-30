export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";

import { SafeImage } from "@/components/ui/safe-image";
import { MovieCard } from "@/components/ui/movie-card";
import { HeroSearch } from "@/components/home/hero-search";
import { SectionHeader } from "@/components/ui/section-header";
import { Suspense } from "react";
import { MovieCardSkeleton } from "@/components/ui/movie-card-skeleton";
import { ApologyModal } from "@/components/ui/apology-modal";
import { FeaturedCarousel } from "@/components/home/featured-carousel";
import Link from "next/link";
import { Article } from "@/types/article";
import { getArticles } from "@/lib/articles";
import { getMovies } from "@/lib/movies";
import { getHotCarouselItems } from "@/lib/carousel";
import { HeaderBanners } from "@/components/ads/placements";

export const metadata: Metadata = {
  title: "XStream21 - Nonton Film & Movie Subtitle Indonesia Terbaru",
  description: "Platform streaming film dan movie subtitle Indonesia terlengkap dan gratis dengan artikel, berita, dan review film terkini.",
  openGraph: {
    title: "XStream21 - Nonton Film & Movie Subtitle Indonesia Terbaru",
    description: "Platform streaming film dan movie subtitle Indonesia terlengkap dan gratis dengan artikel, berita, dan review film terkini.",
    url: SITE_URL,
    siteName: "XStream21",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "XStream21",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XStream21 - Nonton Film & Movie Subtitle Indonesia Terbaru",
    description: "Platform streaming film dan movie subtitle Indonesia terlengkap dan gratis dengan artikel, berita, dan review film terkini.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/`,
  },
};

/**
 * Fetch up to 8 latest Movie items
 */
async function getRecentMovies() {
  try {
    const movies = await getMovies({ status: "Published", limit: 8 }).catch(() => []);
    return movies;
  } catch (error) {
    console.error("Error fetching recent movies:", error);
    return [];
  }
}

/**
 * Fetch up to 8 latest Articles
 */
async function getRecentArticles(): Promise<Article[]> {
  try {
    return await getArticles({ status: "Published", limit: 8 });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ArticleGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-card-dark rounded-xl overflow-hidden border border-border-dark animate-pulse"
        >
          <div className="relative aspect-video w-full bg-gray-800/50"></div>
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 bg-gray-800/80 rounded w-16"></div>
              <div className="h-3 bg-gray-800/80 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-800/80 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-800/80 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function MovieSection() {
  const movieList = await getRecentMovies();
  if (!movieList.length) {
    return (
      <div className="py-10 text-center text-text-muted border border-border-dark rounded-xl bg-card-dark">
        Belum ada film terbaru.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {movieList.map((movie) => (
        <MovieCard key={movie.id} movie={movie} baseUrl="/movies" />
      ))}
    </div>
  );
}

async function ArticlesSection() {
  const articles = await getRecentArticles();
  if (!articles.length) {
    return (
      <div className="py-10 text-center text-text-muted border border-border-dark rounded-xl bg-card-dark">
        Belum ada artikel terbaru.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {articles.map((article) => (
        <div key={article.id}>
          <Link
            prefetch={false}
            href={`/artikel/${article.slug || article.id}`}
            className="group flex flex-col h-full bg-card-dark rounded-xl overflow-hidden border border-border-dark hover:border-primary-blue transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-blue/20"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-900/50 shrink-0">
              <SafeImage
                src={article.thumbnailUrl || ""}
                alt={article.title}
                type="thumbnail"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
              />
            </div>
            <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-text-muted mb-1.5">
                  <span className="text-primary-blue font-medium">{article.category}</span>
                  <span>•</span>
                  <span>
                    {article.publishedAt
                      ? new Date(
                          typeof (article.publishedAt as { toMillis?: () => number })?.toMillis === "function"
                            ? (article.publishedAt as { toMillis: () => number }).toMillis()
                            : (article.publishedAt as string | number)
                        ).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                      : ""}
                  </span>
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-text-main group-hover:text-primary-blue transition-colors line-clamp-2">
                  {article.title}
                </h3>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

async function CarouselSection() {
  const hotItems = await getHotCarouselItems();
  if (!hotItems || hotItems.length === 0) return null;
  return <FeaturedCarousel initialItems={hotItems} />;
}

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "XStream21",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.ico`,
      sameAs: [
        "https://twitter.com/xstream21",
        "https://instagram.com/xstream21",
        "https://facebook.com/xstream21",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "XStream21",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ApologyModal />

      {/* 1. Hero Section (Strictly Hot Content Only) */}
      <CarouselSection />

      <div className="relative w-full max-w-full flex-1 flex flex-col overflow-x-hidden">
        {/* Animated Background Aura Glow */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none select-none max-w-full"
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 90%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 90%)",
          }}
        >
          <div
            className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[700px] bg-purple-600/40 rounded-full blur-[120px] md:blur-[150px] animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          <div
            className="absolute top-[5%] left-[5%] w-full max-w-[900px] h-[600px] bg-blue-600/40 rounded-full blur-[120px] md:blur-[160px] animate-pulse"
            style={{ animationDelay: "2s", animationDuration: "6s" }}
          />
          <div
            className="absolute top-[5%] right-[5%] w-full max-w-[800px] h-[600px] bg-cyan-500/30 rounded-full blur-[120px] md:blur-[160px] animate-pulse"
            style={{ animationDelay: "4s", animationDuration: "7s" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-full flex-1 flex flex-col">
          {/* 2. Search Section */}
          <HeroSearch />

          {/* Header Banners 1 & 2 */}
          <div className="w-full max-w-7xl mx-auto px-4">
            <HeaderBanners className="!my-2" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-4 space-y-12">
            {/* 3. Movies Terbaru */}
            <section>
              <SectionHeader title="Movie Terbaru" href="/movies" />
              <Suspense fallback={<MovieGridSkeleton />}>
                <MovieSection />
              </Suspense>
            </section>

            {/* 4. Artikel Terbaru */}
            <section>
              <SectionHeader title="Artikel Terbaru" href="/artikel" />
              <Suspense fallback={<ArticleGridSkeleton />}>
                <ArticlesSection />
              </Suspense>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
