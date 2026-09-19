import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { ArticleForm } from "../components/article-form";

export default function AddArticlePage() {
  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Artikel", href: "/admin/articles" },
          { label: "Tambah Artikel" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Tambah Artikel Baru</h1>
        <p className="text-gray-400 text-sm">Buat konten artikel, berita, atau review film baru.</p>
      </div>

      <ArticleForm />
    </>
  );
}
