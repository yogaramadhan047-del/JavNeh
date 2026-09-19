export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { getMovieBySlugOrId, getRelatedMovies } from "@/lib/movies";
import { notFound, redirect } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MoviePlayer } from "@/components/ui/movie-player";
import { MovieCard } from "@/components/ui/movie-card";
import { MovieDetailBanner } from "@/components/ads/placements";
import { Star, Clock, Calendar, Film } from "lucide-react";
import Markdown from "react-markdown";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovieBySlugOrId(slug);

  if (!movie) {
    return {
      title: "Anime Not Found - XStream21",
      alternates: {
        canonical: `${SITE_URL}/anime/${slug}`,
      },
    };
  }

  // Strictly prioritize Admin-provided SEO Title & Description if present
  const title = movie.seoTitle?.trim()
    ? movie.seoTitle.trim()
    : `Nonton Anime ${movie.title} Sub Indo - XStream21`;

  const description = movie.seoDescription?.trim()
    ? movie.seoDescription.trim()
    : movie.synopsis?.slice(0, 160) ||
      `Streaming & download anime ${movie.title} (${movie.year || ""}) subtitle Indonesia gratis dengan kualitas HD di XStream21.`;

  const canonicalUrl = `${SITE_URL}/anime/${movie.slug || slug}`;
  const landscapeImage = movie.bannerUrl || movie.posterUrl || `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    keywords: movie.seoKeywords ? movie.seoKeywords.split(",").map((k) => k.trim()) : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "XStream21",
      images: [
        {
          url: landscapeImage,
          width: 1280,
          height: 720,
          alt: movie.title,
        },
      ],
      locale: "id_ID",
      type: "video.movie",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [landscapeImage],
    },
  };
}

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movie = await getMovieBySlugOrId(slug);

  if (!movie || (movie.status && movie.status !== "Published")) {
    notFound();
  }

  if (movie.category === "Drama Jepang") {
    redirect(`/drama-jepang/${movie.slug || slug}`);
  }

  const relatedMovies = await getRelatedMovies(movie, 6);

  // Schema.org Movie Structured Data
  const movieJsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    alternativeHeadline: movie.originalTitle || undefined,
    image: movie.bannerUrl || movie.posterUrl || "",
    description: movie.seoDescription || movie.synopsis || `Nonton Anime ${movie.title} Sub Indo`,
    dateCreated: movie.year ? `${movie.year}-01-01` : undefined,
    datePublished: movie.releaseDate || undefined,
    genre: movie.genres && movie.genres.length > 0 ? movie.genres : ["Anime"],
    inLanguage: movie.language || "Japanese",
    subtitleLanguage: movie.subtitle || "Indonesian",
    duration: movie.duration || undefined,
    aggregateRating:
      (movie.imdb || movie.rating) && (movie.imdb || movie.rating) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(movie.imdb || movie.rating).toFixed(1),
            bestRating: "10",
            worstRating: "1",
            ratingCount: 150,
          }
        : undefined,
  };

  // Schema.org BreadcrumbList Structured Data
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
        name: "Anime",
        item: `${SITE_URL}/anime`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: movie.title,
        item: `${SITE_URL}/anime/${movie.slug || slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen pb-12 bg-background-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([movieJsonLd, breadcrumbJsonLd]) }}
      />

      {/* Hero Section */}
      <div className="relative w-full bg-[#0f0f0f]">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${movie.bannerUrl || movie.posterUrl || ""})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-6 pb-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Anime", href: "/anime" },
              { label: movie.title },
            ]}
          />

          <div className="mt-6 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-primary-blue text-white text-xs font-bold rounded">
                  {movie.badge || "HD"}
                </span>
                {movie.resolution && (
                  <span className="px-2 py-0.5 bg-white/10 text-white text-xs rounded border border-white/10">
                    {movie.resolution}
                  </span>
                )}
                {(movie.imdb || movie.rating) && (
                  <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-accent-gold/20 text-accent-gold text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{Number(movie.imdb || movie.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-text-muted mb-6">
                {movie.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {movie.year}
                  </span>
                )}
                {movie.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {movie.duration}
                  </span>
                )}
                {movie.country && (
                  <span className="flex items-center gap-1">
                    <Film className="w-4 h-4" />
                    {movie.country}
                  </span>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-card-dark text-text-muted-hover border border-border-dark rounded-lg text-xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 mt-8 space-y-10">
        <MoviePlayer movie={movie} />

        <MovieDetailBanner />

        <div className="w-full max-w-4xl bg-card-dark rounded-2xl border border-border-dark p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary-blue rounded-full"></span>
            Sinopsis
          </h2>
          <div className="text-gray-300 leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
            <Markdown>{movie.synopsis || "Belum ada sinopsis untuk anime ini."}</Markdown>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary-blue rounded-full"></span>
            Anime Serupa
          </h2>
          {relatedMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedMovies.slice(0, 4).map((item) => (
                <MovieCard key={item.id} movie={item} baseUrl="/anime" />
              ))}
            </div>
          ) : (
            <p className="text-text-muted">Tidak ada anime serupa yang ditemukan.</p>
          )}
        </div>
      </div>
    </div>
  );
}
