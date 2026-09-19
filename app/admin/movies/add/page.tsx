import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { MovieForm } from "../components/movie-form";

export default function AddMoviePage() {
  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Anime", href: "/admin/movies" },
          { label: "Tambah Anime" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Tambah Anime Baru</h1>
        <p className="text-gray-400 text-sm">Tambahkan data anime dan link streaming baru.</p>
      </div>

      <MovieForm />
    </>
  );
}
