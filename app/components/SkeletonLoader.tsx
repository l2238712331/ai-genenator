"use client";

export function SkeletonLoader() {
  return (
    <div className="space-y-4" aria-label="加载中">
      {/* Title skeleton */}
      <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-skeleton-pulse" />
      <div className="h-5 w-1/2 bg-gray-200 rounded-lg animate-skeleton-pulse" />

      {/* Section cards skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-skeleton-pulse" />
            <div className="h-6 w-1/3 bg-gray-200 rounded-lg animate-skeleton-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded animate-skeleton-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-skeleton-pulse" />
            <div className="h-4 w-4/6 bg-gray-100 rounded animate-skeleton-pulse" />
          </div>
        </div>
      ))}

      {/* Exercise skeleton */}
      <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 space-y-3">
        <div className="h-6 w-1/4 bg-amber-200 rounded-lg animate-skeleton-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-amber-100 rounded animate-skeleton-pulse" />
          <div className="h-4 w-5/6 bg-amber-100 rounded animate-skeleton-pulse" />
          <div className="h-4 w-3/4 bg-amber-100 rounded animate-skeleton-pulse" />
        </div>
      </div>
    </div>
  );
}
