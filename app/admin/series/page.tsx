"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Tv, Loader2, Eye } from "lucide-react";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Series } from "@/types/series";
import { SafeImage } from "@/components/ui/safe-image";
import { getSeriesList, deleteSeries } from "@/lib/series";
import { supabase } from "@/lib/supabase";

export default function SeriesAdminPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getSeriesList()
      .then((data) => {
        if (isMounted) {
          setSeriesList(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading series:", err);
        if (isMounted) setLoading(false);
      });

    const channel = supabase
      .channel("admin-series-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "series" },
        () => {
          getSeriesList().then((data) => {
            if (isMounted) setSeriesList(data);
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus series "${title}"?`)) return;
    setDeletingId(id);
    try {
      const { success, error } = await deleteSeries(id);
      if (!success) {
        alert(error || "Gagal menghapus series.");
      } else {
        setSeriesList((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus series.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSeries = seriesList.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.year && s.year.toString().includes(search)) ||
      s.genres?.some((g) => g.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Drama Jepang" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Drama Jepang (Dorama)</h1>
          <p className="text-gray-400 text-sm">Kelola serial dorama dan series drama Jepang.</p>
        </div>
        <Link
          href="/admin/series/add"
          className="inline-flex items-center gap-2 bg-primary-blue hover:bg-primary-blue-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tambah Drama
        </Link>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Cari series berdasarkan judul atau genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-blue"
          />
        </div>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Tv className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium text-gray-400 mb-1">Tidak ada series ditemukan</p>
            <p className="text-sm">Klik tombol &ldquo;Tambah Series&rdquo; untuk menambahkan serial baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-background-dark/50 text-gray-200 border-b border-border-dark uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Gambar & Judul</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Badge / Resolusi</th>
                  <th className="px-6 py-4">Seasons / Episodes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filteredSeries.map((series) => (
                  <tr key={series.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="w-16 h-10 aspect-video bg-background-dark rounded overflow-hidden relative shrink-0 border border-border-dark">
                        {series.bannerUrl || series.posterUrl ? (
                          <SafeImage
                            src={series.bannerUrl || series.posterUrl}
                            alt={series.title}
                            type="banner"
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tv className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white line-clamp-1">{series.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {series.year ? `${series.year} • ` : ""}
                          {series.genres?.join(", ") || "Series"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          series.category === "Anime"
                            ? "bg-primary-blue/10 text-primary-blue border-primary-blue/20"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}
                      >
                        {series.category || "Drama Jepang"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {series.badge ? (
                          <span className="px-2 py-0.5 bg-background-dark border border-border-dark rounded text-xs text-primary-blue font-medium">
                            {series.badge}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                        {series.resolution && (
                          <span className="text-[11px] text-gray-400 font-mono">
                            {series.resolution}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {series.totalSeasons || 1} Season • {series.totalEpisodes || series.episodes?.length || 1} Eps
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          series.status === "Completed"
                            ? "bg-success/20 text-success"
                            : "bg-primary-blue/20 text-primary-blue"
                        }`}
                      >
                        {series.status || "Ongoing"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={series.category === "Anime" ? `/anime/${series.slug || series.id}` : `/drama-jepang/${series.slug || series.id}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-white bg-background-dark hover:bg-white/10 border border-border-dark rounded-lg transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/series/edit/${series.id}`}
                          className="p-1.5 text-gray-400 hover:text-white bg-background-dark hover:bg-white/10 border border-border-dark rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(series.id, series.title)}
                          disabled={deletingId === series.id}
                          className="p-1.5 text-danger hover:text-white bg-background-dark hover:bg-danger/20 border border-border-dark rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === series.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
