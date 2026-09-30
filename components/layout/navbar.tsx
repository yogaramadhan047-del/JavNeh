"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarBanner } from "@/components/ads/placements";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movie" },
  { href: "/artikel", label: "Artikel" },
];

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-background-dark/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity flex items-center"
            >
              <span className="text-white">XStream</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-blue-400">21</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "transition-colors hover:text-text-main relative",
                      isActive
                        ? "text-white font-semibold after:absolute after:-bottom-[21px] after:left-0 after:w-full after:h-0.5 after:bg-primary-blue after:rounded-full"
                        : "text-text-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/search" className="text-text-muted hover:text-text-main transition-colors p-2" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <button
              className="text-text-muted hover:text-text-main transition-colors md:hidden p-2 cursor-pointer"
              aria-label="Open Menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={cn(
            "fixed inset-y-0 right-0 w-72 bg-card-dark border-l border-border-dark p-6 shadow-2xl transition-transform duration-300 flex flex-col",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-bold text-primary-blue">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-text-muted hover:text-text-main p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue rounded cursor-pointer"
              aria-label="Close Menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {MOBILE_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors p-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue",
                    isActive ? "text-primary-blue bg-primary-blue/10" : "text-text-muted-hover hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium transition-colors p-3 rounded-xl text-text-muted-hover hover:text-text-main hover:bg-white/5 mt-4 border-t border-border-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue"
            >
              Admin Login
            </Link>
          </nav>
          <div className="mt-8 pt-4 border-t border-border-dark">
            <SidebarBanner />
          </div>
        </div>
      </div>
    </>
  );
}
