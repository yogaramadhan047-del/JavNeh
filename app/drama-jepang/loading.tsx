import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function DramaJepangLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Drama Jepang" }]} />
      </div>

      {/* Title Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="h-8 bg-card-dark rounded-lg w-56 mb-2"></div>
          <div className="h-4 bg-card-dark rounded w-80"></div>
        </div>
      </div>

      {/* Genre Pills Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-card-dark rounded-full shrink-0"></div>
        ))}
      </div>

      {/* Drama Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-video w-full bg-card-dark rounded-xl"></div>
            <div className="h-4 bg-card-dark rounded w-3/4"></div>
            <div className="h-3 bg-card-dark rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
