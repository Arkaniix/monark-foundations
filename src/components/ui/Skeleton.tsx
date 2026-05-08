type SkeletonProps = {
  className?: string;
  animated?: boolean;
};

export function Skeleton({ className = "", animated = true }: SkeletonProps) {
  const cls = animated ? "mk-skeleton" : "mk-skeleton mk-skeleton-static";
  return <div className={`${cls} ${className}`} aria-hidden="true" />;
}

export default Skeleton;