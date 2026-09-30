export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MovieCard } from "@/components/ui/movie-card";
import { GenreScrollRow } from "@/components/ui/genre-scroll-row";
import { Pagination } from "@/components/ui/pagination";
import { getMovies, getGenres } from "@/lib/movies";
import { supabase } from "@/lib/supabase";
import { Film } from "lucide-react";
import { Movie } from "@/types/movie";

const ITEMS_PER_PAGE = 10;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; page?: string }>;
}): Promise<Metadata> {
  const { genre, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
  const pageSuffix = pageNum > 1 ? ` - Halaman ${pageNum}` : "";
  const title = genre
    ? `Nonton Movie Genre ${genre} Subtitle Indonesia${pageSuffix} - XStream21`
    : `Nonton Film & Movie Subtitle Indonesia Terbaru${pageSuffix} - XStream21`;
  const description = genre
    ? `Streaming & download film dan movie genre ${genre} subtitle Indonesia terlengkap and terupdate gratis di XStream21.`
    : "Koleksi film & movie subtitle Indonesia terlengkap dari berbagai genre, box office, dan film bioskop terupdate di XStream21.";

  const canonicalUrl = `${SITE_URL}/movies${
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

async function getMoviesTotalCount(genre?: string): Promise<number> {
  try {
    let query = supabase
      .from("movies")
      .select("id", { count: "exact", head: true })
      .eq("status", "Published");

    if (genre) {
      query = query.contains("genres", [genre]);
    }

    const { count } = await query;
    return count || 0;
  } catch {
    return 0;
  }
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; page?: string }>;
}) {
  const { genre, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  // Fetch range using exact range parameters for 10 items
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const [genres, movies, totalCount] = await Promise.all([
    getGenres(),
    getMovies({
      genre,
      status: "Published",
      from,
      to,
    }).catch(() => []),
    getMoviesTotalCount(genre),
  ]);

  // Deduplicate and filter (getMovies returns mapped/validated movies)
  const uniqueMovies: Movie[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const item of movies) {
    if (seenIds.has(item.id)) continue;
    if (item.slug && seenSlugs.has(item.slug)) continue;
    seenIds.add(item.id);
    if (item.slug) seenSlugs.add(item.slug);
    uniqueMovies.push(item);
  }

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / ITEMS_PER_PAGE) : 1;
  const hasNextPage = currentPage < totalPages;

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
        item: `${SITE_URL}/movies`,
      },
      ...(genre
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: genre,
              item: `${SITE_URL}/movies?genre=${encodeURIComponent(genre)}`,
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Movie", href: genre ? "/movies" : undefined },
            ...(genre ? [{ label: genre }] : []),
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">
              {genre ? `Movie: ${genre}` : "Koleksi Film Terbaru"}
            </h1>
            <p className="text-text-muted">
              {genre
                ? `Menampilkan film dalam genre ${genre}.`
                : "Streaming dan download film subtitle Indonesia kualitas HD gratis."}
            </p>
          </div>
        </div>

        <GenreScrollRow
          genres={genres}
          activeGenre={genre}
          baseUrl="/movies"
          allLabel="Semua Film"
        />

        {uniqueMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4 sm:gap-6 w-full max-w-full">
              {uniqueMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} baseUrl="/movies" />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              totalPages={totalPages}
              baseUrl="/movies"
              searchParams={{ genre }}
            />
          </>
        ) : (
          <div className="min-h-[40vh] flex flex-col items-center justify-center p-4 text-center border border-dashed border-border-dark rounded-2xl">
            <Film className="w-16 h-16 text-text-muted mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-text-main mb-2">Belum ada Film</h2>
            <p className="text-text-muted max-w-md mb-4">
              {genre
                ? `Tidak ditemukan film untuk genre "${genre}".`
                : "Daftar film saat ini belum tersedia. Silakan cek kembali beberapa saat lagi."}
            </p>
            {currentPage > 1 && (
              <Pagination
                currentPage={currentPage}
                hasNextPage={false}
                totalPages={totalPages}
                baseUrl="/movies"
                searchParams={{ genre }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
