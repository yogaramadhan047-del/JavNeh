import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { SeriesForm } from "../components/series-form";

export default function AddSeriesPage() {
  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Drama Jepang", href: "/admin/series" },
          { label: "Tambah Drama" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Tambah Drama Baru</h1>
        <p className="text-gray-400 text-sm">Tambahkan entri serial dorama atau drama Jepang baru.</p>
      </div>

      <SeriesForm />
    </>
  );
}
