import { cn } from "@/lib/utils";

function Skeleton({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        {
          "bg-gray-200 dark:bg-gray-800": variant === "default",
          "bg-gray-300 dark:bg-gray-700": variant === "darker",
          "bg-blue-100 dark:bg-blue-900/30": variant === "blue",
          "bg-gray-100 dark:bg-gray-900": variant === "lighter",
        },
        className
      )}
      {...props}
    />
  );
}

function SkeletonText({ className, lines = 1, ...props }) {
  return (
    <div className="flex flex-col space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 w-full",
            i === lines - 1 && lines > 1 ? "w-4/5" : "",
            className
          )}
          {...props}
        />
      ))}
    </div>
  );
}

function SkeletonCircle({ className, ...props }) {
  return <Skeleton className={cn("rounded-full", className)} {...props} />;
}

function SkeletonButton({ className, ...props }) {
  return (
    <Skeleton className={cn("h-10 w-20 rounded-md", className)} {...props} />
  );
}

function SkeletonImage({ className, ...props }) {
  return (
    <Skeleton className={cn("h-32 w-full rounded-md", className)} {...props} />
  );
}

function SkeletonCard({ className, ...props }) {
  return (
    <Skeleton className={cn("h-48 w-full rounded-lg", className)} {...props} />
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonButton,
  SkeletonImage,
  SkeletonCard,
};
