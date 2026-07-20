"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "./star-rating";

interface ProductCardProps {
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  badge?: string;
  brand?: string;
  rating?: number;
  className?: string;
  href?: string;
  inStock?: boolean;
  stockLeft?: number;
  showAddButton?: boolean;
  variant?: "grid" | "compact" | "flash";
}

export function ProductCard({
  image,
  title,
  price,
  originalPrice,
  discount,
  badge,
  brand,
  rating,
  className,
  href = "/products/sample",
  stockLeft,
  showAddButton = true,
  variant = "grid",
}: ProductCardProps) {
  if (variant === "flash") {
    return (
      <div className={cn("min-w-[160px] bg-surface rounded-xl overflow-hidden shadow-soft hover:shadow-raised transition-shadow", className)}>
        <div className="relative h-40 w-full overflow-hidden">
          <Image className="w-full h-full object-cover" src={image} alt={title} width={300} height={300} unoptimized />
          {discount && (
            <div className="absolute top-2 left-2 bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discount}
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-label-md text-on-surface truncate">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-headline-md text-[18px] text-primary">
              ${price}
            </span>
            {originalPrice && (
              <span className="text-outline text-label-sm line-through">
                ${originalPrice}
              </span>
            )}
          </div>
          {stockLeft !== undefined && (
            <>
              <div className="w-full bg-surface-container-high h-1 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${Math.min(100, (stockLeft / 50) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-outline-variant mt-1 font-medium">
                {stockLeft} items left
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <Link href={href}>
      <div
        className={cn(
          "group bg-surface-container-lowest rounded-xl p-3 shadow-soft flex flex-col relative transition-all hover:shadow-raised",
          variant === "compact" ? "min-w-[160px]" : "",
          className
        )}
      >
        {discount && (
          <span className="absolute top-2 left-2 z-10 bg-tertiary text-on-tertiary px-2 py-0.5 rounded-lg font-label-sm">
            {discount}
          </span>
        )}
        {badge && (
          <span className="absolute top-2 left-2 z-10 bg-secondary text-on-secondary px-2 py-0.5 rounded-lg font-label-sm">
            {badge}
          </span>
        )}
        <button className="absolute top-2 right-2 z-10 text-on-surface-variant/40 hover:text-error transition-colors">
          <span className="material-symbols-outlined">favorite</span>
        </button>
        <div className="aspect-square rounded-lg overflow-hidden bg-surface-container-low mb-3">
          <Image
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={image}
            alt={title}
            width={300}
            height={300}
            unoptimized
          />
        </div>
        <div className="space-y-1 flex-1 flex flex-col">
          {brand && (
            <p className="font-label-sm text-outline uppercase tracking-wider">
              {brand}
            </p>
          )}
          <h3 className="font-label-md text-on-surface line-clamp-1">{title}</h3>
          {rating != null && rating > 0 && (
            <StarRating rating={rating} size="xs" />
          )}
          <div className="flex items-end justify-between pt-1 mt-auto">
            <div>
              <p className="font-headline-md text-headline-md-mobile text-primary">
                Rwf {price.toFixed(2)}
              </p>
              {originalPrice && (
                <p className="font-label-sm text-outline line-through">
                  Rwf {originalPrice.toFixed(2)}
                </p>
              )}
            </div>
            {showAddButton && (
              <button className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-md active:scale-90 transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
