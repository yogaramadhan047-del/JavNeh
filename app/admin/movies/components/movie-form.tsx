"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, Loader2 } from "lucide-react";
import { Movie, MovieServer, ContentCategory, BADGE_OPTIONS, RESOLUTION_OPTIONS } from "@/types/movie";
import { ImageUpload } from "./image-upload";
import { StreamingServers } from "./streaming-servers";
import { createMovie, updateMovie } from "@/lib/movies";
import { supabase } from "@/lib/supabase";

interface MovieFormProps {
  initialData?: Movie;
  isEdit?: boolean;
}

export function MovieForm({ initialData, isEdit = false }: MovieFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingCount, setUploadingCount] = useState(0);
  const [availableGenres, setAvailableGenres] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    category: (initialData?.category as ContentCategory) || ("Anime" as ContentCategory),
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    year: initialData?.year || new Date().getFullYear(),
    rating: initialData?.rating || 0,
    imdb: initialData?.imdb || 0,
    duration: initialData?.duration || "",
    resolution: initialData?.resolution || "1080p",
    badge: initialData?.badge || "",
    synopsis: initialData?.synopsis || "",
    genres: initialData?.genres || [],
    posterUrl: initialData?.posterUrl || "",
    bannerUrl: initialData?.bannerUrl || "",
    trailerUrl: initialData?.trailerUrl || "",
    downloadUrl: initialData?.downloadUrl || initialData?.realDownloadUrl || "",
    trapDownloadUrl: initialData?.trapDownloadUrl || "",
    realDownloadUrl: initialData?.realDownloadUrl || initialData?.downloadUrl || "",
    status: initialData?.status || "Published",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoKeywords: initialData?.seoKeywords || "",
  });

  const [servers, setServers] = useState<MovieServer[]>(initialData?.servers || []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data, error } = await supabase.from("genres").select("*").order("name", { ascending: true });
        if (!error && data && data.length > 0) {
          setAvailableGenres(data.map((g: { id: string | number; name: string }) => ({ id: String(g.id), name: g.name })));
        } else {
          const defaultGenres = [
            "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
            "Drama", "Family", "Fantasy", "History", "Horror", "Music",
            "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western"
          ];
          setAvailableGenres(defaultGenres.map((name, i) => ({ id: String(i), name })));
        }
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  const generateSlug = (title: string, year: number) => {
    const cleanTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${cleanTitle}-${year}`;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEdit ? generateSlug(title, prev.year) : prev.slug,
    }));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      year,
      slug: !isEdit ? generateSlug(prev.title, year) : prev.slug,
    }));
  };

  const handleGenreToggle = (genreName: string) => {
    setFormData((prev) => {
      const exists = prev.genres.includes(genreName);
      return {
        ...prev,
        genres: exists ? prev.genres.filter((g) => g !== genreName) : [...prev.genres, genreName],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || (formData.category !== "Anime" && formData.category !== "Drama Jepang")) {
      setError("Kategori utama wajib dipilih secara eksplisit (Anime atau Drama Jepang).");
      return;
    }
    if (!formData.title) {
      setError("Judul film wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const singleImage = formData.bannerUrl || formData.posterUrl || "";

      if (isEdit && initialData?.id) {
        const { error: updateErr } = await updateMovie(initialData.id, {
          ...formData,
          posterUrl: singleImage,
          bannerUrl: singleImage,
          category: formData.category,
          servers,
        });
        if (updateErr) throw new Error(updateErr);
      } else {
        const { error: createErr } = await createMovie({
          ...formData,
          posterUrl: singleImage,
          bannerUrl: singleImage,
          category: formData.category,
          servers,
          views: 0,
          originalTitle: formData.title,
          releaseDate: `${formData.year}-01-01`,
          country: formData.category === "Anime" ? "Japan" : "Japan",
          language: "Japanese",
          subtitle: "Indonesia",
          studio: "",
          tags: [],
        });
        if (createErr) throw new Error(createErr);
      }

      router.push("/admin/movies");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Gagal menyimpan film.");
      } else {
        setError("Gagal menyimpan film.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = loading || uploadingCount > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. Classification & Category */}
      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">1. Klasifikasi Konten</h2>
        <div className="p-4 bg-background-dark/80 border border-primary-blue/30 rounded-xl space-y-2">
          <label className="block text-sm font-semibold text-white">
            Kategori Utama <span className="text-danger">* (Wajib Dipilih)</span>
          </label>
          <p className="text-xs text-text-muted">
            Konten akan secara otomatis diposisikan ke halaman Anime atau Drama Jepang berdasarkan kategori ini tanpa perlu memilih manual.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              disabled={isFormDisabled}
              onClick={() => setFormData((prev) => ({ ...prev, category: "Anime" }))}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                formData.category === "Anime"
                  ? "bg-primary-blue/15 border-primary-blue text-white shadow-sm ring-1 ring-primary-blue"
                  : "bg-card-dark border-border-dark text-gray-400 hover:text-white hover:border-gray-600"
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-white">Anime</p>
                <p className="text-xs text-text-muted">Otomatis muncul di tab Anime & beranda</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  formData.category === "Anime" ? "border-primary-blue bg-primary-blue" : "border-gray-600"
                }`}
              >
                {formData.category === "Anime" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>

            <button
              type="button"
              disabled={isFormDisabled}
              onClick={() => setFormData((prev) => ({ ...prev, category: "Drama Jepang" }))}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                formData.category === "Drama Jepang"
                  ? "bg-primary-blue/15 border-primary-blue text-white shadow-sm ring-1 ring-primary-blue"
                  : "bg-card-dark border-border-dark text-gray-400 hover:text-white hover:border-gray-600"
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-white">Drama Jepang</p>
                <p className="text-xs text-text-muted">Otomatis muncul di tab Drama Jepang & beranda</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  formData.category === "Drama Jepang" ? "border-primary-blue bg-primary-blue" : "border-gray-600"
                }`}
              >
                {formData.category === "Drama Jepang" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">Status Publikasi</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            disabled={isFormDisabled}
            className="w-full sm:w-60 bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
          >
            <option value="Published">Published (Tampil di Publik & Sitemap)</option>
            <option value="Draft">Draft (Disembunyikan)</option>
          </select>
        </div>
      </div>

      {/* 2. Basic Info */}
      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white mb-4">2. Informasi Dasar</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Judul Film <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              disabled={isFormDisabled}
              placeholder="Contoh: Kimi no Na wa"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
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
              placeholder="kimi-no-na-wa-2016"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tahun Rilis</label>
            <input
              type="number"
              value={formData.year}
              onChange={handleYearChange}
              disabled={isFormDisabled}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Rating (1-10)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.rating}
              onChange={(e) => setFormData((prev) => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
              disabled={isFormDisabled}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Durasi</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
              disabled={isFormDisabled}
              placeholder="Contoh: 1h 46m"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Badge</label>
            <select
              value={formData.badge}
              onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
              disabled={isFormDisabled}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            >
              <option value="">Tanpa Badge (Opsional)</option>
              {BADGE_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
              {formData.badge && !BADGE_OPTIONS.includes(formData.badge as any) && (
                <option value={formData.badge}>{formData.badge} (Lama)</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Resolusi</label>
            <select
              value={formData.resolution}
              onChange={(e) => setFormData((prev) => ({ ...prev, resolution: e.target.value }))}
              disabled={isFormDisabled}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
            >
              <option value="">Pilih Resolusi (Opsional)</option>
              {RESOLUTION_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              {formData.resolution && !RESOLUTION_OPTIONS.includes(formData.resolution as any) && (
                <option value={formData.resolution}>{formData.resolution}</option>
              )}
            </select>
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Genres</label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-background-dark/50 border border-border-dark rounded-xl">
            {availableGenres.map((genre) => {
              const selected = formData.genres.includes(genre.name);
              return (
                <button
                  type="button"
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.name)}
                  disabled={isFormDisabled}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selected
                      ? "bg-primary-blue text-white"
                      : "bg-card-dark text-gray-400 hover:text-white border border-border-dark"
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Synopsis */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Sinopsis</label>
          <textarea
            rows={4}
            value={formData.synopsis}
            onChange={(e) => setFormData((prev) => ({ ...prev, synopsis: e.target.value }))}
            disabled={isFormDisabled}
            placeholder="Tuliskan ringkasan cerita film..."
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
          />
        </div>
      </div>

      {/* 3. Media & Uploads */}
      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">3. Media Gambar</h2>
        <p className="text-xs text-text-muted mb-4">
          Unggah 1 gambar landscape (16:9). Gambar ini otomatis digunakan untuk kartu konten, carousel beranda, latar pemutar, dan Open Graph media sosial. Maksimal ukuran file 5MB.
        </p>
        <div className="max-w-xl">
          <ImageUpload
            label="Landscape Image (16:9)"
            value={formData.bannerUrl || formData.posterUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, bannerUrl: url, posterUrl: url }))}
            aspectRatio="16/9"
            path="movies/landscape"
            maxSizeMB={5}
            onUploadStart={() => setUploadingCount((prev) => prev + 1)}
            onUploadEnd={() => setUploadingCount((prev) => Math.max(0, prev - 1))}
            onError={(msg) => setError(msg)}
            disabled={isFormDisabled}
          />
        </div>
      </div>

      {/* 4. Streaming & Video Servers */}
      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">4. Server Streaming & Tautan Video</h2>
        <StreamingServers
          servers={servers}
          onChange={setServers}
          disabled={isFormDisabled}
        />

        {/* Download URL */}
        <div className="pt-4 border-t border-border-dark">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            URL Download Eksternal (Opsional)
          </label>
          <p className="text-xs text-text-muted mb-2">
            Masukkan link download eksternal (misal: Google Drive, Mega, MediaFire). Tombol Download akan otomatis tampil di halaman konten jika kolom ini diisi.
          </p>
          <input
            type="url"
            value={formData.downloadUrl}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                downloadUrl: e.target.value,
                realDownloadUrl: e.target.value,
              }))
            }
            disabled={isFormDisabled}
            placeholder="Contoh: https://drive.google.com/... atau https://mega.nz/..."
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-blue text-sm"
          />
        </div>
      </div>

      {/* 5. SEO & Metadata */}
      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">5. Optimasi SEO & Metadata</h2>
        <p className="text-xs text-text-muted mb-4">
          Data SEO yang diinputkan di sini langsung dipakai oleh Googlebot, OpenGraph, dan Twitter Card.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">SEO Title Kustom</label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
              disabled={isFormDisabled}
              placeholder="Contoh: Nonton Kimi no Na wa Sub Indo Kualitas HD - JavNeh"
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
              placeholder="Deskripsi ringkas untuk snippet hasil pencarian Google (150-160 karakter)..."
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
              placeholder="anime sub indo, nonton kimi no na wa, stream anime hd"
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
          {isEdit ? "Perbarui Film" : "Simpan Film"}
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
