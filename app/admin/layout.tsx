"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Initial server-verified auth check
    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (user && !error) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          document.cookie = `admin_token=${session.access_token}; path=/; max-age=86400; secure; samesite=strict`;
        }
        setIsAuthenticated(true);
      } else {
        document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
        setIsAuthenticated(false);
        if (!isLoginPage) {
          router.replace("/admin/login");
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
        setIsAuthenticated(false);
        if (!isLoginPage) {
          router.replace("/admin/login");
        }
      } else if (session?.user) {
        if (session.access_token) {
          document.cookie = `admin_token=${session.access_token}; path=/; max-age=86400; secure; samesite=strict`;
        }
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  if (isAuthenticated === null && !isLoginPage) {
    return (
      <div className="admin-theme min-h-screen bg-background-dark text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <div className="admin-theme min-h-screen bg-background-dark text-white flex flex-col">
        {children}
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  return (
    <div className="admin-theme min-h-screen bg-background-dark text-white flex overflow-hidden">
      <AdminSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader
          setSidebarOpen={setIsSidebarOpen}
          isCollapsed={isCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
