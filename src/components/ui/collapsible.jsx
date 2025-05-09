"use client";
import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";

const Collapsible = React.forwardRef(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Root
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
));
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between rounded-md px-4 py-2 text-left text-sm font-medium",
      "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200",
      "dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950",
      "transition-colors",
      className
    )}
    {...props}
  />
));
CollapsibleTrigger.displayName =
  CollapsiblePrimitive.CollapsibleTrigger.displayName;

const CollapsibleContent = React.forwardRef(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      "overflow-hidden",
      "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      "rounded-b-md border border-t-0 border-gray-200 bg-white px-4 py-3 text-sm",
      "dark:border-gray-700 dark:bg-gray-900",
      className
    )}
    {...props}
  />
));
CollapsibleContent.displayName =
  CollapsiblePrimitive.CollapsibleContent.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
