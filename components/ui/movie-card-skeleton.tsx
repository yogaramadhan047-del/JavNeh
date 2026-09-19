export function MovieCardSkeleton() {
  return (
    <div className="block bg-card-dark rounded-xl overflow-hidden border border-border-dark animate-pulse shadow-sm">
      <div className="relative aspect-video w-full bg-gray-800/50"></div>
      <div className="p-3">
        <div className="h-4 bg-gray-800/80 rounded w-3/4 mb-2"></div>
        <div className="flex items-center justify-between mt-1">
          <div className="h-3 bg-gray-800/80 rounded w-8"></div>
          <div className="h-3 bg-gray-800/80 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

