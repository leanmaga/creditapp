"use client";
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn("relative overflow-hidden rounded-full", {
          "h-1.5": size === "sm",
          "h-2": size === "default",
          "h-3": size === "lg",
          "bg-gray-200 dark:bg-gray-700": variant === "default",
          "bg-blue-100 dark:bg-blue-900/30": variant === "blue",
          "bg-green-100 dark:bg-green-900/30": variant === "green",
          "bg-red-100 dark:bg-red-900/30": variant === "red",
        })}
      >
        <SliderPrimitive.Range
          className={cn("absolute h-full", {
            "bg-blue-600 dark:bg-blue-500":
              variant === "default" || variant === "blue",
            "bg-green-600 dark:bg-green-500": variant === "green",
            "bg-red-600 dark:bg-red-500": variant === "red",
          })}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block rounded-full border-2 bg-white shadow-md transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "h-4 w-4": size === "sm",
            "h-5 w-5": size === "default",
            "h-6 w-6": size === "lg",
            "border-blue-600 dark:border-blue-500":
              variant === "default" || variant === "blue",
            "border-green-600 dark:border-green-500": variant === "green",
            "border-red-600 dark:border-red-500": variant === "red",
          }
        )}
      />
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
