import { Movie, MovieServer } from "@/types/movie";
import { UnifiedContent, UnifiedServer, ContentCategory } from "@/types/content";
import { normalizeEmbedUrl } from "./embed";
import { getMovieBySlugOrId, getMovies } from "./movies";

/**
 * Adapts a Movie DB record into the application-level UnifiedContent model.
 */
export function adaptMovieToUnifiedContent(movie: Movie): UnifiedContent {
  const downloadUrl =
    movie.downloadUrl ||
    movie.realDownloadUrl ||
    "";

  const servers: UnifiedServer[] = (movie.servers || []).map((s: MovieServer, idx: number) => {
    const rawUrl = s.url || s.embedUrl || "";
    const cleanUrl = normalizeEmbedUrl(rawUrl);
    return {
      id: s.id || `srv-${idx}`,
      name: s.name || `Server ${idx + 1}`,
      url: cleanUrl,
      embedUrl: cleanUrl,
      quality: s.quality || "1080p",
      subtitle: s.subtitle || "Indonesia",
      isDefault: s.isDefault ?? idx === 0,
    };
  });

  const bannerUrl = movie.bannerUrl || movie.posterUrl || "";
  const posterUrl = movie.posterUrl || movie.bannerUrl || "";

  return {
    id: movie.id,
    category: movie.category,
    title: movie.title,
    originalTitle: movie.originalTitle,
    slug: movie.slug,
    synopsis: movie.synopsis || "",
    year: movie.year || new Date().getFullYear(),
    releaseDate: movie.releaseDate,
    rating: movie.rating || movie.imdb || 0,
    imdb: movie.imdb || 0,
    genres: Array.isArray(movie.genres) ? movie.genres : [],
    tags: Array.isArray(movie.tags) ? movie.tags : [],
    country: movie.country || "Japan",
    language: movie.language || "Japanese",
    duration: movie.duration,
    subtitle: movie.subtitle || "Indonesia",
    studio: movie.studio,
    imageUrl: bannerUrl || posterUrl,
    bannerUrl,
    posterUrl,
    banner_url: bannerUrl,
    poster_url: posterUrl,
    badge: movie.badge || "",
    resolution: movie.resolution || "1080p",
    status: movie.status || "Published",
    views: movie.views || 0,
    streamingUrl: servers[0]?.url || "",
    downloadUrl,
    trapDownloadUrl: movie.trapDownloadUrl || "",
    realDownloadUrl: movie.realDownloadUrl || downloadUrl,
    trailerUrl: movie.trailerUrl ? normalizeEmbedUrl(movie.trailerUrl) : undefined,
    servers,
    episodes: [],
    totalEpisodes: 1,
    totalSeasons: 1,
    isSeries: false,
    type: "movie",
    seoTitle: movie.seoTitle,
    seoDescription: movie.seoDescription,
    seoKeywords: movie.seoKeywords,
    createdAt: movie.createdAt,
    updatedAt: movie.updatedAt,
  };
}

/**
 * Fetches and normalizes a piece of content by slug across movies table.
 */
export async function getUnifiedContentBySlug(
  slug: string,
  _preferredCategory?: ContentCategory
): Promise<UnifiedContent | null> {
  const movie = await getMovieBySlugOrId(slug).catch(() => null);

  if (!movie) {
    return null;
  }

  return adaptMovieToUnifiedContent(movie);
}

/**
 * Fetches related unified content for recommendations grid.
 */
export async function getRelatedUnifiedContent(
  content: UnifiedContent,
  limit: number = 4
): Promise<UnifiedContent[]> {
  try {
    const movies = await getMovies({ status: "Published", limit: limit + 2 }).catch(() => []);

    const unified: UnifiedContent[] = movies.map(adaptMovieToUnifiedContent);

    // Filter out current content and deduplicate by id
    const seen = new Set<string>();
    const filtered: UnifiedContent[] = [];

    for (const item of unified) {
      if (item.id !== content.id && !seen.has(item.id)) {
        seen.add(item.id);
        filtered.push(item);
      }
    }

    return filtered.slice(0, limit);
  } catch (err) {
    console.error("Error fetching related unified content:", err);
    return [];
  }
}
