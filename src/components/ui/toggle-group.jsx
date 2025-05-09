"use client";
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
});

const ToggleGroup = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "single",
      orientation = "horizontal",
      children,
      ...props
    },
    ref
  ) => (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type={type}
      orientation={orientation}
      className={cn(
        orientation === "horizontal"
          ? "flex items-center justify-start gap-1 flex-wrap"
          : "flex flex-col items-start gap-1",
        {
          "p-1 bg-gray-100 dark:bg-gray-800 rounded-lg":
            variant === "default" && type === "single",
          "p-1 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800":
            variant === "outline" && type === "single",
        },
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
);
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef(
  ({ className, children, variant, size, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext);
    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          "data-[state=on]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950",
          className
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    );
  }
);
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
