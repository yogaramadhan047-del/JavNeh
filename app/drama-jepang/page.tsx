export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { GenreScrollRow } from "@/components/ui/genre-scroll-row";
import { MovieCard } from "@/components/ui/movie-card";
import { Pagination } from "@/components/ui/pagination";
import { getMovies, getGenres } from "@/lib/movies";
import { getSeriesList } from "@/lib/series";
import { supabase } from "@/lib/supabase";
import { Tv } from "lucide-react";

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
    ? `Nonton Drama Jepang (Dorama) Genre ${genre} Subtitle Indonesia${pageSuffix} - XStream21`
    : `Nonton Drama Jepang (Dorama) Subtitle Indonesia Terbaru${pageSuffix} - XStream21`;
  const description = genre
    ? `Streaming & download Drama Jepang (Dorama) genre ${genre} subtitle Indonesia terlengkap dan terupdate gratis di XStream21.`
    : "Koleksi Drama Jepang (Dorama) & Japanese TV Series subtitle Indonesia terlengkap dari berbagai genre terupdate di XStream21.";

  const canonicalUrl = `${SITE_URL}/drama-jepang${
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

async function getDramaTotalCount(genre?: string): Promise<number> {
  try {
    let moviesQuery = supabase
      .from("movies")
      .select("id", { count: "exact", head: true })
      .eq("status", "Published")
      .eq("category", "Drama Jepang");

    if (genre) {
      moviesQuery = moviesQuery.contains("genres", [genre]);
    }

    let seriesQuery = supabase
      .from("series")
      .select("id", { count: "exact", head: true })
      .eq("category", "Drama Jepang");

    const [{ count: mCount }, { count: sCount }] = await Promise.all([
      moviesQuery,
      seriesQuery,
    ]);

    return (mCount || 0) + (sCount || 0);
  } catch {
    return 0;
  }
}

export default async function DramaJepangPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; page?: string }>;
}) {
  const { genre, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  // Fetch range using exact range parameters
  const from = 0;
  const to = currentPage * ITEMS_PER_PAGE;

  const [genres, dramaMovies, dramaSeries, totalCount] = await Promise.all([
    getGenres(),
    getMovies({
      genre,
      status: "Published",
      category: "Drama Jepang",
      from,
      to,
    }).catch(() => []),
    getSeriesList({
      genre,
      category: "Drama Jepang",
      from,
      to,
    }).catch(() => []),
    getDramaTotalCount(genre),
  ]);

  // Combine drama series and movies, strictly enforcing category 'Drama Jepang'
  const combined = [
    ...dramaMovies.map((m) => ({
      ...m,
      isSeries: false,
      type: "movie" as const,
      poster_url: m.posterUrl,
      banner_url: m.bannerUrl,
    })),
    ...dramaSeries.map((s) => ({
      ...s,
      isSeries: true,
      type: "series" as const,
      poster_url: s.posterUrl,
      banner_url: s.bannerUrl,
    })),
  ].filter((item) => item.category === "Drama Jepang");

  // De-duplicate by id or slug
  const uniqueItems: typeof combined = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const item of combined) {
    if (seenIds.has(item.id)) continue;
    if (item.slug && seenSlugs.has(item.slug)) continue;
    seenIds.add(item.id);
    if (item.slug) seenSlugs.add(item.slug);
    uniqueItems.push(item);
  }

  // Sort by newest createdAt (or updatedAt if present)
  uniqueItems.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
    return timeB - timeA;
  });

  // Calculate slice for current page
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEndIndex = pageStartIndex + ITEMS_PER_PAGE;
  const displayItems = uniqueItems.slice(pageStartIndex, pageEndIndex);

  const effectiveTotal = Math.max(totalCount, uniqueItems.length);
  const totalPages = effectiveTotal > 0 ? Math.ceil(effectiveTotal / ITEMS_PER_PAGE) : 1;
  const hasNextPage = currentPage < totalPages || uniqueItems.length > pageEndIndex;

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
      ...(genre
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: genre,
              item: `${SITE_URL}/drama-jepang?genre=${encodeURIComponent(genre)}`,
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
            { label: "Drama Jepang", href: genre ? "/drama-jepang" : undefined },
            ...(genre ? [{ label: genre }] : []),
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">
              {genre ? `Drama Jepang: ${genre}` : "Koleksi Drama Jepang (Dorama) Terbaru"}
            </h1>
            <p className="text-text-muted">
              {genre
                ? `Menampilkan serial dan film drama Jepang genre ${genre}.`
                : "Streaming dan download drama Jepang (dorama) subtitle Indonesia episode lengkap HD."}
            </p>
          </div>
        </div>

        <GenreScrollRow
          genres={genres}
          activeGenre={genre}
          baseUrl="/drama-jepang"
          allLabel="Semua Dorama"
        />

        {displayItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full max-w-full">
              {displayItems.map((item) => (
                <MovieCard
                  key={item.id}
                  movie={item}
                  baseUrl="/drama-jepang"
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              totalPages={totalPages}
              baseUrl="/drama-jepang"
              searchParams={{ genre }}
            />
          </>
        ) : (
          <div className="min-h-[40vh] flex flex-col items-center justify-center p-4 text-center border border-dashed border-border-dark rounded-2xl">
            <Tv className="w-16 h-16 text-text-muted mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-text-main mb-2">Belum ada Drama Jepang</h2>
            <p className="text-text-muted max-w-md mb-4">
              {genre
                ? `Tidak ditemukan drama Jepang untuk genre "${genre}".`
                : "Daftar drama Jepang saat ini belum tersedia. Silakan cek kembali beberapa saat lagi."}
            </p>
            {currentPage > 1 && (
              <Pagination
                currentPage={currentPage}
                hasNextPage={false}
                totalPages={totalPages}
                baseUrl="/drama-jepang"
                searchParams={{ genre }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
