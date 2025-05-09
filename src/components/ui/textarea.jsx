import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm",
          "transition-colors duration-200",
          "placeholder:text-gray-500 dark:placeholder:text-gray-400",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          "dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-500",
          {
            "resize-none": variant === "fixed",
            "focus:border-green-500 focus:ring-green-500/20":
              variant === "success",
            "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800":
              variant === "error",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
