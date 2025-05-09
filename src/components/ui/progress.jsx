"use client";
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(
  (
    { className, value, variant = "default", size = "default", ...props },
    ref
  ) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-full",
        {
          "h-2": size === "sm",
          "h-3": size === "default",
          "h-4": size === "lg",
          "bg-gray-200 dark:bg-gray-700": variant === "default",
          "bg-blue-100 dark:bg-blue-900/30": variant === "blue",
          "bg-green-100 dark:bg-green-900/30": variant === "green",
          "bg-red-100 dark:bg-red-900/30": variant === "red",
          "bg-amber-100 dark:bg-amber-900/30": variant === "amber",
        },
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all duration-300", {
          "bg-blue-600 dark:bg-blue-500":
            variant === "default" || variant === "blue",
          "bg-green-600 dark:bg-green-500": variant === "green",
          "bg-red-600 dark:bg-red-500": variant === "red",
          "bg-amber-600 dark:bg-amber-500": variant === "amber",
        })}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
