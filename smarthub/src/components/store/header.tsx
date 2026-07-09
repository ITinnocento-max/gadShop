"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  showMenu?: boolean;
  className?: string;
}

export function Header({
  title,
  showBack = false,
  showSearch = false,
  showCart = false,
  showMenu = true,
  className,
}: HeaderProps) {
  const { t } = useTranslation();
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-soft transition-all duration-300",
        className
      )}
    >
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center w-full px-margin-mobile h-16">
          <div className="flex items-center gap-2">
            {showBack && (
              <button className="active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-primary">
                  arrow_back
                </span>
              </button>
            )}
            {showMenu && (
              <span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 duration-100" onClick={() => setMobileMenuOpen(true)}>
                menu
              </span>
            )}
            <Link href="/">
              <h1 className="text-headline-lg-mobile text-primary tracking-tighter">
                {title ?? t("common.app_name")}
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {showSearch && (
              <span className="material-symbols-outlined text-primary cursor-pointer">
                search
              </span>
            )}
            {showCart && (
              <div className="relative">
                <span className="material-symbols-outlined text-primary cursor-pointer">
                  shopping_bag
                </span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {showSearch && (
          <div className="px-margin-mobile pb-3">
            <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 gap-3 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="material-symbols-outlined text-outline">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 w-full font-body-md text-on-surface placeholder-outline/60 p-0"
                placeholder={t("common.search_placeholder")}
                type="text"
              />
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">
                  mic
                </span>
                <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">
                  barcode_scanner
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
