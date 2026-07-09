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
};

export function CategoryCard({ icon, label, href = "/products", className }: CategoryCardProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex flex-col items-center min-w-[72px] group",
          className
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-2 group-active:bg-primary-container/20 transition-colors">
          <span className="material-symbols-outlined text-primary text-[28px]">
            {icons[icon] || icon}
          </span>
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant">
          {label}
        </span>
      </div>
    </Link>
  );
}
