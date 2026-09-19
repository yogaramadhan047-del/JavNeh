"use server";

import { revalidatePath } from "next/cache";

/**
 * Server action to invalidate ISR cache for modified content
 * Explicitly revalidates:
 * 1. Home page ('/')
 * 2. The specific category route ('/anime', '/drama-jepang', or '/artikel')
 * 3. The specific detail slug route (e.g. '/anime/[slug]')
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

    // Resolve category and slug
    let category: string | undefined;
    let slug: string | undefined;

    if (explicitSlug) {
      category = categoryOrSlug;
      slug = explicitSlug;
    } else if (categoryOrSlug) {
      if (categoryOrSlug === "Anime" || categoryOrSlug === "Drama Jepang") {
        category = categoryOrSlug;
      } else {
        slug = categoryOrSlug;
      }
    }

    if (type === "movie" || type === "series") {
      if (category === "Anime") {
        revalidatePath("/anime", "page");
        if (slug) revalidatePath(`/anime/${slug}`, "page");
      } else if (category === "Drama Jepang") {
        revalidatePath("/drama-jepang", "page");
        if (slug) revalidatePath(`/drama-jepang/${slug}`, "page");
      } else {
        // If category is not specified, revalidate both category pages
        revalidatePath("/anime", "page");
        revalidatePath("/drama-jepang", "page");
        if (slug) {
          revalidatePath(`/anime/${slug}`, "page");
          revalidatePath(`/drama-jepang/${slug}`, "page");
        }
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

