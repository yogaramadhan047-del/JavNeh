"use client";

import { useState, useEffect } from "react";
import { Menu, Search, Bell, User, Settings, LogOut, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AdminHeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
  isCollapsed?: boolean;
}

export function AdminHeader({ setSidebarOpen }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState("Loading...");
  const router = useRouter();

  useEffect(() => {
    const checkMovieCount = async () => {
      try {
        const { count, error } = await supabase
          .from("movies")
          .select("*", { count: "exact", head: true });
        if (!error && count && count > 0) {
          setSearchPlaceholder("Cari Anime, Drama, Artikel...");
        } else {
          setSearchPlaceholder("Cari Artikel...");
        }
      } catch {
        setSearchPlaceholder("Cari Artikel...");
      }
    };

    checkMovieCount();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
    window.location.href = "/admin/login";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  return (
    <header className="h-16 bg-card-dark border-b border-border-dark flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button
          className="md:hidden text-gray-400 hover:text-white p-1 cursor-pointer"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Global Search */}
        <div className="relative w-full max-w-md hidden sm:block">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary-blue transition-colors" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery) setShowSearchResults(true);
              }}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="w-full bg-background-dark border border-border-dark rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-blue transition-all"
            />
          </form>
          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card-dark border border-border-dark rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Hasil Pencarian</div>
              <ul className="max-h-64 overflow-y-auto">
                <li>
                  <Link
                    href={`/admin/articles?search=${encodeURIComponent(searchQuery)}`}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-border-dark"
                  >
                    <div className="w-8 h-8 bg-success/20 rounded flex items-center justify-center text-success">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{searchQuery} (Article)</div>
                      <div className="text-xs text-gray-500">Cari di Artikel</div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-4 ml-4">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-card-dark"></span>
        </button>
        <div className="relative">
          <button
            className="flex items-center gap-2 p-1 pr-2 rounded-full border border-border-dark bg-background-dark hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-blue to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
            <span className="text-sm font-medium hidden sm:block">Admin</span>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card-dark border border-border-dark rounded-xl shadow-2xl overflow-hidden py-1 z-50">
              <div className="px-4 py-3 border-b border-border-dark mb-1">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400 truncate">admin@xstream21.my.id</p>
              </div>
              <Link
                href="/admin/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <div className="border-t border-border-dark mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 w-full text-left transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
