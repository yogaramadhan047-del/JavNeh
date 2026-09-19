"use client";

import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Check, X, Trash2, CheckCircle, XCircle, Search } from "lucide-react";
import Link from "next/link";

interface MovieComment {
  id: string;
  movieId: string;
  name: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

function mapCommentRow(row: any): MovieComment {
  const rawStatus = (row.status || "pending").toLowerCase();
  const validStatus = rawStatus === "approved" || rawStatus === "rejected" ? rawStatus : "pending";
  return {
    id: String(row.id),
    movieId: row.movie_id || row.movieId || row.article_id || "-",
    name: row.author_name || row.name || "Anonymous",
    comment: row.content || row.comment || "",
    status: validStatus,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && isMounted && data) {
          setComments(data.map(mapCommentRow));
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadComments();

    const channel = supabase
      .channel("admin-comments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          void loadComments();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      showToast(newStatus === "approved" ? "Komentar berhasil disetujui." : "Komentar ditolak.", "success");
    } catch (error) {
      console.error("Error updating comment:", error);
      showToast("Gagal memperbarui status komentar.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;
    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;

      setComments((prev) => prev.filter((c) => c.id !== id));
      showToast("Komentar berhasil dihapus.", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Gagal menghapus komentar.", "error");
    }
  };

  const filteredComments = comments.filter((comment) => {
    const matchesFilter = filter === "all" || comment.status === filter;
    const matchesSearch =
      (comment.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.movieId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.comment || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="relative">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-success/20 text-success border border-success/30"
              : "bg-error/20 text-error border border-error/30"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}
      <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Comments" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary-blue" />
            Manage Comments
          </h1>
          <p className="text-gray-400 text-sm">Review and moderate user comments.</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex items-center bg-background-dark border border-border-dark rounded-xl px-4 py-2 w-full md:w-96">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by name, movie, or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-gray-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filter === f
                  ? "bg-primary-blue text-white border-primary-blue"
                  : "bg-card-dark text-gray-400 hover:text-white border-border-dark"
              } border`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-dark/50 border-b border-border-dark">
                <th className="p-4 font-medium text-gray-400 text-sm">Date</th>
                <th className="p-4 font-medium text-gray-400 text-sm">Movie / Target</th>
                <th className="p-4 font-medium text-gray-400 text-sm">Name</th>
                <th className="p-4 font-medium text-gray-400 text-sm w-1/3">Comment</th>
                <th className="p-4 font-medium text-gray-400 text-sm">Status</th>
                <th className="p-4 font-medium text-gray-400 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Loading comments...
                  </td>
                </tr>
              ) : filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Belum ada komentar.
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <tr key={comment.id} className="border-b border-border-dark hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="p-4">
                      {comment.movieId && comment.movieId !== "-" ? (
                        <Link
                          href={`/anime/${comment.movieId}`}
                          target="_blank"
                          className="text-primary-blue hover:underline font-medium text-sm"
                        >
                          {comment.movieId}
                        </Link>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-white font-medium text-sm">{comment.name}</td>
                    <td className="p-4 text-gray-300 text-sm">{comment.comment}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          comment.status === "approved"
                            ? "bg-success/20 text-success"
                            : comment.status === "rejected"
                            ? "bg-error/20 text-error"
                            : "bg-warning/20 text-warning"
                        }`}
                      >
                        {comment.status === "approved"
                          ? "Approved"
                          : comment.status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {comment.status !== "approved" && (
                          <button
                            onClick={() => handleUpdateStatus(comment.id, "approved")}
                            className="p-2 text-success hover:bg-success/20 rounded-lg transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {comment.status !== "rejected" && (
                          <button
                            onClick={() => handleUpdateStatus(comment.id, "rejected")}
                            className="p-2 text-warning hover:bg-warning/20 rounded-lg transition-colors cursor-pointer"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
