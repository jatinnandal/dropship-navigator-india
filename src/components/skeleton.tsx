"use client";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`skeleton-line rounded ${className ?? "h-4 w-full"}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-5">
      <Skeleton className="h-8 w-1/3" />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
