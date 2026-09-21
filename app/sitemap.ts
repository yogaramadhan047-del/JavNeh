export const revalidate = 43200; // 12 Hours ISR Caching

import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getArticles } from "@/lib/articles";
import { getMovies } from "@/lib/movies";
import { getSeriesList } from "@/lib/series";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  let articleEntries: MetadataRoute.Sitemap = [];
  let animeMovieEntries: MetadataRoute.Sitemap = [];
  let animeSeriesEntries: MetadataRoute.Sitemap = [];
  let dramaMovieEntries: MetadataRoute.Sitemap = [];
  let dramaSeriesEntries: MetadataRoute.Sitemap = [];

  // Fetch all 5 content sets concurrently to maximize performance and avoid cold-start timeouts
  let publishedArticles: Awaited<ReturnType<typeof getArticles>> = [];
  let publishedAnimeMovies: Awaited<ReturnType<typeof getMovies>> = [];
  let publishedDramaMovies: Awaited<ReturnType<typeof getMovies>> = [];
  let publishedAnimeSeries: Awaited<ReturnType<typeof getSeriesList>> = [];
  let publishedDramaSeries: Awaited<ReturnType<typeof getSeriesList>> = [];

  try {
    const [articles, animeMovies, dramaMovies, animeSeries, dramaSeries] = await Promise.all([
      getArticles({ status: "Published" }).catch((err) => {
        console.error("Error fetching articles for sitemap:", err);
        return [];
      }),
      getMovies({ status: "Published", category: "Anime" }).catch((err) => {
        console.error("Error fetching anime movies for sitemap:", err);
        return [];
      }),
      getMovies({ status: "Published", category: "Drama Jepang" }).catch((err) => {
        console.error("Error fetching drama movies for sitemap:", err);
        return [];
      }),
      getSeriesList({ status: "Published", category: "Anime" }).catch((err) => {
        console.error("Error fetching anime series for sitemap:", err);
        return [];
      }),
      getSeriesList({ status: "Published", category: "Drama Jepang" }).catch((err) => {
        console.error("Error fetching drama series for sitemap:", err);
        return [];
      }),
    ]);

    publishedArticles = articles || [];
    publishedAnimeMovies = animeMovies || [];
    publishedDramaMovies = dramaMovies || [];
    publishedAnimeSeries = animeSeries || [];
    publishedDramaSeries = dramaSeries || [];
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

  // 2. Movies (Anime & Drama Jepang) - Strictly Published only
  try {
    animeMovieEntries = (publishedAnimeMovies || [])
      .filter((m) => m.status === "Published" && (m.slug || m.id))
      .map((movie) => {
        const slug = encodeURIComponent(movie.slug || movie.id);
        const lastMod = movie.updatedAt
          ? new Date(movie.updatedAt)
          : movie.createdAt
          ? new Date(movie.createdAt)
          : new Date();

        return {
          url: `${baseUrl}/anime/${slug}`,
          lastModified: isNaN(lastMod.getTime()) ? new Date() : lastMod,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });

    dramaMovieEntries = (publishedDramaMovies || [])
      .filter((m) => m.status === "Published" && (m.slug || m.id))
      .map((movie) => {
        const slug = encodeURIComponent(movie.slug || movie.id);
        const lastMod = movie.updatedAt
          ? new Date(movie.updatedAt)
          : movie.createdAt
          ? new Date(movie.createdAt)
          : new Date();

        return {
          url: `${baseUrl}/drama-jepang/${slug}`,
          lastModified: isNaN(lastMod.getTime()) ? new Date() : lastMod,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });
  } catch (error) {
    console.error("Error formatting movies for sitemap:", error);
  }

  // 3. Series (Anime & Drama Jepang) - Strictly Published only
  try {
    animeSeriesEntries = (publishedAnimeSeries || [])
      .filter((s) => s.status === "Published" && (s.slug || s.id))
      .map((series) => {
        const slug = encodeURIComponent(series.slug || series.id);
        const lastMod = series.updatedAt
          ? new Date(series.updatedAt)
          : series.createdAt
          ? new Date(series.createdAt)
          : new Date();

        return {
          url: `${baseUrl}/anime/${slug}`,
          lastModified: isNaN(lastMod.getTime()) ? new Date() : lastMod,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });

    dramaSeriesEntries = (publishedDramaSeries || [])
      .filter((s) => s.status === "Published" && (s.slug || s.id))
      .map((series) => {
        const slug = encodeURIComponent(series.slug || series.id);
        const lastMod = series.updatedAt
          ? new Date(series.updatedAt)
          : series.createdAt
          ? new Date(series.createdAt)
          : new Date();

        return {
          url: `${baseUrl}/drama-jepang/${slug}`,
          lastModified: isNaN(lastMod.getTime()) ? new Date() : lastMod,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });
  } catch (error) {
    console.error("Error formatting series for sitemap:", error);
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
      url: `${baseUrl}/anime`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/drama-jepang`,
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
    ...animeMovieEntries,
    ...animeSeriesEntries,
    ...dramaMovieEntries,
    ...dramaSeriesEntries,
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
