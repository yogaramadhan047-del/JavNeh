"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, Loader2 } from "lucide-react";
import { Article } from "@/types/article";
import { ImageUpload } from "../../movies/components/image-upload";
import { createArticle, updateArticle } from "@/lib/articles";

interface ArticleFormProps {
  initialData?: Article;
  isEdit?: boolean;
}

export function ArticleForm({ initialData, isEdit = false }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingCount, setUploadingCount] = useState(0);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    category: initialData?.category || "News",
    isGlobalNews: initialData?.isGlobalNews || false,
    author: initialData?.author || "Admin",
    status: (initialData?.status || "Published") as "Published" | "Draft",
    thumbnailUrl: initialData?.thumbnailUrl || "",
    bannerUrl: initialData?.bannerUrl || "",
    readingTime: initialData?.readingTime || 3,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoKeywords: initialData?.seoKeywords || "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEdit ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setError("Judul artikel wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEdit && initialData?.id) {
        const { error: updateErr } = await updateArticle(initialData.id, formData);
        if (updateErr) {
          throw new Error(updateErr);
        }
      } else {
        const { error: createErr } = await createArticle({
          ...formData,
          views: 0,
          likes: 0,
          commentCount: 0,
          featured: false,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        });
        if (createErr) {
          throw new Error(createErr);
        }
      }

      router.push("/admin/articles");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Gagal menyimpan artikel.");
      } else {
        setError("Gagal menyimpan artikel.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = loading || uploadingCount > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. Status & Classification */}
      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">1. Klasifikasi & Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Kategori Artikel</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              disabled={isFormDisabled}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            >
              <option value="News">Berita Anime & Drama</option>
              <option value="Review">Review Film / Series</option>
              <option value="Recommendation">Rekomendasi Tontonan</option>
              <option value="Editorial">Editorial & Opini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status Publikasi</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as "Published" | "Draft" }))}
              disabled={isFormDisabled}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            >
              <option value="Published">Published (Publik & Sitemap)</option>
              <option value="Draft">Draft (Disembunyikan)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Penulis</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
              disabled={isFormDisabled}
              placeholder="Admin"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Content & Markdown */}
      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">2. Konten Artikel</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Judul Artikel <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={handleTitleChange}
            disabled={isFormDisabled}
            placeholder="Judul artikel atau ulasan menarik..."
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Slug URL <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            disabled={isFormDisabled}
            placeholder="judul-artikel-menarik"
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Kutipan / Excerpt</label>
          <textarea
            rows={2}
            value={formData.excerpt}
            onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
            disabled={isFormDisabled}
            placeholder="Ringkasan singkat isi artikel untuk card preview..."
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Isi Artikel (Markdown Didukung)</label>
          <textarea
            rows={12}
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            disabled={isFormDisabled}
            placeholder="Tuliskan isi artikel lengkap di sini. Anda dapat menggunakan format markdown..."
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-blue text-sm font-mono"
          />
        </div>
      </div>

      {/* 3. Media & Uploads */}
      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">3. Media Gambar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload
            label="Banner Landscape (16:9)"
            value={formData.bannerUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, bannerUrl: url }))}
            aspectRatio="16/9"
            path="articles/banners"
            maxSizeMB={5}
            onUploadStart={() => setUploadingCount((prev) => prev + 1)}
            onUploadEnd={() => setUploadingCount((prev) => Math.max(0, prev - 1))}
            onError={(msg) => setError(msg)}
            disabled={isFormDisabled}
          />
          <ImageUpload
            label="Thumbnail Landscape (16:9)"
            value={formData.thumbnailUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, thumbnailUrl: url }))}
            aspectRatio="16/9"
            path="articles/thumbnails"
            maxSizeMB={5}
            onUploadStart={() => setUploadingCount((prev) => prev + 1)}
            onUploadEnd={() => setUploadingCount((prev) => Math.max(0, prev - 1))}
            onError={(msg) => setError(msg)}
            disabled={isFormDisabled}
          />
        </div>
      </div>

      {/* 4. SEO & Metadata */}
      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">4. Optimasi SEO & Metadata</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">SEO Title Kustom</label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
              disabled={isFormDisabled}
              placeholder="Judul khusus untuk Google Search dan Social Share..."
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">SEO Description Kustom</label>
            <textarea
              rows={2}
              value={formData.seoDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
              disabled={isFormDisabled}
              placeholder="Deskripsi ringkas artikel untuk mesin pencari..."
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">SEO Keywords</label>
            <input
              type="text"
              value={formData.seoKeywords}
              onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))}
              disabled={isFormDisabled}
              placeholder="review anime, berita dorama jepang, rekomendasi"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isFormDisabled}
          className="px-6 py-2.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Perbarui Artikel" : "Simpan Artikel"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-background-dark hover:bg-white/5 border border-border-dark text-white rounded-xl font-medium transition-colors cursor-pointer"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
