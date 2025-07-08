import React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    secondary: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    success: "bg-green-500/20 text-green-300 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    destructive: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export { Badge };
