"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(
  (
    {
      className,
      sideOffset = 4,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border shadow-md",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        {
          // Variant styles
          "border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100":
            variant === "default",
          "border-blue-100 bg-blue-50 text-blue-900 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-100":
            variant === "blue",
          "border-green-100 bg-green-50 text-green-900 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-100":
            variant === "green",
          "border-red-100 bg-red-50 text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-100":
            variant === "red",
          "border-amber-100 bg-amber-50 text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-100":
            variant === "amber",

          // Size styles
          "px-2 py-1 text-xs": size === "sm",
          "px-3 py-1.5 text-sm": size === "default",
          "px-4 py-2 text-base": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
