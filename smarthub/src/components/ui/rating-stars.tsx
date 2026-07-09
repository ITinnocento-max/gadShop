"use client";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "xs";
  className?: string;
}

export function RatingStars({ rating, size = "xs", className }: RatingStarsProps) {
  return (
    <div className={cn("flex text-yellow-500", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={cn(
            "material-symbols-outlined",
            size === "xs" ? "text-xs" : "text-sm"
          )}
          style={{ fontVariationSettings: `'FILL' ${star <= rating ? 1 : 0}` }}
        >
          star
        </span>
      ))}
    </div>
  );
}
