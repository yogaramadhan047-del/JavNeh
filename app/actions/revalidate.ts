"use server";

import { revalidatePath } from "next/cache";

/**
 * Server action to invalidate ISR cache for modified content
 * Explicitly revalidates:
 * 1. Home page ('/')
 * 2. The movies catalog route ('/movies')
 * 3. The specific movie slug route (e.g. '/movies/[slug]')
 * 4. Sitemap ('/sitemap.xml')
 */
export async function revalidateContent(
  type: "movie" | "series" | "article",
  categoryOrSlug?: string,
  explicitSlug?: string
) {
  try {
    // 1. Always revalidate home page and sitemap
    revalidatePath("/", "page");
    revalidatePath("/sitemap.xml");

    // Resolve slug
    let slug: string | undefined;

    if (explicitSlug) {
      slug = explicitSlug;
    } else if (categoryOrSlug) {
      if (categoryOrSlug !== "Anime" && categoryOrSlug !== "Drama Jepang") {
        slug = categoryOrSlug;
      }
    }

    if (type === "movie" || type === "series") {
      revalidatePath("/movies", "page");
      if (slug) {
        revalidatePath(`/movies/${slug}`, "page");
      }
    } else if (type === "article") {
      revalidatePath("/artikel", "page");
      if (slug) {
        revalidatePath(`/artikel/${slug}`, "page");
      }
    }

    return { success: true };
  } catch (err) {
    console.error("revalidateContent error:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * Server action to invalidate cache when site or advertisement settings are updated
 */
export async function revalidateSettings() {
  try {
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("revalidateSettings error:", err);
    return { success: false, error: String(err) };
  }
}
