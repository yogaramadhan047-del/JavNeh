import { supabase } from "@/lib/supabase";
import { Series, Episode, ContentCategory } from "@/types/series";
import { revalidateContent } from "@/app/actions/revalidate";
import { normalizeEmbedUrl } from "@/lib/embed";

function parseJsonArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Normalizes a database row from Supabase to the application's Series interface.
 * Strictly verifies category: returns null if category is missing, empty, or invalid.
 * Zero silent coercion or category fallbacks.
 */
export function mapSeriesFromDb(row: Record<string, unknown> | null | undefined): Series | null {
  if (!row) return null;

  const rawCategory = row.category;
  if (rawCategory !== "Anime" && rawCategory !== "Drama Jepang") {
    // Strictly reject invalid, empty, or unassigned category records
    return null;
  }
  const category: ContentCategory = rawCategory;

  const rawEpisodes = parseJsonArray<Episode>(row.episodes);
  const episodes: Episode[] = rawEpisodes.map((ep) => ({
    ...ep,
    servers: (ep.servers || []).map((s) => ({
      ...s,
      url: normalizeEmbedUrl(s.url),
    })),
  }));
  const genres = parseJsonArray<string>(row.genres);
  const tags = parseJsonArray<string>(row.tags);

  const downloadUrl =
    (row.download_url as string) ??
    (row.downloadUrl as string) ??
    (row.real_download_url as string) ??
    (row.realDownloadUrl as string) ??
    "";

  return {
    id: String(row.id || ""),
    category,
    title: (row.title as string) || "",
    slug: (row.slug as string) || "",
    originalTitle: (row.original_title as string) ?? (row.originalTitle as string) ?? "",
    year: Number(row.year || new Date().getFullYear()),
    releaseDate: (row.release_date as string) ?? (row.releaseDate as string) ?? "",
    rating: Number(row.rating || 0),
    imdb: Number(row.imdb || 0),
    genres: genres.length > 0 ? genres : typeof row.genres === "string" ? [row.genres] : [],
    tags: tags.length > 0 ? tags : typeof row.tags === "string" ? [row.tags] : [],
    country: (row.country as string) || "US",
    language: (row.language as string) || "English",
    duration: (row.duration as string) || "",
    subtitle: (row.subtitle as string) || "Indonesia",
    studio: (row.studio as string) || "",
    resolution: (row.resolution as string) || "",
    badge: (row.badge as string) || "",
    posterUrl: (row.poster_url as string) ?? (row.posterUrl as string) ?? "",
    bannerUrl: (row.banner_url as string) ?? (row.bannerUrl as string) ?? "",
    trailerUrl: (row.trailer_url as string) ?? (row.trailerUrl as string) ?? "",
    downloadUrl,
    trapDownloadUrl: (row.trap_download_url as string) ?? (row.trapDownloadUrl as string) ?? "",
    realDownloadUrl: (row.real_download_url as string) ?? (row.realDownloadUrl as string) ?? downloadUrl,
    episodes,
    totalSeasons: Number(row.total_seasons ?? row.totalSeasons ?? 1),
    totalEpisodes: Number(row.total_episodes ?? row.totalEpisodes ?? (episodes.length || 1)),
    status: (row.status as string) || "Ongoing",
    synopsis: (row.synopsis as string) || "",
    views: Number(row.views || 0),
    seoTitle: (row.seo_title as string) ?? (row.seoTitle as string) ?? "",
    seoDescription: (row.seo_description as string) ?? (row.seoDescription as string) ?? "",
    seoKeywords: (row.seo_keywords as string) ?? (row.seoKeywords as string) ?? "",
    createdAt: (row.created_at as string) ?? (row.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? (row.updatedAt as string) ?? new Date().toISOString(),
  };
}

/**
 * Normalizes form data to Supabase database payload.
 * STRICT: Only includes exact database columns in snake_case to prevent PGRST204 schema cache errors.
 */
export function mapSeriesToDb(data: Partial<Series>) {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {};

  if (data.category !== undefined) payload.category = data.category;
  if (data.title !== undefined) payload.title = data.title;
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.originalTitle !== undefined) payload.original_title = data.originalTitle;
  if (data.year !== undefined) payload.year = Number(data.year);
  if (data.releaseDate !== undefined) payload.release_date = data.releaseDate;
  if (data.rating !== undefined) payload.rating = Number(data.rating);
  if (data.imdb !== undefined) payload.imdb = Number(data.imdb);
  if (data.genres !== undefined) payload.genres = data.genres;
  if (data.tags !== undefined) payload.tags = data.tags;
  if (data.country !== undefined) payload.country = data.country;
  if (data.language !== undefined) payload.language = data.language;
  if (data.duration !== undefined) payload.duration = data.duration;
  if (data.subtitle !== undefined) payload.subtitle = data.subtitle;
  if (data.studio !== undefined) payload.studio = data.studio;
  if (data.resolution !== undefined) payload.resolution = data.resolution;
  if (data.badge !== undefined) payload.badge = data.badge;
  if (data.posterUrl !== undefined) payload.poster_url = data.posterUrl;
  if (data.bannerUrl !== undefined) payload.banner_url = data.bannerUrl;
  if (data.trailerUrl !== undefined) payload.trailer_url = data.trailerUrl;

  const resolvedDownload = data.downloadUrl !== undefined ? data.downloadUrl : data.realDownloadUrl;
  if (resolvedDownload !== undefined) {
    payload.download_url = resolvedDownload;
    payload.real_download_url = resolvedDownload;
  }
  if (data.trapDownloadUrl !== undefined) payload.trap_download_url = data.trapDownloadUrl;
  if (data.episodes !== undefined) {
    payload.episodes = data.episodes.map((ep) => ({
      ...ep,
      servers: (ep.servers || []).map((s) => ({
        ...s,
        url: normalizeEmbedUrl(s.url),
      })),
    }));
  }
  if (data.totalSeasons !== undefined) payload.total_seasons = Number(data.totalSeasons);
  if (data.totalEpisodes !== undefined) payload.total_episodes = Number(data.totalEpisodes);
  if (data.status !== undefined) payload.status = data.status;
  if (data.synopsis !== undefined) payload.synopsis = data.synopsis;
  if (data.views !== undefined) payload.views = Number(data.views);
  if (data.seoTitle !== undefined) payload.seo_title = data.seoTitle;
  if (data.seoDescription !== undefined) payload.seo_description = data.seoDescription;
  if (data.seoKeywords !== undefined) payload.seo_keywords = data.seoKeywords;

  payload.updated_at = now;

  return payload;
}

