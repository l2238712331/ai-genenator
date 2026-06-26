"use client";

export function SkeletonLoader() {
  return (
    <div className="space-y-4" aria-label="加载中">
      {/* Title skeleton */}
      <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-skeleton-pulse" />
      <div className="h-5 w-1/2 bg-gray-200 rounded-lg animate-skeleton-pulse" />

      {/* Core Objectives skeleton */}
      <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-blue-50/30 overflow-hidden">
        <div className="bg-indigo-100/40 px-5 py-2.5 border-b border-indigo-100">
          <div className="h-5 w-44 bg-indigo-200 rounded animate-skeleton-pulse" />
        </div>
        <div className="p-5 space-y-3">
          {/* Vocab chip grid */}
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-skeleton-pulse" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-white rounded-lg border border-gray-100 animate-skeleton-pulse" />
              ))}
            </div>
          </div>
          {/* Structures */}
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-skeleton-pulse" />
            <div className="space-y-1.5">
              <div className="h-6 w-3/4 bg-gray-100 rounded animate-skeleton-pulse" />
              <div className="h-6 w-2/3 bg-gray-100 rounded animate-skeleton-pulse" />
            </div>
          </div>
          {/* Key/Diff points */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-green-50 rounded-xl border border-green-100 animate-skeleton-pulse" />
            <div className="h-16 bg-orange-50 rounded-xl border border-orange-100 animate-skeleton-pulse" />
          </div>
        </div>
      </div>

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
        </div>
      </div>

      {/* Quiz skeleton */}
      <div className="rounded-2xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-5 py-2.5 border-b border-gray-200">
          <div className="h-5 w-40 bg-gray-200 rounded animate-skeleton-pulse" />
        </div>
        <div className="p-5 space-y-3">
          <div className="h-4 w-3/4 bg-gray-100 rounded animate-skeleton-pulse" />
          <div className="space-y-2 pl-4">
            <div className="h-4 w-1/2 bg-gray-50 rounded animate-skeleton-pulse" />
            <div className="h-4 w-2/5 bg-gray-50 rounded animate-skeleton-pulse" />
          </div>
        </div>
      </div>

      {/* Layered Homework skeleton */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 overflow-hidden">
        <div className="bg-emerald-100/60 px-5 py-2.5 border-b border-emerald-200">
          <div className="h-5 w-32 bg-emerald-200 rounded animate-skeleton-pulse" />
        </div>
        <div className="p-5 space-y-3">
          <div className="h-4 w-1/3 bg-emerald-100 rounded animate-skeleton-pulse" />
          <div className="h-12 w-full bg-white rounded-lg border border-emerald-100 animate-skeleton-pulse" />
          <div className="h-4 w-1/3 bg-emerald-100 rounded animate-skeleton-pulse" />
          <div className="h-12 w-full bg-white rounded-lg border border-emerald-100 animate-skeleton-pulse" />
        </div>
      </div>

      {/* Answer Key skeleton */}
      <div className="rounded-2xl border-2 border-primary-200 bg-primary-50/30 overflow-hidden">
        <div className="bg-primary-100 px-5 py-2.5 border-b border-primary-200">
          <div className="h-5 w-52 bg-primary-200 rounded animate-skeleton-pulse" />
        </div>
        <div className="p-5 space-y-2">
          <div className="h-4 w-full bg-primary-100 rounded animate-skeleton-pulse" />
          <div className="h-4 w-5/6 bg-primary-100 rounded animate-skeleton-pulse" />
          <div className="h-4 w-3/4 bg-primary-100 rounded animate-skeleton-pulse" />
        </div>
      </div>
    </div>
  );
}
