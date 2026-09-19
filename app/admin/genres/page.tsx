"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Tag, Loader2 } from "lucide-react";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Genre } from "@/types/genre";
import { getGenres, deleteGenre } from "@/lib/genres";
import { supabase } from "@/lib/supabase";

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const data = await getGenres();
      if (isMounted) {
        setGenres(data);
        setLoading(false);
      }
    };

    loadData();

    const channel = supabase
      .channel("admin-genres-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "genres" },
        () => {
          getGenres().then((data) => {
            if (isMounted) setGenres(data);
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus genre "${name}"?`)) return;
    setDeletingId(id);
    try {
      const { success, error } = await deleteGenre(id);
      if (!success) {
        alert(error || "Gagal menghapus genre.");
      } else {
        setGenres((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus genre.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGenres = genres.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.slug && g.slug.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Genres" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Genres</h1>
          <p className="text-gray-400 text-sm">Kelola daftar kategori & genre film.</p>
        </div>
        <Link
          href="/admin/genres/add"
          className="inline-flex items-center gap-2 bg-primary-blue hover:bg-primary-blue-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tambah Genre
        </Link>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Cari genre..."
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
        ) : filteredGenres.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium text-gray-400 mb-1">Tidak ada genre ditemukan</p>
            <p className="text-sm">Klik tombol &ldquo;Tambah Genre&rdquo; untuk membuat kategori baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-background-dark/50 text-gray-200 border-b border-border-dark uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Nama Genre</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filteredGenres.map((genre) => (
                  <tr key={genre.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary-blue" />
                      {genre.name}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{genre.slug}</td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{genre.description || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/genres/edit/${genre.id}`}
                          className="p-1.5 text-gray-400 hover:text-white bg-background-dark hover:bg-white/10 border border-border-dark rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(genre.id, genre.name)}
                          disabled={deletingId === genre.id}
                          className="p-1.5 text-danger hover:text-white bg-background-dark hover:bg-danger/20 border border-border-dark rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === genre.id ? (
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
