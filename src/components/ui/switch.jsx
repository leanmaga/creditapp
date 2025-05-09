"use client";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          "h-5 w-9": size === "sm",
          "h-6 w-11": size === "default",
          "h-7 w-14": size === "lg",
          "data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-600 dark:data-[state=unchecked]:bg-gray-700":
            variant === "default",
          "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-green-600 dark:data-[state=unchecked]:bg-gray-700":
            variant === "green",
          "data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-red-600 dark:data-[state=unchecked]:bg-gray-700":
            variant === "red",
          "data-[state=checked]:bg-amber-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-amber-600 dark:data-[state=unchecked]:bg-gray-700":
            variant === "amber",
        },
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
          {
            "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0":
              size === "sm",
            "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0":
              size === "default",
            "h-6 w-6 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0":
              size === "lg",
          }
        )}
      />
    </SwitchPrimitives.Root>
  )
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
