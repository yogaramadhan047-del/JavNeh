import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { ArticleForm } from "../../components/article-form";
import { getArticleBySlugOrId } from "@/lib/articles";
import { notFound } from "next/navigation";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await getArticleBySlugOrId(id);

  if (!article) {
    notFound();
  }

  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Artikel", href: "/admin/articles" },
          { label: `Edit: ${article.title}` },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Edit Artikel</h1>
        <p className="text-gray-400 text-sm">Ubah konten artikel {article.title}.</p>
      </div>

      <ArticleForm initialData={article} isEdit={true} />
    </>
  );
}
