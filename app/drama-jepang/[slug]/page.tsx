export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { getUnifiedContentBySlug, getRelatedUnifiedContent } from "@/lib/content-adapter";
import { notFound, redirect } from "next/navigation";
import { UnifiedContentDetailPage } from "@/components/content/unified-content-detail-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getUnifiedContentBySlug(slug, "Drama Jepang");

  if (!content) {
    return {
      title: "Drama Jepang Not Found - XStream21",
      alternates: {
        canonical: `${SITE_URL}/drama-jepang/${slug}`,
      },
    };
  }

  // Prioritize Admin-provided SEO Title & Description if present
  const title = content.seoTitle?.trim()
    ? content.seoTitle.trim()
    : `Nonton ${content.title} Sub Indo - XStream21`;

  const description = content.seoDescription?.trim()
    ? content.seoDescription.trim()
    : content.synopsis?.slice(0, 160) ||
      `Streaming & download drama Jepang ${content.title} (${content.year || ""}) subtitle Indonesia terlengkap kualitas HD di XStream21.`;

  const canonicalUrl = `${SITE_URL}/drama-jepang/${content.slug || slug}`;
  const landscapeImage = content.imageUrl || `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    keywords: content.seoKeywords ? content.seoKeywords.split(",").map((k) => k.trim()) : undefined,
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
          url: landscapeImage,
          width: 1280,
          height: 720,
          alt: content.title,
        },
      ],
      locale: "id_ID",
      type: content.isSeries ? "video.tv_show" : "video.movie",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [landscapeImage],
    },
  };
}

export default async function DramaJepangDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getUnifiedContentBySlug(slug, "Drama Jepang");

  if (!content) {
    notFound();
  }

  const isInvalidStatus = content.isSeries
    ? content.status === "Draft"
    : content.status && content.status !== "Published";

  if (isInvalidStatus) {
    notFound();
  }

  // Cross-category redirection: if an Anime item is accessed via /drama-jepang, route cleanly
  if (content.category === "Anime") {
    redirect(`/anime/${content.slug || slug}`);
  }

  const relatedContent = await getRelatedUnifiedContent(content, 4);

  return (
    <UnifiedContentDetailPage
      content={content}
      relatedContent={relatedContent}
    />
  );
}
