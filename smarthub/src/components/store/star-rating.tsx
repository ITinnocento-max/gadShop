"use client";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "xs" | "sm" | "md";
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "text-[11px]",
  sm: "text-[14px]",
  md: "text-[18px]",
};

export function StarRating({
  rating,
  maxStars = 5,
  size = "sm",
  showValue = true,
  className,
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(maxStars, rating));
  const full = Math.floor(clamped);
  const partial = clamped - full;
  const empty = maxStars - full - (partial > 0 ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: full }).map((_, i) => (
        <span
          key={`full-${i}`}
          className="material-symbols-outlined text-secondary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
      {partial > 0 && (
        <span className="relative">
          <span
            className="material-symbols-outlined text-outline-variant/40"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            star
          </span>
          <span
            className="material-symbols-outlined text-secondary absolute inset-0 overflow-hidden"
            style={{
              fontVariationSettings: "'FILL' 1",
              width: `${partial * 100}%`,
            }}
          >
            star
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <span
          key={`empty-${i}`}
          className="material-symbols-outlined text-outline-variant/40"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          star
        </span>
      ))}
      {showValue && (
        <span className={cn("font-label-sm text-on-surface ml-0.5", sizeMap[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
