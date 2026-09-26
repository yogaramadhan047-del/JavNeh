export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MovieCard } from "@/components/ui/movie-card";
import { GenreScrollRow } from "@/components/ui/genre-scroll-row";
import { Pagination } from "@/components/ui/pagination";
import { getMovies, getGenres } from "@/lib/movies";
import { getSeriesList } from "@/lib/series";
import { supabase } from "@/lib/supabase";
import { Film } from "lucide-react";

const ITEMS_PER_PAGE = 24;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; page?: string }>;
}): Promise<Metadata> {
  const { genre, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
  const pageSuffix = pageNum > 1 ? ` - Halaman ${pageNum}` : "";
  const title = genre
    ? `Nonton Anime Genre ${genre} Subtitle Indonesia${pageSuffix} - XStream21`
    : `Nonton Anime Subtitle Indonesia Terbaru${pageSuffix} - XStream21`;
  const description = genre
    ? `Streaming & download anime genre ${genre} subtitle Indonesia terlengkap dan terupdate gratis di XStream21.`
    : "Koleksi anime subtitle Indonesia terlengkap dari berbagai genre, movie anime, dan serial anime terupdate di XStream21.";

  const canonicalUrl = `${SITE_URL}/anime${
    genre
      ? `?genre=${encodeURIComponent(genre)}${pageNum > 1 ? `&page=${pageNum}` : ""}`
      : pageNum > 1
      ? `?page=${pageNum}`
      : ""
  }`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "XStream21",
      locale: "id_ID",
      type: "website",
    },
  };
}

async function getAnimeTotalCount(genre?: string): Promise<number> {
  try {
    let moviesQuery = supabase
      .from("movies")
      .select("id", { count: "exact", head: true })
      .eq("status", "Published")
      .eq("category", "Anime");

    if (genre) {
      moviesQuery = moviesQuery.contains("genres", [genre]);
    }

    let seriesQuery = supabase
      .from("series")
      .select("id", { count: "exact", head: true })
      .eq("category", "Anime");

    const [{ count: mCount }, { count: sCount }] = await Promise.all([
      moviesQuery,
      seriesQuery,
    ]);

    return (mCount || 0) + (sCount || 0);
  } catch {
    return 0;
  }
}

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; page?: string }>;
}) {
  const { genre, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  // Fetch range using exact range parameters
  const from = 0;
  const to = currentPage * ITEMS_PER_PAGE;

  const [genres, animeMovies, animeSeries, totalCount] = await Promise.all([
    getGenres(),
    getMovies({
      genre,
      status: "Published",
      category: "Anime",
      from,
      to,
    }).catch(() => []),
    getSeriesList({
      genre,
      category: "Anime",
      from,
      to,
    }).catch(() => []),
    getAnimeTotalCount(genre),
  ]);

  // Combine, normalize, and strictly enforce category filter
  const combined = [
    ...animeMovies.map((m) => ({
      ...m,
      isSeries: false,
      type: "movie" as const,
      poster_url: m.posterUrl,
      banner_url: m.bannerUrl,
    })),
    ...animeSeries.map((s) => ({
      ...s,
      isSeries: true,
      type: "series" as const,
      poster_url: s.posterUrl,
      banner_url: s.bannerUrl,
    })),
  ].filter((item) => item.category === "Anime");

  // Deduplicate by id or slug
  const uniqueAnime: typeof combined = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const item of combined) {
    if (seenIds.has(item.id)) continue;
    if (item.slug && seenSlugs.has(item.slug)) continue;
    seenIds.add(item.id);
    if (item.slug) seenSlugs.add(item.slug);
    uniqueAnime.push(item);
  }

  // Sort by newest createdAt (or updatedAt if present)
  uniqueAnime.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
    return timeB - timeA;
  });

  // Calculate slice for current page
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEndIndex = pageStartIndex + ITEMS_PER_PAGE;
  const displayAnime = uniqueAnime.slice(pageStartIndex, pageEndIndex);

  const effectiveTotal = Math.max(totalCount, uniqueAnime.length);
  const totalPages = effectiveTotal > 0 ? Math.ceil(effectiveTotal / ITEMS_PER_PAGE) : 1;
  const hasNextPage = currentPage < totalPages || uniqueAnime.length > pageEndIndex;

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
      ...(genre
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: genre,
              item: `${SITE_URL}/anime?genre=${encodeURIComponent(genre)}`,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="w-full max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Anime", href: genre ? "/anime" : undefined },
            ...(genre ? [{ label: genre }] : []),
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">
              {genre ? `Anime: ${genre}` : "Koleksi Anime Terbaru"}
            </h1>
            <p className="text-text-muted">
              {genre
                ? `Menampilkan anime dalam genre ${genre}.`
                : "Streaming dan download anime subtitle Indonesia kualitas HD gratis."}
            </p>
          </div>
        </div>

        <GenreScrollRow
          genres={genres}
          activeGenre={genre}
          baseUrl="/anime"
          allLabel="Semua Anime"
        />

        {displayAnime.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full max-w-full">
              {displayAnime.map((anime) => (
                <MovieCard key={anime.id} movie={anime} baseUrl="/anime" />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              totalPages={totalPages}
              baseUrl="/anime"
              searchParams={{ genre }}
            />
          </>
        ) : (
          <div className="min-h-[40vh] flex flex-col items-center justify-center p-4 text-center border border-dashed border-border-dark rounded-2xl">
            <Film className="w-16 h-16 text-text-muted mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-text-main mb-2">Belum ada Anime</h2>
            <p className="text-text-muted max-w-md mb-4">
              {genre
                ? `Tidak ditemukan anime untuk genre "${genre}".`
                : "Daftar anime saat ini belum tersedia. Silakan cek kembali beberapa saat lagi."}
            </p>
            {currentPage > 1 && (
              <Pagination
                currentPage={currentPage}
                hasNextPage={false}
                totalPages={totalPages}
                baseUrl="/anime"
                searchParams={{ genre }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
