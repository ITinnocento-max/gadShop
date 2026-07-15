"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { CustomerGuard } from "@/components/customer/customer-guard";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useTranslation } from "@/hooks/useTranslation";

export default function WishlistPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { items, removeItem, clearAll } = useWishlistStore();

  return (
    <CustomerGuard>
      <Header showBack title={t("wishlist.title")} />
      <main className="flex-grow pt-4 pb-28 px-margin-mobile max-w-7xl mx-auto w-full">
        <section className="flex items-center justify-between mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface dark:text-white">{t("wishlist.title")}</h2>
            <p className="font-body-md text-on-surface-variant dark:text-outline">{items.length} {t("wishlist.items_saved")}</p>
          </div>
          {items.length > 0 && (
            <button onClick={clearAll} className="text-primary dark:text-inverse-primary font-label-md hover:underline">{t("wishlist.clear_all")}</button>
          )}
        </section>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">favorite</span>
            <h3 className="font-headline-md text-on-surface dark:text-white mb-2">{t("wishlist.empty_title")}</h3>
            <p className="font-body-md text-on-surface-variant dark:text-outline mb-6 max-w-xs">{t("wishlist.empty_desc")}</p>
            <button onClick={() => router.push("/products")} className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md active:scale-95 transition-all">
              {t("wishlist.browse_products")}
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
            {items.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-3 shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 flex flex-col relative group hover:shadow-raised transition-all">
                {!item.inStock && (
                  <span className="absolute top-2 left-2 z-10 bg-outline dark:bg-outline-variant text-surface dark:text-inverse-surface px-2 py-0.5 rounded-lg font-label-sm">{t("wishlist.out_of_stock")}</span>
                )}
                <div onClick={() => router.push(`/products/${item.slug}`)} className="cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden bg-surface-container-low dark:bg-surface-variant/10 mb-3">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={item.image} alt={item.title} />
                  </div>
                </div>
                <div className="space-y-1 flex-1 flex flex-col">
                  <p className="font-label-sm text-outline dark:text-outline-variant uppercase tracking-wider">{item.brand}</p>
                  <h3 className="font-label-md text-on-surface dark:text-white line-clamp-1">{item.title}</h3>
                  <div className="flex items-center gap-1">
                    <span className="font-headline-md text-headline-md-mobile text-primary dark:text-inverse-primary">Rwf {item.price.toFixed(2)}</span>
                    {item.originalPrice && (
                      <span className="font-label-sm text-outline dark:text-outline-variant line-through">Rwf {item.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    {item.inStock ? (
                      <button
                        onClick={() => {
                          addItem({ id: item.id, name: item.title, price: item.price, image: item.image, quantity: 1 });
                          removeItem(item.id);
                        }}
                        className="flex-1 h-9 bg-primary text-on-primary rounded-full font-label-sm text-label-sm active:scale-90 transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        {t("wishlist.add_to_cart")}
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/products/${item.slug}`)}
                        className="flex-1 h-9 bg-surface-container-high dark:bg-surface-variant/20 text-on-surface-variant dark:text-outline rounded-full font-label-sm text-label-sm active:scale-90 transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">notifications</span>
                        {t("wishlist.notify_me")}
                      </button>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-9 h-9 flex items-center justify-center text-outline dark:text-outline-variant hover:text-error hover:bg-error-container/20 rounded-full active:scale-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
      <BottomNav />
    </CustomerGuard>
  );
}
