export const revalidate = 0; // 12 Hours ISR Caching

import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getArticles } from "@/lib/articles";
import { getMovies } from "@/lib/movies";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  let articleEntries: MetadataRoute.Sitemap = [];
  let movieEntries: MetadataRoute.Sitemap = [];

  // Fetch articles and movies concurrently
  let publishedArticles: Awaited<ReturnType<typeof getArticles>> = [];
  let publishedMovies: Awaited<ReturnType<typeof getMovies>> = [];

  try {
    const [articles, movies] = await Promise.all([
      getArticles({ status: "Published" }).catch((err) => {
        console.error("Error fetching articles for sitemap:", err);
        return [];
      }),
      getMovies({ status: "Published" }).catch((err) => {
        console.error("Error fetching movies for sitemap:", err);
        return [];
      }),
    ]);

    publishedArticles = articles || [];
    publishedMovies = movies || [];
  } catch (error) {
    console.error("Error running concurrent sitemap queries:", error);
  }

  // 1. Articles - Strictly Published only
  try {
    articleEntries = (publishedArticles || [])
      .filter((article) => article.status === "Published" && (article.slug || article.id))
      .map((article) => {
        const slug = encodeURIComponent(article.slug || article.id);
        const lastMod = article.updatedAt
          ? new Date(article.updatedAt)
          : article.publishedAt
          ? new Date(article.publishedAt)
          : new Date();

        return {
          url: `${baseUrl}/artikel/${slug}`,
          lastModified: isNaN(lastMod.getTime()) ? new Date() : lastMod,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
      });
  } catch (error) {
    console.error("Error formatting articles for sitemap:", error);
  }

  // 2. Movies - Strictly Published only
  try {
    movieEntries = (publishedMovies || [])
      .filter((m) => m.status === "Published" && (m.slug || m.id))
      .map((movie) => {
        const slug = encodeURIComponent(movie.slug || movie.id);
        const lastMod = movie.updatedAt
          ? new Date(movie.updatedAt)
          : movie.createdAt
          ? new Date(movie.createdAt)
          : new Date();

        return {
          url: `${baseUrl}/movies/${slug}`,
          lastModified: isNaN(lastMod.getTime()) ? new Date() : lastMod,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });
  } catch (error) {
    console.error("Error formatting movies for sitemap:", error);
  }

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artikel`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const allEntries = [
    ...staticRoutes,
    ...movieEntries,
    ...articleEntries,
  ];

  // Strictly deduplicate by URL
  const seenUrls = new Set<string>();
  const uniqueEntries: MetadataRoute.Sitemap = [];

  for (const entry of allEntries) {
    if (!seenUrls.has(entry.url)) {
      seenUrls.add(entry.url);
      uniqueEntries.push(entry);
    }
  }

  return uniqueEntries;
}
