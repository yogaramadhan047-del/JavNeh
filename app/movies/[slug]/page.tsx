import { notFound } from "next/navigation";
import { getUnifiedContentBySlug, getRelatedUnifiedContent } from "@/lib/content-adapter";
import { UnifiedContentDetailPage } from "@/components/content/unified-content-detail-page";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 0; // 12 Hours ISR Caching

interface MovieDetailPageProps {
  params: Promise<{ slug: string }>;
}


export async function generateMetadata({
  params,
}: MovieDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getUnifiedContentBySlug(slug);

  if (!content) {
    return {
      title: "Konten Tidak Ditemukan | JavNeh",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const cleanText = (value: string) =>
    value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const contentTitle = cleanText(content.title || "Konten");
  const title = cleanText(content.seoTitle || `${contentTitle} | JavNeh`);

  const rawDescription = content.seoDescription?.trim() || "";
  const description = cleanText(rawDescription).slice(0, 160);

  const canonical = `${SITE_URL.replace(/\/$/, "")}/movies/${encodeURIComponent(
    content.slug
  )}`;

  const image =
    content.imageUrl || `${SITE_URL.replace(/\/$/, "")}/og-image.jpg`;

  const keywords = content.seoKeywords
    ? content.seoKeywords
        .split(",")
        .map((keyword: string) => keyword.trim())
        .filter(Boolean)
    : [contentTitle, "JavNeh"];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "JavNeh",
      locale: "id_ID",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: contentTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}



export default async function MovieDetailPage({
  params,
}: MovieDetailPageProps) {
  const { slug } = await params;
  const content = await getUnifiedContentBySlug(slug);

  if (!content) {
    notFound();
  }

  const relatedContent = await getRelatedUnifiedContent(content, 4);

  return (
    <UnifiedContentDetailPage
      content={content}
      relatedContent={relatedContent}
    />
  );
}
