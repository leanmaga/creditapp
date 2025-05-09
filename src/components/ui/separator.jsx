import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      variant = "default",
      ...props
    },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0",
        {
          "bg-gray-200 dark:bg-gray-700": variant === "default",
          "bg-gray-300 dark:bg-gray-600": variant === "bold",
          "bg-blue-200 dark:bg-blue-900/30": variant === "blue",
          "bg-red-200 dark:bg-red-900/30": variant === "red",
          "bg-green-200 dark:bg-green-900/30": variant === "green",
          "h-px w-full": orientation === "horizontal",
          "h-full w-px": orientation === "vertical",
        },
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
