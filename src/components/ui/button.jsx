import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 disabled:pointer-events-none disabled:opacity-50",
          {
            // Variant styles
            "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800":
              variant === "default",
            "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800":
              variant === "destructive",
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600":
              variant === "outline",
            "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:active:bg-gray-500":
              variant === "secondary",
            "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100":
              variant === "ghost",
            "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400":
              variant === "link",

            // Size styles
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-md px-8 text-base": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const buttonVariants = ({ variant = "default", size = "default" } = {}) => {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 disabled:pointer-events-none disabled:opacity-50",
    {
      // Variant styles
      "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800":
        variant === "default",
      "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800":
        variant === "destructive",
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600":
        variant === "outline",
      "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:active:bg-gray-500":
        variant === "secondary",
      "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100":
        variant === "ghost",
      "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400":
        variant === "link",

      // Size styles
      "h-10 px-4 py-2": size === "default",
      "h-9 rounded-md px-3 text-xs": size === "sm",
      "h-11 rounded-md px-8 text-base": size === "lg",
      "h-9 w-9 p-0": size === "icon",
    }
  );
};

export { Button, buttonVariants };
