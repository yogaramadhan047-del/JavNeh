"use client";

import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { supabase } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/settings";
import { mapArticleFromDb } from "@/lib/articles";
import { RefreshCw, FileText, Eye, Database, Users, AlertCircle, CheckCircle } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { Article } from "@/types/article";
import Link from "next/link";

interface AnalyticsData {
  overview: {
    totalArticles: number;
    totalArticleViews: number;
    totalStorage: string;
  };
  topArticles: Article[];
  recentArticles: Article[];
  articlesByStatus: { status: string; count: number }[];
  googleAnalyticsId: string;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      const [countRes, viewsRes, settings, topArticlesRes, recentArticlesRes, statusRes] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("views"),
        getSiteSettings(),
        supabase.from("articles").select("*").order("views", { ascending: false }).limit(10),
        supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("articles").select("status"),
      ]);

      const totalArticles = countRes.count || 0;
      let totalArticleViews = 0;
      if (viewsRes.data) {
        totalArticleViews = viewsRes.data.reduce((acc, row: any) => acc + (Number(row.views) || 0), 0);
      }

      const googleAnalyticsId = settings.googleAnalyticsId || "";

      const topArticles = (topArticlesRes.data || []).map((row) => mapArticleFromDb(row));
      const recentArticles = (recentArticlesRes.data || []).map((row) => mapArticleFromDb(row));

      const statusMap: Record<string, number> = { Published: 0, Draft: 0 };
      (statusRes.data || []).forEach((row: any) => {
        const s = row.status || "Draft";
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      const articlesByStatus = Object.keys(statusMap).map((s) => ({ status: s, count: statusMap[s] }));

      setData({
        overview: {
          totalArticles,
          totalArticleViews,
          totalStorage: "Supabase Cloud",
        },
        topArticles,
        recentArticles,
        articlesByStatus,
        googleAnalyticsId,
      });
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data Analytics. Periksa koneksi Anda.");
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      await loadData();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
      showToast("Refresh berhasil.", "success");
    } catch {
      showToast("Terjadi kesalahan.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Analytics" }]} />
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card-dark border border-border-dark p-6 rounded-xl animate-pulse h-28"></div>
          ))}
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Analytics" }]} />
        <div className="bg-card-dark border border-border-dark rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[50vh]">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-400 mb-6">{error || "Data tidak ditemukan."}</p>
          <button
            onClick={() => {
              setLoading(true);
              loadData().finally(() => setLoading(false));
            }}
            className="px-6 py-2 bg-primary-blue text-white rounded-xl hover:bg-primary-blue-hover transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      </>
    );
  }

  const { overview, topArticles, googleAnalyticsId } = data;

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
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}
      <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Analytics" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-primary-blue" />
          Analytics
        </h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-background-dark border border-border-dark text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      {/* Visitor Banner */}
      <div
        className={`border rounded-xl p-4 mb-8 flex items-center justify-between ${
          googleAnalyticsId ? "bg-success/10 border-success/20" : "bg-warning/10 border-warning/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              googleAnalyticsId ? "bg-success/20" : "bg-warning/20"
            }`}
          >
            <Users className={`w-5 h-5 ${googleAnalyticsId ? "text-success" : "text-warning"}`} />
          </div>
          <div>
            <h3 className="font-bold text-white">Google Analytics</h3>
            <p className="text-sm text-gray-400">{googleAnalyticsId ? "Ready" : "Not Connected"}</p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            googleAnalyticsId ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
          }`}
        >
          {googleAnalyticsId ? "Ready" : "Waiting Google Analytics"}
        </span>
      </div>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-card-dark border border-border-dark p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm font-medium">Visitor Online</span>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">--</div>
          <div className="text-[10px] text-gray-500">Waiting Google Analytics</div>
        </div>
        <div className="bg-card-dark border border-border-dark p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm font-medium">Visitor Hari Ini</span>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">--</div>
          <div className="text-[10px] text-gray-500">Waiting Google Analytics</div>
        </div>
        <div className="bg-card-dark border border-border-dark p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm font-medium">Visitor Bulan Ini</span>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">--</div>
          <div className="text-[10px] text-gray-500">Waiting Google Analytics</div>
        </div>
        <div className="bg-card-dark border border-border-dark p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm font-medium">Visitor Tahun Ini</span>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">--</div>
          <div className="text-[10px] text-gray-500">Waiting Google Analytics</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/articles"
          className="bg-card-dark border border-border-dark p-5 rounded-xl hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm font-medium">Articles</span>
            <FileText className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{overview.totalArticles.toLocaleString()}</div>
        </Link>
        <div className="bg-card-dark border border-border-dark p-5 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm font-medium">Article Views</span>
            <Eye className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{overview.totalArticleViews.toLocaleString()}</div>
        </div>
        <div className="bg-card-dark border border-border-dark p-5 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm font-medium">Storage</span>
            <Database className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{overview.totalStorage}</div>
        </div>
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border-dark">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Top 10 Articles
            </h2>
          </div>
          <div className="divide-y divide-border-dark">
            {topArticles.length > 0 ? (
              topArticles.map((article, index) => (
                <div key={article.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className="text-xl font-bold text-gray-500 w-6 text-center">{index + 1}</div>
                  <div className="w-16 h-12 relative bg-background-dark rounded shrink-0 overflow-hidden">
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
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{article.title}</h3>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {article.views?.toLocaleString() || 0}
                      </span>
                      <span>•</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          article.status === "Published" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                        }`}
                      >
                        {article.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">Belum ada article.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
