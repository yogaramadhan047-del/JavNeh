export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArticleDetailBanner } from "@/components/ads/placements";
import { Calendar, Clock, Eye, Heart, Tag } from "lucide-react";
import { getArticleBySlugOrId, getRelatedArticles } from "@/lib/articles";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlugOrId(slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan - XStream21",
      alternates: { canonical: `${SITE_URL}/artikel/${slug}` },
    };
  }

  // Strictly prioritize Admin-provided SEO Title & Description
  const title = article.seoTitle?.trim()
    ? article.seoTitle.trim()
    : `${article.title} - XStream21`;

  const description = article.seoDescription?.trim()
    ? article.seoDescription.trim()
    : article.excerpt?.slice(0, 160) || "Baca ulasan, rekomendasi, dan berita anime & drama Jepang terbaru di XStream21.";

  const bannerImage = article.bannerUrl || article.thumbnailUrl || `${SITE_URL}/og-image.jpg`;
  const canonicalUrl = `${SITE_URL}/artikel/${article.slug || slug}`;

  return {
    title,
    description,
    keywords: article.seoKeywords?.trim()
      ? article.seoKeywords.split(",").map((k) => k.trim())
      : article.tags && article.tags.length > 0
      ? article.tags
      : undefined,
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
          url: bannerImage,
          width: 1280,
          height: 720,
          alt: article.title,
        },
      ],
      locale: "id_ID",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [bannerImage],
    },
  };
}

export default async function ArtikelDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlugOrId(slug);
  if (!article || (article.status && article.status !== "Published")) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(slug, false, article.category, 6);

  const parseDate = (timestamp: unknown) => {
    if (!timestamp) return new Date();
    try {
      const t = timestamp as { toDate?: () => Date; toMillis?: () => number; seconds?: number };
      if (typeof t?.toDate === "function") return t.toDate();
      if (typeof t?.toMillis === "function") return new Date(t.toMillis());
      if (typeof t?.seconds === "number") return new Date(t.seconds * 1000);
      const d = new Date(timestamp as string | number);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  };

  const publishedDate = parseDate(article.publishedAt || article.createdAt);
  const updatedDate = parseDate(article.updatedAt || article.publishedAt);

  // Schema.org Article Structured Data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seoTitle || article.title,
    image: [article.bannerUrl || article.thumbnailUrl || ""],
    datePublished: publishedDate.toISOString(),
    dateModified: updatedDate.toISOString(),
    articleSection: article.category,
    keywords: article.seoKeywords || article.tags?.join(", "),
    author: [
      {
        "@type": "Person",
        name: article.author || "Admin",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "XStream21",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.ico`,
      },
    },
    description: article.seoDescription || article.excerpt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/artikel/${article.slug || slug}`,
    },
  };

  // Schema.org BreadcrumbList Structured Data
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
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/artikel/${article.slug || slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen pb-12 bg-background-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]) }}
      />
      <div className="relative w-full h-[40vh] md:h-[60vh] lg:h-[70vh] bg-black">
        <SafeImage
          src={article.bannerUrl || article.thumbnailUrl || ""}
          alt={article.title}
          type="banner"
          fill
          className="object-cover opacity-50"
          priority
          referrerPolicy="no-referrer"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-24">
            <div className="mb-6">
              <Breadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Artikel", href: "/artikel" },
                  { label: article.title },
                ]}
              />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-blue text-white rounded-full font-medium text-sm">
                {article.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-text-muted-hover">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{article.author.charAt(0)}</span>
                </div>
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {publishedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.readingTime || 3} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <ArticleDetailBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-primary-blue hover:prose-a:underline prose-img:rounded-xl">
              <Markdown>{article.content}</Markdown>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 border-t border-border-dark flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-text-muted flex items-center gap-1 mr-2">
                  <Tag className="w-4 h-4" /> Tags:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-card-dark border border-border-dark text-text-muted-hover hover:text-white rounded-lg text-xs transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-card-dark rounded-2xl border border-border-dark p-6">
              <h3 className="text-lg font-bold text-white mb-4">Statistik Artikel</h3>
              <div className="flex items-center justify-between py-2 border-b border-border-dark/50">
                <span className="flex items-center gap-2 text-sm text-text-muted">
                  <Eye className="w-4 h-4" /> Views
                </span>
                <span className="text-sm font-bold text-white">{article.views || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-sm text-text-muted">
                  <Heart className="w-4 h-4" /> Likes
                </span>
                <span className="text-sm font-bold text-white">{article.likes || 0}</span>
              </div>
            </div>

            <div className="bg-card-dark rounded-2xl border border-border-dark p-6">
              <h3 className="text-lg font-bold text-white mb-4">Artikel Terkait</h3>
              <div className="space-y-4">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map((rel) => {
                    const relDate = parseDate(rel.publishedAt || rel.createdAt);
                    return (
                      <Link
                        prefetch={false}
                        key={rel.id}
                        href={`/artikel/${rel.slug || rel.id}`}
                        className="group flex gap-3 items-center"
                      >
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0 bg-background-dark border border-border-dark">
                          <SafeImage
                            src={rel.thumbnailUrl || rel.bannerUrl || ""}
                            alt={rel.title}
                            type="thumbnail"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-text-main group-hover:text-primary-blue line-clamp-2 transition-colors">
                            {rel.title}
                          </h4>
                          <span className="text-[10px] text-text-muted mt-1 block">
                            {relDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-xs text-text-muted">Tidak ada artikel terkait.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
