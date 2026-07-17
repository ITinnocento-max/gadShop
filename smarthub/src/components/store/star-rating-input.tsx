"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "text-[20px]",
  md: "text-[28px]",
  lg: "text-[36px]",
};

export function StarRatingInput({
  value,
  onChange,
  size = "md",
  className,
}: StarRatingInputProps) {
  const [hover, setHover] = useState(0);

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hover || value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className={cn(
                "transition-transform active:scale-90",
                sizeMap[size]
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined transition-colors",
                  filled ? "text-secondary" : "text-outline-variant/40"
                )}
                style={{
                  fontVariationSettings: filled
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                star
              </span>
            </button>
          );
        })}
        {(hover || value) > 0 && (
          <span className="font-label-md text-on-surface-variant ml-1">
            {labels[hover || value]}
          </span>
        )}
      </div>
    </div>
  );
}
