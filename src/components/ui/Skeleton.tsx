import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  animated?: boolean;
};

export function Skeleton({ className = "", animated = true, ...props }: SkeletonProps) {
  const cls = animated ? "mk-skeleton" : "mk-skeleton mk-skeleton-static";
  return <div aria-hidden="true" {...props} className={`${cls} ${className}`} />;
}

export default Skeleton;
