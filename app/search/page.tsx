"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Search as SearchIcon, FileQuestion, X, Loader2 } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import { getArticles } from "@/lib/articles";
import { getMovies } from "@/lib/movies";
import { Article } from "@/types/article";
import { Movie } from "@/types/movie";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { MovieCard } from "@/components/ui/movie-card";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(q);
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!q);

  useEffect(() => {
    async function fetchSearch() {
      if (q.trim()) {
        setIsLoading(true);
        setHasSearched(true);
        try {
          const [fetchedArticles, fetchedMovies] = await Promise.all([
            getArticles({
              search: q.trim(),
              status: "Published",
              limit: 24,
            }).catch((err) => {
              console.error("Articles search error:", err);
              return [] as Article[];
            }),
            getMovies({
              search: q.trim(),
              status: "Published",
              limit: 24,
            }).catch((err) => {
              console.error("Movies search error:", err);
              return [] as Movie[];
            }),
          ]);
          setArticles(fetchedArticles || []);
          setMovies(fetchedMovies || []);
        } catch (error) {
          console.error("Search error:", error);
          setArticles([]);
          setMovies([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setArticles([]);
        setMovies([]);
        setHasSearched(false);
      }
    }
    fetchSearch();
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalResultsCount = movies.length + articles.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search Results" }]} />
      
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12 group">
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5 group-focus-within:text-primary-blue transition-colors" />
        <input
          type="text"
          placeholder="Cari movie, artikel..."
          className="w-full pl-12 sm:pl-14 pr-24 py-4 sm:py-5 text-base sm:text-lg rounded-full shadow-lg border border-border-dark bg-card-dark focus-visible:ring-2 focus-visible:ring-primary-blue outline-none transition-all text-text-main"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
            }}
            className="absolute right-[85px] sm:right-28 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-2 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-blue hover:bg-primary-blue-hover text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white text-sm sm:text-base cursor-pointer"
        >
          Search
        </button>
      </form>

      {hasSearched && !isLoading && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main mb-2">
            Hasil Pencarian: <span className="text-primary-blue">&quot;{q}&quot;</span>
          </h1>
          <p className="text-text-muted">Menemukan {totalResultsCount} hasil</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-blue" />
        </div>
      ) : totalResultsCount > 0 ? (
        <div className="space-y-12">
          {/* Movies Results Grid */}
          {movies.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2 border-b border-border-dark pb-3">
                Film & Movie Ditemukan ({movies.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4 sm:gap-6">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} baseUrl="/movies" />
                ))}
              </div>
            </div>
          )}

          {/* Articles Results Grid */}
          {articles.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2 border-b border-border-dark pb-3">
                Artikel Terbaru ({articles.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map((article) => (
                  <Link
                    prefetch={false}
                    key={article.id}
                    href={`/artikel/${article.slug || article.id}`}
                    className="group block bg-card-dark rounded-xl overflow-hidden border border-border-dark hover:border-primary-blue transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-blue/10"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      <SafeImage
                        src={article.thumbnailUrl || ""}
                        alt={article.title}
                        type="thumbnail"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                        <span className="text-primary-blue font-medium">{article.category}</span>
                        <span>•</span>
                        <span>
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : ""}
                        </span>
                      </div>
                      <h3 className="font-bold text-text-main group-hover:text-primary-blue transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : hasSearched ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-4 text-center">
          <FileQuestion className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-text-main mb-2">Tidak ada hasil ditemukan</h2>
          <p className="text-text-muted max-w-md">
            Kami tidak dapat menemukan film atau artikel yang cocok dengan &quot;{q}&quot;. Silakan coba kata kunci lain.
          </p>
        </div>
      ) : (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 bg-card-dark rounded-full flex items-center justify-center mb-6 shadow-lg border border-border-dark">
            <SearchIcon className="w-10 h-10 text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-2">Mulai Pencarian</h2>
          <p className="text-text-muted max-w-md">
            Ketikkan kata kunci di kolom pencarian di atas untuk menemukan film atau artikel favorit Anda.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <SearchContent />
    </Suspense>
  );
}
