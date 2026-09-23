import { Movie, MovieServer } from "@/types/movie";
import { Series, Episode, SeriesServer } from "@/types/series";
import { UnifiedContent, UnifiedServer, UnifiedEpisode, ContentCategory } from "@/types/content";
import { normalizeEmbedUrl } from "./embed";
import { getMovieBySlugOrId, getMovies } from "./movies";
import { getSeriesBySlugOrId, getSeriesList } from "./series";

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
 * Adapts a Series DB record into the application-level UnifiedContent model.
 */
export function adaptSeriesToUnifiedContent(series: Series): UnifiedContent {
  const downloadUrl =
    series.downloadUrl ||
    series.realDownloadUrl ||
    "";

  const episodes: UnifiedEpisode[] = (series.episodes || []).map((ep: Episode, epIdx: number) => {
    const epServers: UnifiedServer[] = (ep.servers || []).map((s: SeriesServer, sIdx: number) => {
      const cleanUrl = normalizeEmbedUrl(s.url);
      return {
        id: s.id || `srv-${epIdx}-${sIdx}`,
        name: s.name || `Server ${sIdx + 1}`,
        url: cleanUrl,
        embedUrl: cleanUrl,
        quality: s.quality || "1080p",
        subtitle: s.subtitle || "Indonesia",
        isDefault: s.isDefault ?? sIdx === 0,
      };
    });

    return {
      id: ep.id || `ep-${epIdx + 1}`,
      title: ep.title || `Episode ${ep.episodeNumber || epIdx + 1}`,
      episodeNumber: ep.episodeNumber || epIdx + 1,
      servers: epServers,
    };
  });

  const firstEpServers = episodes.length > 0 ? episodes[0].servers : [];
  const bannerUrl = series.bannerUrl || series.posterUrl || "";
  const posterUrl = series.posterUrl || series.bannerUrl || "";

  return {
    id: series.id,
    category: series.category,
    title: series.title,
    originalTitle: series.originalTitle,
    slug: series.slug,
    synopsis: series.synopsis || "",
    year: series.year || new Date().getFullYear(),
    releaseDate: series.releaseDate,
    rating: series.rating || series.imdb || 0,
    imdb: series.imdb || 0,
    genres: Array.isArray(series.genres) ? series.genres : [],
    tags: Array.isArray(series.tags) ? series.tags : [],
    country: series.country || "Japan",
    language: series.language || "Japanese",
    duration: series.duration,
    subtitle: series.subtitle || "Indonesia",
    studio: series.studio,
    imageUrl: bannerUrl || posterUrl,
    bannerUrl,
    posterUrl,
    banner_url: bannerUrl,
    poster_url: posterUrl,
    badge: series.badge || "",
    resolution: series.resolution || "1080p",
    status: series.status || "Published",
    views: series.views || 0,
    streamingUrl: firstEpServers[0]?.url || "",
    downloadUrl,
    trapDownloadUrl: series.trapDownloadUrl || "",
    realDownloadUrl: series.realDownloadUrl || downloadUrl,
    trailerUrl: series.trailerUrl ? normalizeEmbedUrl(series.trailerUrl) : undefined,
    servers: firstEpServers,
    episodes,
    totalEpisodes: series.totalEpisodes || episodes.length || 1,
    totalSeasons: series.totalSeasons || 1,
    isSeries: true,
    type: "series",
    seoTitle: series.seoTitle,
    seoDescription: series.seoDescription,
    seoKeywords: series.seoKeywords,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
  };
}

/**
 * Fetches and normalizes a piece of content by slug across both movies and series tables.
 */
export async function getUnifiedContentBySlug(
  slug: string,
  preferredCategory?: ContentCategory
): Promise<UnifiedContent | null> {
  const [movie, series] = await Promise.all([
    getMovieBySlugOrId(slug).catch(() => null),
    getSeriesBySlugOrId(slug).catch(() => null),
  ]);

  if (!movie && !series) {
    return null;
  }

  // Priority based on category preference
  if (preferredCategory === "Anime") {
    if (movie && movie.category === "Anime") return adaptMovieToUnifiedContent(movie);
    if (series && series.category === "Anime") return adaptSeriesToUnifiedContent(series);
  } else if (preferredCategory === "Drama Jepang") {
    if (series && series.category === "Drama Jepang") return adaptSeriesToUnifiedContent(series);
    if (movie && movie.category === "Drama Jepang") return adaptMovieToUnifiedContent(movie);
  }

  // Fallbacks
  if (series) return adaptSeriesToUnifiedContent(series);
  if (movie) return adaptMovieToUnifiedContent(movie);

  return null;
}

/**
 * Fetches related unified content for recommendations grid.
 */
export async function getRelatedUnifiedContent(
  content: UnifiedContent,
  limit: number = 4
): Promise<UnifiedContent[]> {
  try {
    const [movies, seriesList] = await Promise.all([
      getMovies({ status: "Published", category: content.category, limit: limit + 2 }).catch(() => []),
      getSeriesList({ status: "Published", category: content.category, limit: limit + 2 }).catch(() => []),
    ]);

    const unified: UnifiedContent[] = [
      ...movies.map(adaptMovieToUnifiedContent),
      ...seriesList.map(adaptSeriesToUnifiedContent),
    ];

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
