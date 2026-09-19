import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { GenreForm } from "../components/genre-form";

export default function AddGenrePage() {
  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Genres", href: "/admin/genres" },
          { label: "Tambah Genre" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Tambah Genre Baru</h1>
        <p className="text-gray-400 text-sm">Tambahkan kategori atau genre film baru.</p>
      </div>

      <GenreForm />
    </>
  );
}
