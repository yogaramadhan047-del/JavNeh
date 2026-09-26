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
      className="w-full max-w-full flex items-center justify-between sm:justify-center gap-2 sm:gap-3 mt-10 pt-6 border-t border-border-dark overflow-hidden box-border"
    >
      {/* Tombol Sebelumnya */}
      {hasPrevPage ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-text-main text-xs sm:text-sm font-medium hover:border-primary-blue hover:text-primary-blue transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/50 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>Sebelumnya</span>
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-card-dark/50 border border-border-dark/50 text-text-muted/50 text-xs sm:text-sm font-medium cursor-not-allowed opacity-50 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>Sebelumnya</span>
        </button>
      )}

      {/* Info Halaman Aktif */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-card-dark border border-border-dark text-xs sm:text-sm text-text-muted shrink min-w-0 truncate text-center">
        <span>Hal</span>
        <span className="font-semibold text-text-main">{currentPage}</span>
        {totalPages && totalPages > 0 ? (
          <>
            <span>/</span>
            <span className="font-semibold text-text-main">{totalPages}</span>
          </>
        ) : null}
      </div>

      {/* Tombol Berikutnya */}
      {hasNextPage ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-text-main text-xs sm:text-sm font-medium hover:border-primary-blue hover:text-primary-blue transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/50 shrink-0"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-card-dark/50 border border-border-dark/50 text-text-muted/50 text-xs sm:text-sm font-medium cursor-not-allowed opacity-50 shrink-0"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      )}
    </nav>
  );
}
