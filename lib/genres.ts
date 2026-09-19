import { supabase } from "@/lib/supabase";
import { Genre } from "@/types/genre";

export function mapGenreFromDb(row: Record<string, unknown> | null | undefined): Genre {
  if (!row) return {} as Genre;
  return {
    id: String(row.id || ""),
    name: (row.name as string) || "",
    slug: (row.slug as string) || "",
    description: (row.description as string) || "",
    icon: (row.icon as string) || "",
    color: (row.color as string) || "",
    createdAt: (row.created_at as string) ?? (row.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? (row.updatedAt as string) ?? new Date().toISOString(),
  };
}

export function mapGenreToDb(data: Partial<Genre>) {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.description !== undefined) payload.description = data.description;
  if (data.icon !== undefined) payload.icon = data.icon;
  if (data.color !== undefined) payload.color = data.color;

  payload.updated_at = now;
  payload.updatedAt = now;

  return payload;
}

/**
 * Fetch all genres ordered by name
 */
export async function getGenres(): Promise<Genre[]> {
  try {
    const { data, error } = await supabase
      .from("genres")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching genres:", error);
      return [];
    }

    return (data || []).map(mapGenreFromDb);
  } catch (err) {
    console.error("Caught error in getGenres:", err);
    return [];
  }
}

/**
 * Fetch a genre by id or slug
 */
export async function getGenreByIdOrSlug(idOrSlug: string): Promise<Genre | null> {
  try {
    const { data: idData, error: idErr } = await supabase
      .from("genres")
      .select("*")
      .eq("id", idOrSlug)
      .maybeSingle();

    if (!idErr && idData) {
      return mapGenreFromDb(idData);
    }

    const { data: slugData, error: slugErr } = await supabase
      .from("genres")
      .select("*")
      .eq("slug", idOrSlug)
      .maybeSingle();

    if (!slugErr && slugData) {
      return mapGenreFromDb(slugData);
    }

    return null;
  } catch (err) {
    console.error("Caught error in getGenreByIdOrSlug:", err);
    return null;
  }
}

/**
 * Create a new genre
 */
export async function createGenre(data: Omit<Genre, "id">): Promise<{ genre?: Genre; error?: string }> {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...mapGenreToDb(data),
      created_at: now,
      createdAt: now,
    };

    const { data: inserted, error } = await supabase
      .from("genres")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error creating genre:", error);
      return { error: error.message };
    }

    return { genre: mapGenreFromDb(inserted) };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal membuat genre";
    return { error: errorMsg };
  }
}

/**
 * Update an existing genre
 */
export async function updateGenre(
  id: string,
  data: Partial<Genre>
): Promise<{ genre?: Genre; error?: string }> {
  try {
    const payload = mapGenreToDb(data);

    const { data: updated, error } = await supabase
      .from("genres")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating genre:", error);
      return { error: error.message };
    }

    return { genre: mapGenreFromDb(updated) };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui genre";
    return { error: errorMsg };
  }
}

/**
 * Delete a genre
 */
export async function deleteGenre(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("genres").delete().eq("id", id);
    if (error) {
      console.error("Error deleting genre:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menghapus genre";
    return { success: false, error: errorMsg };
  }
}
