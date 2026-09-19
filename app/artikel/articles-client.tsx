"use client";

import { useState, useEffect } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { Article } from "@/types/article";
import { getArticles } from "@/lib/articles";
import { Loader2 } from "lucide-react";

export function ArticlesClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const INITIAL_LIMIT = 10;

  useEffect(() => {
    let isMounted = true;
    getArticles({
      status: "Published",
      limit: INITIAL_LIMIT,
      offset: 0,
    })
      .then((data) => {
        if (isMounted) {
          setArticles(data.slice(0, 10));
          setOffset(data.length);
          if (data.length < INITIAL_LIMIT) {
            setHasMore(false);
          }
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextBatch = await getArticles({
        status: "Published",
        limit: 6,
        offset,
      });

      setArticles((prev) => [...prev, ...nextBatch]);
      setOffset((prev) => prev + nextBatch.length);

      if (nextBatch.length < 6) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more articles:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "";
    try {
      let date: Date;
      const t = timestamp as { toDate?: () => Date; toMillis?: () => number; seconds?: number };
      if (typeof t?.toDate === "function") {
        date = t.toDate();
      } else if (typeof t?.toMillis === "function") {
        date = new Date(t.toMillis());
      } else if (typeof t?.seconds === "number") {
        date = new Date(t.seconds * 1000);
      } else {
        date = new Date(timestamp as string | number);
      }
      return isNaN(date.getTime())
        ? ""
        : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-blue animate-spin mb-4" />
        <p className="text-text-muted">Memuat artikel...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-4 text-center border border-dashed border-border-dark rounded-2xl mb-12">
        <h2 className="text-2xl font-bold text-text-main mb-2">Belum ada artikel</h2>
        <p className="text-text-muted max-w-md">
          Artikel saat ini belum tersedia. Silakan kembali lagi nanti.
        </p>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <>
      <div className="space-y-8">
        {/* Featured Article */}
        {featuredArticle && (
          <Link
            prefetch={false}
            href={`/artikel/${featuredArticle.slug || featuredArticle.id}`}
            className="group relative block w-full rounded-2xl overflow-hidden border border-border-dark bg-card-dark transition-all duration-300 hover:shadow-2xl hover:shadow-primary-blue/10"
          >
            <div className="relative aspect-[21/9] w-full overflow-hidden">
              <SafeImage
                src={featuredArticle.bannerUrl || featuredArticle.thumbnailUrl || ""}
                alt={featuredArticle.title || "Featured article"}
                type="banner"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                <div className="flex items-center gap-3 text-sm text-text-muted-hover mb-3">
                  <span className="px-3 py-1 bg-primary-blue text-white rounded-full font-medium">
                    {featuredArticle.category}
                  </span>
                  <span>•</span>
                  <span>{formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-text-main group-hover:text-primary-blue transition-colors mb-3 leading-tight max-w-4xl">
                  {featuredArticle.title}
                </h2>
                <p className="text-text-muted-hover text-sm md:text-base max-w-3xl line-clamp-2">
                  {featuredArticle.excerpt}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Remaining Articles (Landscape cards in responsive grid) */}
        {remainingArticles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {remainingArticles.map((article) => (
              <Link
                prefetch={false}
                key={article.id}
                href={`/artikel/${article.slug || article.id}`}
                className="group flex flex-col bg-card-dark rounded-xl overflow-hidden border border-border-dark hover:border-primary-blue transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-blue/10"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gray-900/50 shrink-0">
                  <SafeImage
                    src={article.thumbnailUrl || article.bannerUrl || ""}
                    alt={article.title}
                    type="thumbnail"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-text-muted mb-1.5">
                      <span className="text-primary-blue font-medium">{article.category}</span>
                      <span>•</span>
                      <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm text-text-main group-hover:text-primary-blue transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-card-dark hover:bg-card-dark/80 border border-border-dark hover:border-primary-blue text-text-main rounded-xl font-medium transition-all text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
          </button>
        </div>
      )}
    </>
  );
}
