"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Film,
  PlusSquare,
  FileText,
  FilePlus,
  Tags,
  Settings,
  LineChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  BadgeDollarSign,
  MessageSquare,
  Tv,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Movie", href: "/admin/movies", icon: Film },
  { label: "Add Movie", href: "/admin/movies/add", icon: PlusSquare },
  { label: "Genres", href: "/admin/genres", icon: Tags },
  { label: "Artikel", href: "/admin/articles", icon: FileText },
  { label: "Add Artikel", href: "/admin/articles/add", icon: FilePlus },
  { label: "Comments", href: "/admin/comments", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: LineChart },
  { label: "Advertisement", href: "/admin/advertisement", icon: BadgeDollarSign },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export function AdminSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card-dark border-r border-border-dark flex flex-col transition-all duration-300 md:relative",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-dark shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <Film className="w-8 h-8 text-primary-blue shrink-0" />
            {!isCollapsed && <span className="font-bold text-xl tracking-tight text-white whitespace-nowrap">JavNeh CMS</span>}
          </div>
          <button
            className="md:hidden text-gray-400 hover:text-white cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors group relative",
                  isActive
                    ? "bg-primary-blue text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border-dark">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 text-danger hover:bg-danger/10 rounded-xl transition-colors font-medium group cursor-pointer",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-4 top-20 w-8 h-8 bg-card-dark border border-border-dark rounded-full items-center justify-center text-gray-400 hover:text-white z-10 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  );
}
