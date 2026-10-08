import { notFound } from "next/navigation";
import { getUnifiedContentBySlug, getRelatedUnifiedContent } from "@/lib/content-adapter";
import { UnifiedContentDetailPage } from "@/components/content/unified-content-detail-page";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 43200; // 12 Hours ISR Caching

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
      title: "Movie Tidak Ditemukan - JavNeh",
    };
  }

  const title = `${content.seoTitle || `Nonton ${content.title} Sub Indo Terbaru`} - JavNeh`;
  const description = content.seoDescription || content.synopsis?.slice(0, 160) || `Streaming & download film ${content.title} subtitle Indonesia kualitas HD gratis di JavNeh.`;

  return {
    title,
    description,
    keywords: content.seoKeywords || `${content.title}, nonton ${content.title}, download ${content.title}, sub indo`,
    alternates: {
      canonical: `${SITE_URL}/movies/${content.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/movies/${content.slug}`,
      siteName: "JavNeh",
      images: [
        {
          url: content.imageUrl || `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: content.title,
        },
      ],
      locale: "id_ID",
      type: "video.movie",
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
