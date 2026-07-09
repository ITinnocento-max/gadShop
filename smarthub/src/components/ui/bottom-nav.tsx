"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/stores/cart-store";

export function BottomNav() {
  const { t } = useTranslation();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  const items = [
    { icon: "home", label: t("nav.home"), href: "/", fill: false },
    { icon: "grid_view", label: t("nav.shop"), href: "/products", fill: false },
    { icon: "shopping_bag", label: t("nav.cart"), href: "/cart", fill: false, badge: cartCount },
    { icon: "favorite", label: t("nav.wishlist"), href: "/wishlist", fill: false },
    { icon: "person", label: t("nav.profile"), href: "/account", fill: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-2 h-16 md:hidden bg-surface shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-outline-variant/10">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-200 relative"
        >
          <span
            className="material-symbols-outlined"
            style={item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {item.icon}
          </span>
          <span className="font-label-sm text-label-sm">{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span className="absolute -top-1 right-0 bg-primary text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
