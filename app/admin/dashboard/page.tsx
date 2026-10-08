"use client";

import Link from "next/link";
import { FileText, Eye, Users, HardDrive, Plus, Database, Film, MessageSquare, Tv } from "lucide-react";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [totalArticles, setTotalArticles] = useState<number | null>(null);
  const [totalMovies, setTotalMovies] = useState<number | null>(null);
  const [totalComments, setTotalComments] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [articlesRes, moviesRes, commentsRes] = await Promise.all([
          supabase.from("articles").select("*", { count: "exact", head: true }),
          supabase.from("movies").select("*", { count: "exact", head: true }),
          supabase.from("comments").select("*", { count: "exact", head: true }),
        ]);

        setTotalArticles(articlesRes.count ?? 0);
        setTotalMovies(moviesRes.count ?? 0);
        setTotalComments(commentsRes.count ?? 0);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <AdminBreadcrumb items={[{ label: "Dashboard" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm">Welcome back to JavNeh CMS!</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
        <Link
          href="/admin/articles"
          className="bg-card-dark border border-border-dark p-6 rounded-xl hover:border-success/50 hover:bg-white/5 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center text-success group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium mb-1">Total Articles</p>
          <p className="text-2xl font-bold text-white">{totalArticles !== null ? totalArticles : "-"}</p>
        </Link>
        <Link
          href="/admin/movies"
          className="bg-card-dark border border-border-dark p-6 rounded-xl group hover:bg-white/5 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-primary-blue/20 rounded-lg flex items-center justify-center text-primary-blue group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium mb-1">Total Movies</p>
          <p className="text-2xl font-bold text-white">{totalMovies !== null ? totalMovies : "-"}</p>
        </Link>
        <Link
          href="/admin/comments"
          className="bg-card-dark border border-border-dark p-6 rounded-xl group hover:bg-white/5 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium mb-1">Total Comments</p>
          <p className="text-2xl font-bold text-white">{totalComments !== null ? totalComments : "-"}</p>
        </Link>

        <div className="bg-card-dark border border-border-dark p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center text-warning">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium mb-1">Total Views</p>
          <p className="text-sm font-medium text-gray-500 mt-2">Waiting Google Analytics</p>
        </div>
        <div className="bg-card-dark border border-border-dark p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium mb-1">Visitors</p>
          <p className="text-sm font-medium text-gray-500 mt-2">Waiting Google Analytics</p>
        </div>
      </div>
      <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border-dark">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <p className="text-gray-400 text-sm mt-1">Shortcuts to common administrative tasks</p>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/articles/add"
            className="flex flex-col items-center justify-center p-4 bg-background-dark border border-border-dark rounded-xl hover:border-success hover:text-success transition-colors group text-center gap-3"
          >
            <div className="w-10 h-10 bg-card-dark rounded-full flex items-center justify-center group-hover:bg-success/10">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Tambah Artikel</span>
          </Link>
          <Link
            href="/admin/movies/add"
            className="flex flex-col items-center justify-center p-4 bg-background-dark border border-border-dark rounded-xl hover:border-primary-blue hover:text-primary-blue transition-colors group text-center gap-3"
          >
            <div className="w-10 h-10 bg-card-dark rounded-full flex items-center justify-center group-hover:bg-primary-blue/10">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Tambah Movie</span>
          </Link>
          <button className="flex flex-col items-center justify-center p-4 bg-background-dark border border-border-dark rounded-xl hover:border-gray-300 hover:text-white transition-colors group text-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-card-dark rounded-full flex items-center justify-center group-hover:bg-white/10">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Backup Database</span>
          </button>
        </div>
      </div>
    </>
  );
}
