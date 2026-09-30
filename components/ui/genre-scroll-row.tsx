import Link from "next/link";

interface GenreScrollRowProps {
  genres: { id: string; name: string }[];
  activeGenre?: string;
  baseUrl?: string;
  allLabel?: string;
}

export function GenreScrollRow({
  genres,
  activeGenre,
  baseUrl = "/movies",
  allLabel = "Semua",
}: GenreScrollRowProps) {
  if (!genres || genres.length === 0) return null;
  return (
    <div className="w-full overflow-x-auto pb-4 mb-4 md:mb-8 scrollbar-hide">
      <div className="flex items-center gap-2 min-w-max px-4 md:px-0">
        <Link
          href={baseUrl}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            !activeGenre
              ? "bg-primary-blue text-white shadow-md"
              : "bg-card-dark text-text-muted hover:text-white hover:bg-white/10 border border-border-dark"
          }`}
        >
          {allLabel}
        </Link>
        {genres.map((g) => (
          <Link
            key={g.id}
            href={`${baseUrl}?genre=${encodeURIComponent(g.name)}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeGenre === g.name
                ? "bg-primary-blue text-white shadow-md"
                : "bg-card-dark text-text-muted hover:text-white hover:bg-white/10 border border-border-dark"
            }`}
          >
            {g.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
