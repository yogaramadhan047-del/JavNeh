import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MovieCardSkeleton } from "@/components/ui/movie-card-skeleton";

export default function MoviesLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Movies" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 animate-pulse">
        <div>
          <div className="h-8 bg-gray-800 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-64"></div>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 w-24 bg-gray-800 rounded-full shrink-0"></div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
