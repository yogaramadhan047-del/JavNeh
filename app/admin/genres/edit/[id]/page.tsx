import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { GenreForm } from "../../components/genre-form";
import { getGenreByIdOrSlug } from "@/lib/genres";
import { notFound } from "next/navigation";

export default async function EditGenrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const genre = await getGenreByIdOrSlug(id);

  if (!genre) {
    notFound();
  }

  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Genres", href: "/admin/genres" },
          { label: `Edit: ${genre.name}` },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Edit Genre</h1>
        <p className="text-gray-400 text-sm">Ubah detail kategori {genre.name}.</p>
      </div>

      <GenreForm initialData={genre} isEdit={true} />
    </>
  );
}
