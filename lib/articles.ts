import { supabase } from "@/lib/supabase";
import { Article } from "@/types/article";
import { revalidateContent } from "@/app/actions/revalidate";

/**
 * Normalizes a database row from Supabase (supporting both snake_case and camelCase)
 * to the application's Article interface.
 */
export function mapArticleFromDb(row: Record<string, unknown> | null | undefined): Article {
  if (!row) return {} as Article;

  return {
    id: String(row.id || ""),
    title: (row.title as string) || "",
    slug: (row.slug as string) || "",
    excerpt: (row.excerpt as string) || "",
    content: (row.content as string) || "",
    thumbnailUrl: (row.thumbnail_url as string) ?? (row.thumbnailUrl as string) ?? "",
    bannerUrl: (row.banner_url as string) ?? (row.bannerUrl as string) ?? "",
    category: (row.category as string) || "News",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    author: (row.author as string) || "Admin",
    status: row.status === "Draft" ? "Draft" : "Published",
    featured: Boolean(row.featured),
    isGlobalNews: Boolean(row.is_global_news ?? row.isGlobalNews),
    views: Number(row.views || 0),
    readingTime: Number(row.reading_time ?? row.readingTime ?? 3),
    seoTitle: (row.seo_title as string) ?? (row.seoTitle as string) ?? (row.title as string) ?? "",
    seoDescription: (row.seo_description as string) ?? (row.seoDescription as string) ?? (row.excerpt as string) ?? "",
    seoKeywords: (row.seo_keywords as string) ?? (row.seoKeywords as string) ?? "",
    likes: Number(row.likes || 0),
    commentCount: Number(row.comment_count ?? row.commentCount ?? 0),
    createdAt: (row.created_at as string) ?? (row.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? (row.updatedAt as string) ?? new Date().toISOString(),
    publishedAt: (row.published_at as string) ?? (row.publishedAt as string) ?? (row.created_at as string) ?? (row.createdAt as string) ?? new Date().toISOString(),
  };
}

/**
 * Normalizes form data to Supabase database payload
 */
export function mapArticleToDb(data: Partial<Article>) {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.excerpt !== undefined) payload.excerpt = data.excerpt;
  if (data.content !== undefined) payload.content = data.content;
  if (data.thumbnailUrl !== undefined) {
    payload.thumbnail_url = data.thumbnailUrl;
    payload.thumbnailUrl = data.thumbnailUrl;
  }
  if (data.bannerUrl !== undefined) {
    payload.banner_url = data.bannerUrl;
    payload.bannerUrl = data.bannerUrl;
  }
  if (data.category !== undefined) payload.category = data.category;
  if (data.tags !== undefined) payload.tags = data.tags;
  if (data.author !== undefined) payload.author = data.author;
  if (data.status !== undefined) payload.status = data.status;
  if (data.featured !== undefined) payload.featured = data.featured;
  if (data.isGlobalNews !== undefined) {
    payload.is_global_news = data.isGlobalNews;
    payload.isGlobalNews = data.isGlobalNews;
  }
  if (data.views !== undefined) payload.views = data.views;
  if (data.readingTime !== undefined) {
    payload.reading_time = data.readingTime;
    payload.readingTime = data.readingTime;
  }
  if (data.seoTitle !== undefined) {
    payload.seo_title = data.seoTitle;
    payload.seoTitle = data.seoTitle;
  }
  if (data.seoDescription !== undefined) {
    payload.seo_description = data.seoDescription;
    payload.seoDescription = data.seoDescription;
  }
  if (data.seoKeywords !== undefined) {
    payload.seo_keywords = data.seoKeywords;
    payload.seoKeywords = data.seoKeywords;
  }

  payload.updated_at = now;
  payload.updatedAt = now;

  return payload;
}

export interface FetchArticlesOptions {
  isGlobalNews?: boolean;
  status?: string;
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
}

/**
 * Fetch articles list from Supabase
 */
