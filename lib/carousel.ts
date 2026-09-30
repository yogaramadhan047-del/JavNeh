import { getMovies } from "./movies";
import { MovieCardItem } from "@/components/ui/movie-card";

/**
 * Fetch strictly Hot items (Movies) for Hero Carousel.
 * Only published content with badge === "Hot" (case-insensitive) is returned.
 * Zero fallback to other badges or non-hot content.
 */
export async function getHotCarouselItems(): Promise<MovieCardItem[]> {
  try {
    const movies = await getMovies({ status: "Published", badge: "Hot", limit: 12 }).catch(() => []);

    const combined: MovieCardItem[] = movies.map((m) => ({ ...m, isSeries: false }));

    // Strict filter: badge must be "Hot" (case-insensitive for safety)
    const hotOnly = combined.filter(
      (item) => item.badge && item.badge.trim().toLowerCase() === "hot"
    );

    // Sort by createdAt descending
    hotOnly.sort((a, b) => {
      const timeB = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
      const timeA = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
      return timeB - timeA;
    });

    return hotOnly.slice(0, 8);
  } catch (error) {
    console.error("Error fetching hot carousel items:", error);
    return [];
  }
}
