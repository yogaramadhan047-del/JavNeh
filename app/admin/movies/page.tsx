"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Film, Eye, Loader2 } from "lucide-react";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Movie } from "@/types/movie";
import { SafeImage } from "@/components/ui/safe-image";
import { getMovies, deleteMovie } from "@/lib/movies";
import { supabase } from "@/lib/supabase";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getMovies().then((data) => {
      if (isMounted) {
        setMovies(data);
        setLoading(false);
      }
    }).catch((err) => {
      console.error("Error loading movies:", err);
      if (isMounted) setLoading(false);
    });

    const channel = supabase
      .channel("admin-movies-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "movies" },
        () => {
          getMovies().then((data) => {
            if (isMounted) setMovies(data);
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
    if (!window.confirm(`Yakin ingin menghapus film "${title}"?`)) return;
    setDeletingId(id);
    try {
      const { success, error } = await deleteMovie(id);
      if (!success) {
        alert(error || "Gagal menghapus film.");
      } else {
        setMovies((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus film.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMovies = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.year.toString().includes(search) ||
      m.genres?.some((g) => g.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Anime" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Anime</h1>
          <p className="text-gray-400 text-sm">Kelola daftar serial dan film anime streaming.</p>
        </div>
        <Link
          href="/admin/movies/add"
          className="inline-flex items-center gap-2 bg-primary-blue hover:bg-primary-blue-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tambah Anime
        </Link>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Cari film berdasarkan judul, tahun, atau genre..."
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
        ) : filteredMovies.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium text-gray-400 mb-1">Tidak ada film ditemukan</p>
            <p className="text-sm">Klik tombol &ldquo;Tambah Movie&rdquo; untuk menambahkan film baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-background-dark/50 text-gray-200 border-b border-border-dark uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Gambar & Judul</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Tahun</th>
                  <th className="px-6 py-4">Badge / Resolusi</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="w-16 h-10 aspect-video bg-background-dark rounded overflow-hidden relative shrink-0 border border-border-dark">
                        {movie.bannerUrl || movie.posterUrl ? (
                          <SafeImage
                            src={movie.bannerUrl || movie.posterUrl}
                            alt={movie.title}
                            type="banner"
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white line-clamp-1">{movie.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{movie.genres?.join(", ") || "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          movie.category === "Drama Jepang"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-primary-blue/10 text-primary-blue border-primary-blue/20"
                        }`}
                      >
                        {movie.category || "Anime"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{movie.year}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {movie.badge ? (
                          <span className="px-2 py-0.5 bg-background-dark border border-border-dark rounded text-xs text-primary-blue font-medium">
                            {movie.badge}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                        {movie.resolution && (
                          <span className="text-[11px] text-gray-400 font-mono">
                            {movie.resolution}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        {movie.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          movie.status === "Published"
                            ? "bg-success/20 text-success"
                            : "bg-warning/20 text-warning"
                        }`}
                      >
                        {movie.status || "Published"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={movie.category === "Drama Jepang" ? `/drama-jepang/${movie.slug || movie.id}` : `/anime/${movie.slug || movie.id}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-white bg-background-dark hover:bg-white/10 border border-border-dark rounded-lg transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/movies/edit/${movie.id}`}
                          className="p-1.5 text-gray-400 hover:text-white bg-background-dark hover:bg-white/10 border border-border-dark rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          disabled={deletingId === movie.id}
                          className="p-1.5 text-danger hover:text-white bg-background-dark hover:bg-danger/20 border border-border-dark rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === movie.id ? (
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
