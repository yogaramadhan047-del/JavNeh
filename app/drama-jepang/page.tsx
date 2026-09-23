export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { GenreScrollRow } from "@/components/ui/genre-scroll-row";
import { MovieCard } from "@/components/ui/movie-card";
import { getMovies, getGenres } from "@/lib/movies";
import { getSeriesList } from "@/lib/series";
import { Tv } from "lucide-react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}): Promise<Metadata> {
  const { genre } = await searchParams;
  const title = genre
    ? `Nonton Drama Jepang (Dorama) Genre ${genre} Subtitle Indonesia - XStream21`
    : "Nonton Drama Jepang (Dorama) Subtitle Indonesia Terbaru - XStream21";
  const description = genre
    ? `Streaming & download Drama Jepang (Dorama) genre ${genre} subtitle Indonesia terlengkap dan terupdate gratis di XStream21.`
    : "Koleksi Drama Jepang (Dorama) & Japanese TV Series subtitle Indonesia terlengkap dari berbagai genre terupdate di XStream21.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/drama-jepang${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/drama-jepang${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`,
      siteName: "XStream21",
      locale: "id_ID",
      type: "website",
    },
  };
}

export default async function DramaJepangPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre } = await searchParams;

  // Fetch genres and strictly filtered Drama Jepang (maximum 10 items)
  // Query Supabase with .eq('category', 'Drama Jepang'). Anime MUST NOT appear here.
  const [genres, dramaMovies, dramaSeries] = await Promise.all([
    getGenres(),
    getMovies({ genre, status: "Published", category: "Drama Jepang", limit: 20 }).catch(() => []),
    getSeriesList({ genre, status: "Published", category: "Drama Jepang", limit: 20 }).catch(() => []),
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

  // Exact maximum of 10 items
  const displayItems = uniqueItems.slice(0, 10);

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
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayItems.map((item) => (
              <MovieCard
                key={item.id}
                movie={item}
                baseUrl="/drama-jepang"
              />
            ))}
          </div>
        ) : (
          <div className="min-h-[40vh] flex flex-col items-center justify-center p-4 text-center border border-dashed border-border-dark rounded-2xl">
            <Tv className="w-16 h-16 text-text-muted mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-text-main mb-2">Belum ada Drama Jepang</h2>
            <p className="text-text-muted max-w-md">
              {genre
                ? `Tidak ditemukan drama Jepang untuk genre "${genre}".`
                : "Daftar drama Jepang saat ini belum tersedia. Silakan cek kembali beberapa saat lagi."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
