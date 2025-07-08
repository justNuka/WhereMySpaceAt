import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-white/20 bg-black/40 ring-offset-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-blue-600 checked:border-blue-600",
      className
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