export async function getArticles(options: FetchArticlesOptions = {}): Promise<Article[]> {
  try {
    let query = supabase.from("articles").select("*");

    if (options.status) {
      query = query.eq("status", options.status);
    }

    if (options.isGlobalNews !== undefined) {
      query = query.eq("is_global_news", options.isGlobalNews);
    }

    if (options.category) {
      query = query.eq("category", options.category);
    }

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%,author.ilike.%${options.search}%`);
    }

    query = query.order("created_at", { ascending: false });

    if (options.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getArticles error:", error);
      return [];
    }

    return (data || []).map(mapArticleFromDb);
  } catch (err) {
    console.error("Caught error in getArticles:", err);
    return [];
  }
}

/**
 * Fetch single article by slug or id
 */
export async function getArticleBySlugOrId(slugOrId: string): Promise<Article | null> {
  try {
    // Try matching slug first
    const { data: slugData, error: slugError } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slugOrId)
      .maybeSingle();

    if (slugData && !slugError) {
      return mapArticleFromDb(slugData);
    }

    // Fallback matching id
    const { data: idData, error: idError } = await supabase
      .from("articles")
      .select("*")
      .eq("id", slugOrId)
      .maybeSingle();

    if (idData && !idError) {
      return mapArticleFromDb(idData);
    }

    return null;
  } catch (err) {
    console.error("Error fetching article by slug/id:", err);
    return null;
  }
}

/**
 * Fetch related articles
 */
export async function getRelatedArticles(
  currentSlugOrId: string,
  isGlobalNews: boolean,
  category: string,
  limitCount: number = 6
): Promise<Article[]> {
  try {
    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "Published")
      .neq("slug", currentSlugOrId)
      .neq("id", currentSlugOrId);

    if (isGlobalNews) {
      query = query.eq("is_global_news", true);
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(limitCount * 2);

    if (error || !data) {
      console.error("Error in getRelatedArticles:", error);
      return [];
    }

    const mapped = data.map(mapArticleFromDb);
    // Prioritize articles with matching category
    const sameCategory = mapped.filter((a) => a.category === category);
    const otherCategory = mapped.filter((a) => a.category !== category);

    return [...sameCategory, ...otherCategory].slice(0, limitCount);
  } catch (err) {
    console.error("Caught error in getRelatedArticles:", err);
    return [];
  }
}

/**
 * Create an article in Supabase
 */
export async function createArticle(data: Omit<Article, "id">): Promise<{ article?: Article; error?: string }> {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...mapArticleToDb(data),
      views: 0,
      likes: 0,
      comment_count: 0,
      commentCount: 0,
      created_at: now,
      createdAt: now,
      published_at: now,
      publishedAt: now,
    };

    const { data: inserted, error } = await supabase
      .from("articles")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error creating article:", error);
      return { error: error.message };
    }

    const createdArticle = mapArticleFromDb(inserted);
    await revalidateContent("article", createdArticle.category, createdArticle.slug).catch(() => {});

    return { article: createdArticle };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal membuat artikel";
    return { error: errorMsg };
  }
}

/**
 * Update an article in Supabase
 */
export async function updateArticle(
  id: string,
  data: Partial<Article>
): Promise<{ article?: Article; error?: string }> {
  try {
    const payload = mapArticleToDb(data);

    const { data: updated, error } = await supabase
      .from("articles")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating article:", error);
      return { error: error.message };
    }

    const updatedArticle = mapArticleFromDb(updated);
    await revalidateContent("article", updatedArticle.category, updatedArticle.slug).catch(() => {});

    return { article: updatedArticle };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui artikel";
    return { error: errorMsg };
  }
}

/**
 * Delete an article in Supabase
 */
export async function deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const article = await getArticleBySlugOrId(id);
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      console.error("Error deleting article:", error);
      return { success: false, error: error.message };
    }
    await revalidateContent("article", article?.category, article?.slug).catch(() => {});
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus artikel";
    return { success: false, error: errorMsg };
  }
}
