"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, FileText, Eye, Loader2 } from "lucide-react";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Article } from "@/types/article";
import { SafeImage } from "@/components/ui/safe-image";
import { getArticles, deleteArticle } from "@/lib/articles";
import { supabase } from "@/lib/supabase";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getArticles().then((data) => {
      if (isMounted) {
        setArticles(data);
        setLoading(false);
      }
    }).catch((err) => {
      console.error("Error loading articles:", err);
      if (isMounted) setLoading(false);
    });

    // Setup Supabase Realtime for articles table
    const channel = supabase
      .channel("admin-articles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        () => {
          getArticles().then((data) => {
            if (isMounted) {
              setArticles(data);
            }
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
    if (!window.confirm(`Yakin ingin menghapus artikel "${title}"?`)) return;
    setDeletingId(id);
    try {
      const { success, error } = await deleteArticle(id);
      if (!success) {
        alert(error || "Gagal menghapus artikel.");
      } else {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus artikel.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(search.toLowerCase())) ||
      (a.author && a.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Artikel" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Artikel</h1>
          <p className="text-gray-400 text-sm">Kelola berita, review, dan artikel anime serta drama Jepang.</p>
        </div>
        <Link
          href="/admin/articles/add"
          className="inline-flex items-center gap-2 bg-primary-blue hover:bg-primary-blue-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tambah Artikel
        </Link>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Cari artikel berdasarkan judul, kategori, atau penulis..."
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
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium text-gray-400 mb-1">Tidak ada artikel ditemukan</p>
            <p className="text-sm">Klik tombol &ldquo;Tambah Artikel&rdquo; untuk membuat konten baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-background-dark/50 text-gray-200 border-b border-border-dark uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Thumbnail & Judul</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Penulis</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="w-16 h-10 bg-background-dark rounded overflow-hidden relative shrink-0 border border-border-dark">
                        {article.thumbnailUrl ? (
                          <SafeImage
                            src={article.thumbnailUrl}
                            alt={article.title}
                            type="thumbnail"
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-md">
                        <p className="font-semibold text-white line-clamp-1">{article.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{article.excerpt || "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <span className="px-2 py-0.5 bg-background-dark border border-border-dark rounded text-xs text-primary-blue font-medium">
                        {article.category || "News"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{article.author}</td>
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        {article.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          article.status === "Published"
                            ? "bg-success/20 text-success"
                            : "bg-warning/20 text-warning"
                        }`}
                      >
                        {article.status || "Published"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/artikel/${article.slug || article.id}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-white bg-background-dark hover:bg-white/10 border border-border-dark rounded-lg transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/articles/edit/${article.id}`}
                          className="p-1.5 text-gray-400 hover:text-white bg-background-dark hover:bg-white/10 border border-border-dark rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          disabled={deletingId === article.id}
                          className="p-1.5 text-danger hover:text-white bg-background-dark hover:bg-danger/20 border border-border-dark rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === article.id ? (
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
