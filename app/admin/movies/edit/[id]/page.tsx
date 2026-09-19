import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { MovieForm } from "../../components/movie-form";
import { notFound } from "next/navigation";
import { getMovieBySlugOrId } from "@/lib/movies";

export default async function EditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const movie = await getMovieBySlugOrId(id);

  if (!movie) {
    notFound();
  }

  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Anime", href: "/admin/movies" },
          { label: `Edit: ${movie.title}` },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Edit Anime</h1>
        <p className="text-gray-400 text-sm">Ubah informasi anime {movie.title}.</p>
      </div>

      <MovieForm initialData={movie} isEdit={true} />
    </>
  );
}
