"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface CategoryCardProps {
  icon: string;
  label: string;
  href?: string;
  className?: string;
}

const icons: Record<string, string> = {
  smartphones: "smartphone",
  audio: "headphones",
  clothing: "apparel",
  shoes: "steps",
  watches: "watch",
  chargers: "ev_charger",
  wearables: "watch",
  accessories: "cable",
  tablets: "tablet",
  laptops: "laptop",
  cameras: "photo_camera",
  gaming: "sports_esports",
  home: "home",
  fitness: "fitness_center",
  audio: "headphones",
};

export function CategoryCard({ icon, label, href = "/products", className }: CategoryCardProps) {
  const hasIcon = icon in icons;
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Link href={href}>
      <div
        className={cn(
          "flex flex-col items-center min-w-[60px] group",
          className
        )}
      >
        <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mb-1.5 group-active:bg-primary-container/20 transition-colors">
          {hasIcon ? (
            <span className="material-symbols-outlined text-primary text-[22px]">
              {icons[icon]}
            </span>
          ) : (
            <span className="font-label-md text-primary leading-none select-none" style={{ fontSize: initials.length > 1 ? "13px" : "18px" }}>
              {initials}
            </span>
          )}
        </div>
        <span className="font-label-sm text-[11px] text-on-surface-variant text-center leading-tight max-w-[60px] truncate">
          {label}
        </span>
      </div>
    </Link>
  );
}
