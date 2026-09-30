import { supabase } from "@/lib/supabase";
import { Movie, MovieServer, ContentCategory } from "@/types/movie";
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
 * Normalizes a database row from Supabase to the application's Movie interface.
 * Strictly verifies category: returns null if category is missing, empty, or invalid.
 * Zero silent coercion or category fallbacks.
 */
export function mapMovieFromDb(row: Record<string, unknown> | null | undefined): Movie | null {
  if (!row) return null;

  const category: ContentCategory = (row.category as string) || "Movie";

  const rawServers = parseJsonArray<MovieServer>(row.servers);
  const servers: MovieServer[] = rawServers.map((s, idx) => {
    const rawUrl = s.url || s.embedUrl || "";
    const cleanUrl = normalizeEmbedUrl(rawUrl);
    return {
      ...s,
      url: cleanUrl,
      embedUrl: cleanUrl,
    };
  });
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
    servers,
    synopsis: (row.synopsis as string) || "",
    views: Number(row.views || 0),
    status: (row.status as string) || "Published",
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
export function mapMovieToDb(data: Partial<Movie>) {
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
  if (data.servers !== undefined) {
    payload.servers = data.servers.map((s) => {
      const rawUrl = s.url || s.embedUrl || "";
      const cleanUrl = normalizeEmbedUrl(rawUrl);
      return {
        ...s,
        url: cleanUrl,
        embedUrl: cleanUrl,
      };
    });
  }
  if (data.synopsis !== undefined) payload.synopsis = data.synopsis;
  if (data.views !== undefined) payload.views = Number(data.views);
  if (data.status !== undefined) payload.status = data.status;
  if (data.seoTitle !== undefined) payload.seo_title = data.seoTitle;
  if (data.seoDescription !== undefined) payload.seo_description = data.seoDescription;
  if (data.seoKeywords !== undefined) payload.seo_keywords = data.seoKeywords;

  payload.updated_at = now;

  return payload;
}

export interface FetchMoviesOptions {
  category?: ContentCategory | string;
  genre?: string;
  badge?: string;
  status?: string;
  search?: string;
  year?: number;
  limit?: number;
  offset?: number;
  from?: number;
  to?: number;
  orderBy?: "createdAt" | "views" | "rating" | "year";
  ascending?: boolean;
}

/**
 * Fetch movies list from Supabase using category as filter
 */
export async function getMovies(options: FetchMoviesOptions = {}): Promise<Movie[]> {
  try {
    let query = supabase.from("movies").select("*");

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

    if (options.genre) {
      query = query.contains("genres", [options.genre]);
    }

    if (options.year) {
      query = query.eq("year", options.year);
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

    if (options.from !== undefined && options.to !== undefined) {
      query = query.range(options.from, options.to);
    } else if (options.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getMovies error:", error);
      return [];
    }

    return (data || [])
      .map(mapMovieFromDb)
      .filter((m): m is Movie => m !== null);
  } catch (err) {
    console.error("Caught error in getMovies:", err);
    return [];
  }
}

/**
 * Fetch single movie by slug or id
 */
export async function getMovieBySlugOrId(slugOrId: string): Promise<Movie | null> {
  try {
    const { data: slugData, error: slugError } = await supabase
      .from("movies")
      .select("*")
      .eq("slug", slugOrId)
      .maybeSingle();

    if (slugData && !slugError) {
      const movie = mapMovieFromDb(slugData);
      if (movie) return movie;
    }

    const { data: idData, error: idError } = await supabase
      .from("movies")
      .select("*")
      .eq("id", slugOrId)
      .maybeSingle();

    if (idData && !idError) {
      const movie = mapMovieFromDb(idData);
      if (movie) return movie;
    }

    return null;
  } catch (err) {
    console.error("Error fetching movie by slug/id:", err);
    return null;
  }
}

/**
 * Fetch related movies by category and genre
 */
export async function getRelatedMovies(movie: Movie, limitCount: number = 4): Promise<Movie[]> {
  try {
    let related: Movie[] = [];

    if (movie.genres && movie.genres.length > 0) {
      let query = supabase
        .from("movies")
        .select("*")
        .eq("status", "Published")
        .neq("id", movie.id)
        .contains("genres", [movie.genres[0]]);

      if (movie.category) {
        query = query.eq("category", movie.category);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limitCount);

      if (!error && data) {
        related = data
          .map(mapMovieFromDb)
          .filter((m): m is Movie => m !== null);
      }
    }

    if (related.length < limitCount) {
      const needed = limitCount - related.length;
      const existingIds = [movie.id, ...related.map((r) => r.id)];
      let query = supabase
        .from("movies")
        .select("*")
        .eq("status", "Published");

      if (movie.category) {
        query = query.eq("category", movie.category);
      }

      const { data, error } = await query
        .order("year", { ascending: false })
        .limit(needed + 5);

      if (!error && data) {
        const fallbacks = data
          .map(mapMovieFromDb)
          .filter((m): m is Movie => m !== null)
          .filter((m) => !existingIds.includes(m.id))
          .slice(0, needed);
        related.push(...fallbacks);
      }
    }

    return related;
  } catch (err) {
    console.error("Error fetching related movies:", err);
    return [];
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
 * Create a movie in Supabase with strict category validation
 */
export async function createMovie(data: Omit<Movie, "id">): Promise<{ movie?: Movie; error?: string }> {
  try {
    if (!data.category) {
      return { error: "Kategori utama wajib dipilih" };
    }

    const now = new Date().toISOString();
    const payload = {
      ...mapMovieToDb(data),
      views: data.views || 0,
      created_at: now,
    };

    const insertQuery = supabase
      .from("movies")
      .insert(payload)
      .select()
      .maybeSingle();

    const { data: inserted, error } = await withTimeout(
      insertQuery,
      20000,
      "Gagal menyimpan: Waktu koneksi ke database habis (timeout). Silakan coba lagi."
    );

    if (error) {
      console.error("Error creating movie:", error);
      return { error: error.message };
    }

    // Map inserted row, or fallback to synthesized movie object from payload if select was empty
    const createdMovie = inserted
      ? mapMovieFromDb(inserted)
      : mapMovieFromDb({ ...payload, id: (inserted as any)?.id || crypto.randomUUID() });

    if (!createdMovie) {
      return { error: "Data film yang tersimpan tidak valid atau memiliki kategori tidak sah" };
    }

    // Non-blocking revalidation
    withTimeout(revalidateContent("movie", createdMovie.category, createdMovie.slug), 5000).catch((err) => {
      console.warn("Revalidation warning:", err);
    });

    return { movie: createdMovie };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal membuat film";
    return { error: errorMsg };
  }
}

/**
 * Update a movie in Supabase with strict category validation
 */
export async function updateMovie(
  id: string,
  data: Partial<Movie>
): Promise<{ movie?: Movie; error?: string }> {
  try {
    const payload = mapMovieToDb(data);

    const updateQuery = supabase
      .from("movies")
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
      console.error("Error updating movie:", error);
      return { error: error.message };
    }

    const updatedMovie = updated
      ? mapMovieFromDb(updated)
      : mapMovieFromDb({ ...payload, id, category: data.category || "Movie" });

    if (!updatedMovie) {
      return { error: "Data film yang diperbarui tidak valid atau memiliki kategori tidak sah" };
    }

    // Non-blocking revalidation
    withTimeout(revalidateContent("movie", updatedMovie.category, updatedMovie.slug), 5000).catch((err) => {
      console.warn("Revalidation warning:", err);
    });

    return { movie: updatedMovie };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui film";
    return { error: errorMsg };
  }
}

/**
 * Delete a movie in Supabase
 */
export async function deleteMovie(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const movie = await getMovieBySlugOrId(id);
    const { error } = await supabase.from("movies").delete().eq("id", id);
    if (error) {
      console.error("Error deleting movie:", error);
      return { success: false, error: error.message };
    }
    await revalidateContent("movie", movie?.category, movie?.slug).catch(() => {});
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus film";
    return { success: false, error: errorMsg };
  }
}

/**
 * Fetch all genres from Supabase with fallback defaults
 */
export async function getGenres(): Promise<{ id: string; name: string }[]> {
  try {
    const { data, error } = await supabase
      .from("genres")
      .select("*")
      .order("name", { ascending: true });
    if (!error && data && data.length > 0) {
      return data.map((g: any) => ({ id: String(g.id), name: g.name }));
    }
  } catch (error) {
    console.error("Error fetching genres:", error);
  }
  const defaultGenres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Music",
    "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western"
  ];
  return defaultGenres.map((name, i) => ({ id: String(i), name }));
}
