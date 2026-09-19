export const revalidate = 43200; // 12 Hours ISR Caching

import { SITE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArticlesClient } from "./articles-client";

export const metadata: Metadata = {
  title: "Artikel & Berita Anime & Drama Jepang - XStream21",
  description: "Baca artikel berita, review, sinopsis, dan rekomendasi anime serta drama Jepang terbaru hanya di XStream21.",
  alternates: {
    canonical: `${SITE_URL}/artikel`,
  },
  openGraph: {
    title: "Artikel & Berita Anime & Drama Jepang - XStream21",
    description: "Baca artikel berita, review, sinopsis, dan rekomendasi anime serta drama Jepang terbaru hanya di XStream21.",
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

export default function ArtikelPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Artikel" }]} />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">Artikel XStream21</h1>
            <p className="text-text-muted">Baca review, sinopsis, dan update berita terbaru seputar anime & drama Jepang.</p>
          </div>
        </div>
        <ArticlesClient />
        <div className="mt-12"></div>
      </div>
    </>
  );
}
