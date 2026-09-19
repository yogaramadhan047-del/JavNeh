"use client";

import { Search, X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { getArticles } from "@/lib/articles";
import { Article } from "@/types/article";

export function HeroSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Article[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSearch() {
      if (debouncedQuery.trim().length > 0) {
        setIsSearching(true);
        setShowResults(true);
        try {
          const articles = await getArticles({
            search: debouncedQuery.trim(),
            status: "Published",
            limit: 5,
          });
          setResults(articles);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }
    fetchSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative py-8 lg:py-14 w-full flex flex-col items-center justify-center z-10">
      <div className="relative max-w-4xl mx-auto px-4 text-center z-10 flex flex-col items-center w-full">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-text-main">
          Mau nonton apa lu hari ini?{" "}
          <span className="text-primary-blue block mt-2 text-3xl md:text-4xl">
            Pilih sendiri, kaga usah REPOT!
          </span>
        </h1>

        <div className="w-full max-w-2xl relative mt-8" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5 group-focus-within:text-primary-blue transition-colors" />
            <input
              type="text"
              placeholder="Cari anime, drama, artikel..."
              className="w-full pl-12 sm:pl-14 pr-24 py-4 sm:py-5 text-base sm:text-lg rounded-full shadow-lg border border-border-dark bg-card-dark/80 backdrop-blur focus-visible:ring-2 focus-visible:ring-primary-blue outline-none transition-all text-text-main"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setShowResults(true);
              }}
              aria-label="Search articles"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setResults([]);
                  setShowResults(false);
                }}
                className="absolute right-[85px] sm:right-28 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-2 cursor-pointer"
                aria-label="Clear search"
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

          {/* Autocomplete Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card-dark border border-border-dark rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              {isSearching ? (
                <div className="p-6 flex justify-center text-text-muted">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <ul className="max-h-[300px] overflow-y-auto text-left">
                  {results.map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/artikel/${article.slug || article.id}`}
                        className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors border-b border-border-dark last:border-0 group focus-visible:bg-white/10 outline-none"
                        onClick={() => setShowResults(false)}
                      >
                        <div className="relative w-16 h-12 shrink-0 bg-gray-800 rounded overflow-hidden">
                          {article.thumbnailUrl && (
                            <SafeImage
                              src={article.thumbnailUrl}
                              alt={article.title}
                              type="thumbnail"
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-text-main truncate group-hover:text-primary-blue transition-colors">
                            {article.title}
                          </h4>
                          <div className="text-xs text-text-muted flex items-center gap-2 mt-1">
                            <span className="text-primary-blue">{article.category}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={handleSearch}
                      className="w-full p-4 text-sm text-primary-blue hover:text-white bg-primary-blue/5 hover:bg-primary-blue/10 transition-colors font-medium focus-visible:bg-primary-blue/20 outline-none cursor-pointer"
                    >
                      Lihat semua hasil pencarian &quot;{searchQuery}&quot;
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-text-muted text-sm">Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
