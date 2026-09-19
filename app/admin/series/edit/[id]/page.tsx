import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { SeriesForm } from "../../components/series-form";
import { notFound } from "next/navigation";
import { getSeriesBySlugOrId } from "@/lib/series";

export default async function EditSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const series = await getSeriesBySlugOrId(id);

  if (!series) {
    notFound();
  }

  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Drama Jepang", href: "/admin/series" },
          { label: `Edit: ${series.title}` },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Edit Drama Jepang</h1>
        <p className="text-gray-400 text-sm">Ubah informasi dorama {series.title}.</p>
      </div>

      <SeriesForm initialData={series} isEdit={true} />
    </>
  );
}
