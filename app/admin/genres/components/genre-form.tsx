"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, Loader2 } from "lucide-react";
import { Genre } from "@/types/genre";
import { createGenre, updateGenre } from "@/lib/genres";

interface GenreFormProps {
  initialData?: Genre;
  isEdit?: boolean;
}

export function GenreForm({ initialData, isEdit = false }: GenreFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !isEdit ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Nama genre wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const dataToSave = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        icon: initialData?.icon || "",
        color: initialData?.color || "",
      };

      if (isEdit && initialData?.id) {
        const { error: updateErr } = await updateGenre(initialData.id, dataToSave);
        if (updateErr) throw new Error(updateErr);
      } else {
        const { error: createErr } = await createGenre(dataToSave);
        if (createErr) throw new Error(createErr);
      }

      router.push("/admin/genres");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Gagal menyimpan genre.");
      } else {
        setError("Gagal menyimpan genre.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Nama Genre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Contoh: Action"
            className="w-full px-4 py-2.5 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-blue transition-all"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Slug URL</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="action"
            className="w-full px-4 py-2.5 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-blue transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Deskripsi Singkat</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Deskripsi tentang genre ini..."
            className="w-full px-4 py-2.5 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-blue transition-all resize-none"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Perbarui Genre" : "Simpan Genre"}
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