export interface FetchSeriesOptions {
  category?: ContentCategory | string;
  genre?: string;
  badge?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "views" | "rating" | "year";
  ascending?: boolean;
}

/**
 * Fetch series list from Supabase using category as filter
 */
export async function getSeriesList(options: FetchSeriesOptions = {}): Promise<Series[]> {
  try {
    let query = supabase.from("series").select("*");

    if (options.status) {
      query = query.eq("status", options.status);
    }

    // Single source of truth: category filtering
    if (options.category) {
      query = query.eq("category", options.category);
    }

    if (options.badge) {
      query = query.ilike("badge", options.badge);
    }

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,synopsis.ilike.%${options.search}%`);
    }

    const sortField =
      options.orderBy === "views"
        ? "views"
        : options.orderBy === "rating"
        ? "rating"
        : options.orderBy === "year"
        ? "year"
        : "created_at";

    query = query.order(sortField, { ascending: options.ascending ?? false });

    // Note: When genre filter is specified, we fetch and filter in-memory if needed or limit appropriately
    if (options.limit && !options.genre) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getSeriesList error:", error);
      return [];
    }

    let results = (data || [])
      .map(mapSeriesFromDb)
      .filter((s): s is Series => s !== null);

    if (options.genre) {
      const targetGenre = options.genre.toLowerCase();
      results = results.filter((s) =>
        s.genres?.some((g) => g.toLowerCase() === targetGenre)
      );
      if (options.limit) {
        const from = options.offset || 0;
        results = results.slice(from, from + options.limit);
      }
    }

    return results;
  } catch (err) {
    console.error("Caught error in getSeriesList:", err);
    return [];
  }
}

/**
 * Fetch single series by slug or id
 */
export async function getSeriesBySlugOrId(slugOrId: string): Promise<Series | null> {
  try {
    const { data: slugData, error: slugError } = await supabase
      .from("series")
      .select("*")
      .eq("slug", slugOrId)
      .maybeSingle();

    if (slugData && !slugError) {
      const series = mapSeriesFromDb(slugData);
      if (series) return series;
    }

    const { data: idData, error: idError } = await supabase
      .from("series")
      .select("*")
      .eq("id", slugOrId)
      .maybeSingle();

    if (idData && !idError) {
      const series = mapSeriesFromDb(idData);
      if (series) return series;
    }

    return null;
  } catch (err) {
    console.error("Error fetching series by slug/id:", err);
    return null;
  }
}

async function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs = 20000,
  errorMsg = "Koneksi ke Supabase melebihi batas waktu (timeout). Silakan periksa koneksi internet Anda."
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMsg)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Create series in Supabase with strict category validation
 */
export async function createSeries(data: Omit<Series, "id">): Promise<{ series?: Series; error?: string }> {
  try {
    if (!data.category || (data.category !== "Anime" && data.category !== "Drama Jepang")) {
      return { error: "Kategori utama wajib dipilih: 'Anime' atau 'Drama Jepang'" };
    }

    const now = new Date().toISOString();
    const payload = {
      ...mapSeriesToDb(data),
      views: data.views || 0,
      created_at: now,
    };

    const insertQuery = supabase
      .from("series")
      .insert(payload)
      .select()
      .maybeSingle();

    const { data: inserted, error } = await withTimeout(
      insertQuery,
      20000,
      "Gagal menyimpan: Waktu koneksi ke database habis (timeout). Silakan coba lagi."
    );

    if (error) {
      console.error("Error creating series:", error);
      return { error: error.message };
    }

    const createdSeries = inserted
      ? mapSeriesFromDb(inserted)
      : mapSeriesFromDb({ ...payload, id: (inserted as any)?.id || crypto.randomUUID() });

    if (!createdSeries) {
      return { error: "Data series yang tersimpan tidak valid atau memiliki kategori tidak sah" };
    }

    // Non-blocking revalidation
    withTimeout(revalidateContent("series", createdSeries.category, createdSeries.slug), 5000).catch((err) => {
      console.warn("Revalidation warning:", err);
    });

    return { series: createdSeries };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal membuat series";
    return { error: errorMsg };
  }
}

/**
 * Update series in Supabase with strict category validation
 */
export async function updateSeries(
  id: string,
  data: Partial<Series>
): Promise<{ series?: Series; error?: string }> {
  try {
    if (data.category !== undefined && data.category !== "Anime" && data.category !== "Drama Jepang") {
      return { error: "Kategori harus berupa 'Anime' atau 'Drama Jepang'" };
    }

    const payload = mapSeriesToDb(data);

    const updateQuery = supabase
      .from("series")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    const { data: updated, error } = await withTimeout(
      updateQuery,
      20000,
      "Gagal memperbarui: Waktu koneksi ke database habis (timeout). Silakan coba lagi."
    );

    if (error) {
      console.error("Error updating series:", error);
      return { error: error.message };
    }

    const updatedSeries = updated
      ? mapSeriesFromDb(updated)
      : mapSeriesFromDb({ ...payload, id, category: data.category || "Anime" });

    if (!updatedSeries) {
      return { error: "Data series yang diperbarui tidak valid atau memiliki kategori tidak sah" };
    }

    // Non-blocking revalidation
    withTimeout(revalidateContent("series", updatedSeries.category, updatedSeries.slug), 5000).catch((err) => {
      console.warn("Revalidation warning:", err);
    });

    return { series: updatedSeries };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui series";
    return { error: errorMsg };
  }
}

/**
 * Delete series in Supabase
 */
export async function deleteSeries(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const series = await getSeriesBySlugOrId(id);
    const { error } = await supabase.from("series").delete().eq("id", id);
    if (error) {
      console.error("Error deleting series:", error);
      return { success: false, error: error.message };
    }
    await revalidateContent("series", series?.category, series?.slug).catch(() => {});
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus series";
    return { success: false, error: errorMsg };
  }
}
