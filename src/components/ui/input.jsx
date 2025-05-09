import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-sm",
        "transition-colors duration-200",
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-500",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-600 dark:file:text-gray-400",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
