import { SITE_URL } from "@/lib/constants";
import { UnifiedContent } from "@/types/content";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ContentPlayer } from "@/components/ui/content-player";
import { MovieCard } from "@/components/ui/movie-card";
import { MovieDetailBanner } from "@/components/ads/placements";
import { Star, Clock, Calendar, Film } from "lucide-react";
import Markdown from "react-markdown";
import Link from "next/link";

interface UnifiedContentDetailPageProps {
  content: UnifiedContent;
  relatedContent: UnifiedContent[];
}

export function UnifiedContentDetailPage({
  content,
  relatedContent,
}: UnifiedContentDetailPageProps) {
  const categoryLabel = content.category || "Movie";
  const categoryRoute = "/movies";

  const ratingVal = content.imdb || content.rating || 0;
  const displayRating = ratingVal > 0 ? Number(ratingVal).toFixed(1) : null;

  const mediaType = "Movie";
  const mediaJsonLd = {
    "@context": "https://schema.org",
    "@type": mediaType,
    name: content.title,
    alternativeHeadline: content.originalTitle || undefined,
    image: content.imageUrl || `${SITE_URL}/og-image.jpg`,
    description: content.seoDescription || content.synopsis || `Nonton ${content.title} Sub Indo`,
    dateCreated: content.year ? `${content.year}-01-01` : undefined,
    datePublished: content.releaseDate || undefined,
    genre: content.genres && content.genres.length > 0 ? content.genres : [categoryLabel],
    inLanguage: content.language || "Japanese",
    subtitleLanguage: content.subtitle || "Indonesian",
    duration: content.duration || undefined,
    ...(ratingVal > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: displayRating,
            bestRating: "10",
            worstRating: "1",
            ratingCount: 150,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Movie",
        item: `${SITE_URL}${categoryRoute}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: content.title,
        item: `${SITE_URL}${categoryRoute}/${content.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen pb-16 bg-background-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([mediaJsonLd, breadcrumbJsonLd]) }}
      />

      {/* Hero Header Section */}
      <div className="relative w-full bg-[#0f0f0f] border-b border-border-dark/50">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-[2px] scale-105"
            style={{ backgroundImage: `url(${content.imageUrl || ""})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/90 via-[#0f0f0f]/50 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-6 pb-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Movie", href: categoryRoute },
              { label: content.title },
            ]}
          />

          <div className="mt-6 flex flex-col gap-4">
            {/* Badges & Meta Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-primary-blue text-white text-xs font-bold rounded">
                {categoryLabel}
              </span>

              {content.badge && (
                <span className={`px-2.5 py-1 text-white text-xs font-bold rounded ${
                  content.badge.toLowerCase() === "hot"
                    ? "bg-red-600"
                    : content.badge.toLowerCase() === "new"
                    ? "bg-emerald-600"
                    : "bg-amber-600"
                }`}>
                  {content.badge}
                </span>
              )}

              {content.resolution && (
                <span className="px-2 py-0.5 bg-white/10 text-white text-xs rounded border border-white/10 font-medium">
                  {content.resolution}
                </span>
              )}

              {content.status && (
                <span className="px-2 py-0.5 bg-white/5 text-gray-300 text-xs rounded border border-white/10">
                  {content.status}
                </span>
              )}

              {displayRating && (
                <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-accent-gold/20 text-accent-gold text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{displayRating}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {content.title}
            </h1>

            {/* Metadata Information Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-text-muted">
              {content.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary-blue" />
                  {content.year}
                </span>
              )}
              {content.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary-blue" />
                  {content.duration}
                </span>
              )}
              {content.country && (
                <span className="flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-primary-blue" />
                  {content.country}
                </span>
              )}
            </div>

            {/* Genres Tag Pills */}
            {content.genres && content.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {content.genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`${categoryRoute}?genre=${encodeURIComponent(genre)}`}
                    prefetch={false}
                    className="px-3 py-1 bg-card-dark hover:bg-white/10 text-gray-300 hover:text-white border border-border-dark rounded-lg text-xs transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 mt-8 space-y-10">
        {/* Unified Video Player */}
        <ContentPlayer content={content} />

        {/* Ad Placement */}
        <MovieDetailBanner />

        {/* Synopsis Section */}
        <div className="w-full max-w-4xl bg-card-dark rounded-2xl border border-border-dark p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-primary-blue rounded-full"></span>
            Sinopsis
          </h2>
          <div className="text-gray-300 leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
            <Markdown>{content.synopsis || `Belum ada sinopsis untuk ${content.title}.`}</Markdown>
          </div>
        </div>

        {/* Related Content Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary-blue rounded-full"></span>
            Rekomendasi Film Serupa
          </h2>
          {relatedContent && relatedContent.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedContent.map((item) => (
                <MovieCard
                  key={item.id}
                  movie={{
                    id: item.id,
                    title: item.title,
                    slug: item.slug,
                    posterUrl: item.posterUrl,
                    bannerUrl: item.bannerUrl,
                    year: item.year,
                    rating: item.rating,
                    imdb: item.imdb,
                    genres: item.genres,
                    duration: item.duration,
                    resolution: item.resolution,
                    badge: item.badge,
                    category: item.category,
                    country: item.country,
                    isSeries: item.isSeries,
                    createdAt: item.createdAt,
                  }}
                  baseUrl={categoryRoute}
                />
              ))}
            </div>
          ) : (
            <p className="text-text-muted">
              Tidak ada film serupa yang ditemukan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
