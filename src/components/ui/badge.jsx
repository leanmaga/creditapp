import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-blue-600 text-white hover:bg-blue-700 border-transparent",
  secondary:
    "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border-transparent",
  destructive: "bg-red-600 text-white hover:bg-red-700 border-transparent",
  outline:
    "text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
  success: "bg-green-600 text-white hover:bg-green-700 border-transparent",
  warning: "bg-amber-500 text-white hover:bg-amber-600 border-transparent",
  info: "bg-sky-500 text-white hover:bg-sky-600 border-transparent",
};

const Badge = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
