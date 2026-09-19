export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MovieCard } from "@/components/ui/movie-card";
import { GenreScrollRow } from "@/components/ui/genre-scroll-row";
import { getMovies, getGenres } from "@/lib/movies";
import { getSeriesList } from "@/lib/series";
import { Film } from "lucide-react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}): Promise<Metadata> {
  const { genre } = await searchParams;
  const title = genre
    ? `Nonton Anime Genre ${genre} Subtitle Indonesia - XStream21`
    : "Nonton Anime Subtitle Indonesia Terbaru - XStream21";
  const description = genre
    ? `Streaming & download anime genre ${genre} subtitle Indonesia terlengkap dan terupdate gratis di XStream21.`
    : "Koleksi anime subtitle Indonesia terlengkap dari berbagai genre, movie anime, dan serial anime terupdate di XStream21.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/anime${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/anime${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`,
      siteName: "XStream21",
      locale: "id_ID",
      type: "website",
    },
  };
}

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre } = await searchParams;

  // Fetch genres and strictly filtered Anime (maximum 10 items)
  // Query Supabase with .eq('category', 'Anime'). Drama Jepang MUST NOT appear here.
  const [genres, animeMovies, animeSeries] = await Promise.all([
    getGenres(),
    getMovies({ genre, status: "Published", category: "Anime", limit: 10 }),
    getSeriesList({ status: "Published", category: "Anime", limit: 10 }).catch(() => []),
  ]);

  // Combine and strictly enforce category filter
  const combined = [
    ...animeMovies.map((m) => ({ ...m, isSeries: false })),
    ...animeSeries.map((s) => ({ ...s, isSeries: true })),
  ].filter((item) => item.category === "Anime");

  // Sort by newest createdAt
  combined.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  // Exact maximum of 10 items
  const displayAnime = combined.slice(0, 10);

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
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayAnime.map((anime) => (
              <MovieCard key={anime.id} movie={anime} baseUrl="/anime" />
            ))}
          </div>
        ) : (
          <div className="min-h-[40vh] flex flex-col items-center justify-center p-4 text-center border border-dashed border-border-dark rounded-2xl">
            <Film className="w-16 h-16 text-text-muted mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-text-main mb-2">Belum ada Anime</h2>
            <p className="text-text-muted max-w-md">
              {genre
                ? `Tidak ditemukan anime untuk genre "${genre}".`
                : "Daftar anime saat ini belum tersedia. Silakan cek kembali beberapa saat lagi."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
