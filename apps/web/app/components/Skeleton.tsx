type SkeletonLineProps = {
  className?: string;
};

type SkeletonCardProps = {
  className?: string;
  lines?: number;
};

type SkeletonListProps = {
  count?: number;
  className?: string;
  cardClassName?: string;
  lines?: number;
};

export function SkeletonLine({ className = "h-4 w-full" }: SkeletonLineProps) {
  return (
    <div
      className={`animate-pulse rounded bg-neutral-800/60 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({
  className = "",
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div
      className={`rounded-2xl border border-neutral-800/90 bg-[#0b0b0b] p-5 ${className}`}
      aria-hidden="true"
    >
      <SkeletonLine className="h-5 w-1/3" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonLine
            key={index}
            className={index === lines - 1 ? "h-4 w-2/3" : "h-4 w-full"}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({
  count = 3,
  className = "space-y-3",
  cardClassName,
  lines = 3,
}: SkeletonListProps) {
  return (
    <div className={className} aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} className={cardClassName} lines={lines} />
      ))}
    </div>
  );
}
