export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SafeImage } from "@/components/ui/safe-image";
import { Pagination } from "@/components/ui/pagination";
import { getArticles } from "@/lib/articles";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Newspaper } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export const metadata: Metadata = {
  title: "Artikel & Berita Film Terbaru - XStream21",
  description: "Baca artikel berita, review, sinopsis, dan rekomendasi film terbaru hanya di XStream21.",
  alternates: {
    canonical: `${SITE_URL}/artikel`,
  },
  openGraph: {
    title: "Artikel & Berita Film Terbaru - XStream21",
    description: "Baca artikel berita, review, sinopsis, dan rekomendasi film terbaru hanya di XStream21.",
    url: `${SITE_URL}/artikel`,
    siteName: "XStream21",
    locale: "id_ID",
    type: "website",
  },
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
      name: "Artikel",
      item: `${SITE_URL}/artikel`,
    },
  ],
};

async function getArticlesTotalCount(): Promise<number> {
  try {
    const { count } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "Published");
    return count || 0;
  } catch {
    return 0;
  }
}

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  // Fetch range using exact range parameters for 10 items
  const from = (currentPage - 1) * ITEMS_PER_PAGE;

  const [articles, totalCount] = await Promise.all([
    getArticles({
      status: "Published",
      limit: ITEMS_PER_PAGE,
      offset: from,
    }).catch(() => []),
    getArticlesTotalCount(),
  ]);

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / ITEMS_PER_PAGE) : 1;
  const hasNextPage = currentPage < totalPages;

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Artikel" }]} />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">Artikel XStream21</h1>
            <p className="text-text-muted">Baca review, sinopsis, dan update berita terbaru seputar film & movie terbaru.</p>
          </div>
        </div>

        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4 sm:gap-6 w-full max-w-full">
              {articles.map((article) => (
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

            <Pagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              totalPages={totalPages}
              baseUrl="/artikel"
            />
          </>
        ) : (
          <div className="min-h-[40vh] flex flex-col items-center justify-center p-4 text-center border border-dashed border-border-dark rounded-2xl">
            <Newspaper className="w-16 h-16 text-text-muted mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-text-main mb-2">Belum ada Artikel</h2>
            <p className="text-text-muted max-w-md mb-4">
              Daftar artikel saat ini belum tersedia. Silakan cek kembali beberapa saat lagi.
            </p>
            {currentPage > 1 && (
              <Pagination
                currentPage={currentPage}
                hasNextPage={false}
                totalPages={totalPages}
                baseUrl="/artikel"
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
