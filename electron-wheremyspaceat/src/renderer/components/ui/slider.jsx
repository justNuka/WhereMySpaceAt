import React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
    >
      <input
        type="range"
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        {...props}
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
});

Slider.displayName = "Slider";

export { Slider };
