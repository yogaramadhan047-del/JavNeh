import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  baseUrl: string;
  searchParams?: Record<string, string | undefined>;
  totalPages?: number;
}

export function Pagination({
  currentPage,
  hasNextPage,
  baseUrl,
  searchParams = {},
  totalPages,
}: PaginationProps) {
  const hasPrevPage = currentPage > 1;

  // Helper to build URL with preserved search params
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page" && value) {
        params.set(key, value);
      }
    }
    if (page > 1) {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  return (
    <nav
      aria-label="Navigasi Halaman"
      className="flex items-center justify-between sm:justify-center gap-3 mt-10 pt-6 border-t border-border-dark"
    >
      {/* Tombol Sebelumnya */}
      {hasPrevPage ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-text-main text-sm font-medium hover:border-primary-blue hover:text-primary-blue transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card-dark/50 border border-border-dark/50 text-text-muted/50 text-sm font-medium cursor-not-allowed opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>
      )}

      {/* Info Halaman Aktif */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-dark border border-border-dark text-xs sm:text-sm text-text-muted">
        <span>Halaman</span>
        <span className="font-semibold text-text-main">{currentPage}</span>
        {totalPages && totalPages > 0 ? (
          <>
            <span>dari</span>
            <span className="font-semibold text-text-main">{totalPages}</span>
          </>
        ) : null}
      </div>

      {/* Tombol Berikutnya */}
      {hasNextPage ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-text-main text-sm font-medium hover:border-primary-blue hover:text-primary-blue transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card-dark/50 border border-border-dark/50 text-text-muted/50 text-sm font-medium cursor-not-allowed opacity-50"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
}
