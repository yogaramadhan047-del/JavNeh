export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DramaPlayer } from "@/components/ui/drama-player";
import { MovieDetailBanner } from "@/components/ads/placements";
import { Star, Clock, Calendar, Tv } from "lucide-react";
import { getSeriesBySlugOrId, getSeriesList } from "@/lib/series";
import { getMovieBySlugOrId, getMovies } from "@/lib/movies";
import { notFound, redirect } from "next/navigation";
import Markdown from "react-markdown";
import { MovieCard } from "@/components/ui/movie-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [series, movie] = await Promise.all([
    getSeriesBySlugOrId(slug),
    getMovieBySlugOrId(slug),
  ]);

  const item = series || movie;
  if (!item) {
    return {
      title: "Drama Jepang Not Found - XStream21",
      alternates: { canonical: `${SITE_URL}/drama-jepang/${slug}` },
    };
  }

  // Strictly prioritize Admin-provided SEO Title & Description
  const title = item.seoTitle?.trim()
    ? item.seoTitle.trim()
    : `Nonton ${item.title} Sub Indo - XStream21`;

  const description = item.seoDescription?.trim()
    ? item.seoDescription.trim()
    : item.synopsis?.slice(0, 160) ||
      `Streaming & download drama Jepang ${item.title} (${item.year || ""}) subtitle Indonesia terlengkap kualitas HD di XStream21.`;

  const canonicalUrl = `${SITE_URL}/drama-jepang/${item.slug || slug}`;
  const landscapeImage = item.bannerUrl || item.posterUrl || `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    keywords: item.seoKeywords ? item.seoKeywords.split(",").map((k) => k.trim()) : undefined,
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
          alt: item.title,
        },
      ],
      locale: "id_ID",
      type: series ? "video.tv_show" : "video.movie",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [landscapeImage],
    },
  };
}

export default async function DramaJepangDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [series, movie] = await Promise.all([
    getSeriesBySlugOrId(slug),
    getMovieBySlugOrId(slug),
  ]);

  if (!series && !movie) {
    notFound();
  }

  const isSeries = !!series;
  const item = (series || movie)!;

  if (item.category === "Anime") {
    redirect(`/anime/${item.slug || slug}`);
  }

  const title = item.title;
  const rating = item.rating || (movie ? movie.imdb : 0) || 0;
  const year = item.year;
  const synopsis = item.synopsis;
  const genres = item.genres || [];
  const status = item.status;
  const duration = item.duration;
  const totalEpisodes = series ? series.totalEpisodes : undefined;
  const bannerUrl = item.bannerUrl || item.posterUrl;
  const posterUrl = item.posterUrl;

  const episodes = series ? series.episodes || [] : [];
  const servers = movie ? movie.servers || [] : [];
  const trapDownloadUrl = series?.trapDownloadUrl || movie?.trapDownloadUrl;
  const realDownloadUrl = series?.realDownloadUrl || movie?.realDownloadUrl;

  const [allSeries, allMovies] = await Promise.all([
    getSeriesList({ status: "Published", category: "Drama Jepang", limit: 6 }).catch(() => []),
    getMovies({ status: "Published", category: "Drama Jepang", limit: 6 }).catch(() => []),
  ]);

  const related = [
    ...allSeries
      .filter((s) => s.id !== series?.id)
      .map((s) => ({
        ...s,
        isSeries: true,
      })),
    ...allMovies
      .filter((m) => m.id !== movie?.id)
      .map((m) => ({
        ...m,
        isSeries: false,
      })),
  ].slice(0, 4);

  // Dynamic Schema.org Type: TVSeries or Movie
  const mediaJsonLd = isSeries
    ? {
        "@context": "https://schema.org",
        "@type": "TVSeries",
        name: title,
        image: bannerUrl || posterUrl || "",
        description: item.seoDescription || synopsis || `Nonton Drama Jepang ${title} Sub Indo`,
        dateCreated: year ? `${year}-01-01` : undefined,
        genre: genres.length > 0 ? genres : ["Drama Jepang"],
        numberOfEpisodes: totalEpisodes || undefined,
        aggregateRating:
          rating > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: Number(rating).toFixed(1),
                bestRating: "10",
                worstRating: "1",
                ratingCount: 120,
              }
            : undefined,
      }
    : {
        "@context": "https://schema.org",
        "@type": "Movie",
        name: title,
        image: bannerUrl || posterUrl || "",
        description: item.seoDescription || synopsis || `Nonton Drama Jepang ${title} Sub Indo`,
        dateCreated: year ? `${year}-01-01` : undefined,
        genre: genres.length > 0 ? genres : ["Drama Jepang"],
        duration: duration || undefined,
        aggregateRating:
          rating > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: Number(rating).toFixed(1),
                bestRating: "10",
                worstRating: "1",
                ratingCount: 120,
              }
            : undefined,
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
        name: "Drama Jepang",
        item: `${SITE_URL}/drama-jepang`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_URL}/drama-jepang/${item.slug || slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([mediaJsonLd, breadcrumbJsonLd]) }}
      />
      <div className="relative w-full h-[35vh] sm:h-[45vh] md:h-[55vh] overflow-hidden bg-black">
        {bannerUrl ? (
          <SafeImage
            src={bannerUrl}
            alt={title}
            type="banner"
            fill
            className="object-cover opacity-40 blur-xs scale-105"
            priority
            referrerPolicy="no-referrer"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-900 to-background-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="w-full max-w-7xl mx-auto px-4 pb-8 md:pb-12">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Drama Jepang", href: "/drama-jepang" },
                { label: title },
              ]}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mt-4">
              <div className="relative w-28 sm:w-36 md:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 border-border-dark shrink-0 hidden sm:block">
                <SafeImage
                  src={posterUrl || ""}
                  alt={title}
                  type="poster"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 640px) 112px, 176px"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-primary-blue text-white text-xs font-bold px-2.5 py-0.5 rounded">
                    {isSeries ? "TV SERIES" : "MOVIE"}
                  </span>
                  {status && (
                    <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-0.5 rounded border border-white/10">
                      {status}
                    </span>
                  )}
                  {rating > 0 && (
                    <span className="flex items-center gap-1 text-accent-gold text-xs font-bold bg-black/60 px-2 py-0.5 rounded border border-accent-gold/20">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {Number(rating).toFixed(1)}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                  {title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-text-muted">
                  {year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {year}
                    </span>
                  )}
                  {duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {duration}
                    </span>
                  )}
                  {totalEpisodes && (
                    <span className="flex items-center gap-1">
                      <Tv className="w-3.5 h-3.5" />
                      {totalEpisodes} Episode
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {genres.map((g) => (
                      <Link
                        prefetch={false}
                        key={g}
                        href={`/drama-jepang?genre=${encodeURIComponent(g)}`}
                        className="hover:text-primary-blue transition-colors"
                      >
                        {g}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 mt-6 space-y-8">
        <DramaPlayer
          isSeries={isSeries}
          episodes={episodes}
          servers={servers}
          posterUrl={bannerUrl || posterUrl}
          title={title}
          trapDownloadUrl={trapDownloadUrl}
          realDownloadUrl={realDownloadUrl}
        />

        <MovieDetailBanner />

        <div className="w-full max-w-4xl bg-card-dark rounded-2xl border border-border-dark p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary-blue rounded-full"></span>
            Sinopsis
          </h3>
          <div className="text-gray-300 leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
            <Markdown>{synopsis || "Belum ada sinopsis untuk judul ini."}</Markdown>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary-blue rounded-full"></span>
            Drama Serupa
          </h2>
          {related.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((item) => (
                <MovieCard key={item.id} movie={item} baseUrl="/drama-jepang" />
              ))}
            </div>
          ) : (
            <p className="text-text-muted">Tidak ada drama serupa.</p>
          )}
        </div>
      </div>
    </div>
  );
}
