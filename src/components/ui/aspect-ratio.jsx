"use client";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import { cn } from "@/lib/utils";
import * as React from "react";

const AspectRatio = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-hidden rounded-lg", className)}
  >
    <AspectRatioPrimitive.Root className="w-full h-full" {...props} />
  </div>
));

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
