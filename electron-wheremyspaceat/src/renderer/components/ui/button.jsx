import React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
  ghost: "text-white hover:bg-white/10 border border-white/20",
  link: "text-blue-400 underline-offset-4 hover:underline",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}, ref) => {
  const Component = asChild ? "span" : "button";
  
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
