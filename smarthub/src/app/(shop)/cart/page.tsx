"use client";

import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useCartStore } from "@/stores/cart-store";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

export default function CartPage() {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();

  return (
    <>
      <Header showBack title={t("cart.title")} />
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile py-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter pb-28">
        <section className="lg:col-span-8 space-y-md">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-label-md text-label-md text-on-surface-variant dark:text-outline uppercase tracking-wider">{t("cart.your_items")} ({items.length})</h2>
            {items.length > 0 && (
              <button onClick={() => useCartStore.getState().clearCart()} className="text-primary dark:text-inverse-primary font-label-md hover:underline">{t("cart.clear_all")}</button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">shopping_cart</span>
              <h3 className="font-headline-md text-on-surface dark:text-white mb-2">{t("cart.empty_title")}</h3>
              <p className="font-body-md text-on-surface-variant dark:text-outline mb-6">{t("cart.empty_desc")}</p>
              <Link href="/products" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md">{t("cart.browse_products")}</Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-md flex flex-col sm:flex-row gap-md shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 group transition-all hover:scale-[1.01]">
                <div className="relative w-full sm:w-32 h-32 bg-surface-container dark:bg-surface-variant/15 rounded-lg overflow-hidden shrink-0">
                  <Image className="object-cover" src={item.image} alt={item.name} fill unoptimized />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-md text-on-surface dark:text-white">{item.name}</h3>
                      <p className="text-on-surface-variant dark:text-outline font-label-md">{item.variant || t("cart.standard")}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-outline dark:text-outline-variant hover:text-error hover:bg-error-container/20 rounded-full transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center bg-surface-container-high dark:bg-surface-variant/20 rounded-full px-2 py-1 gap-4">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-primary dark:text-inverse-primary hover:bg-white dark:hover:bg-surface-variant/20 rounded-full transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                      </button>
                      <span className="font-bold text-on-surface dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-primary dark:text-inverse-primary hover:bg-white dark:hover:bg-surface-variant/20 rounded-full transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                    <span className="font-headline-md text-primary dark:text-inverse-primary">Rwf {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          {items.length > 0 && (
            <div className="mt-lg p-lg bg-surface-container-low dark:bg-surface-variant/10 rounded-xl border border-dashed border-outline-variant dark:border-outline-variant/30">
              <label className="block font-label-md text-on-surface-variant dark:text-outline mb-3" htmlFor="coupon">{t("cart.promo_code")}</label>
              <div className="flex gap-sm">
                <input className="flex-grow bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" id="coupon" placeholder={t("cart.enter_code")} type="text" />
                <button className="bg-secondary text-on-secondary px-lg rounded-lg font-label-md hover:brightness-110 active:scale-95 transition-all">{t("cart.apply")}</button>
              </div>
            </div>
          )}
        </section>
        {items.length > 0 && (
          <aside className="lg:col-span-4">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 sticky top-24">
              <h2 className="font-headline-md text-on-surface dark:text-white mb-lg">{t("cart.order_summary")}</h2>
              <div className="space-y-md border-b border-outline-variant pb-lg mb-lg">
                <div className="flex justify-between text-body-md text-on-surface-variant dark:text-outline">\n                  <span>{t("cart.subtotal")}</span>\n                  <span className="text-on-surface dark:text-white font-medium">Rwf {subtotal().toFixed(2)}</span>
                </div>
                <div className="space-y-3">
                  <span className="text-body-md text-on-surface-variant dark:text-outline">{t("cart.shipping_method")}</span>
                  <div className="grid grid-cols-2 gap-sm p-1 bg-surface-container dark:bg-surface-variant/15 rounded-lg">
                    <button className="bg-surface-container-lowest dark:bg-inverse-surface shadow-sm rounded-md py-2 text-label-md text-primary dark:text-inverse-primary font-bold">{t("cart.standard")}</button>
                    <button className="hover:bg-surface-container-high dark:hover:bg-surface-variant/20 rounded-md py-2 text-label-md text-on-surface-variant dark:text-outline transition-colors">{t("cart.express")}</button>
                  </div>
                  <div className="flex justify-between text-body-md text-on-surface-variant dark:text-outline px-1">\n                    <span>{t("cart.standard_shipping")}</span>
                    <span className="text-secondary font-medium">{t("cart.shipping_free")}</span>
                  </div>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant dark:text-outline">\n                  <span>{t("cart.tax")} (8.5%)</span>\n                  <span className="text-on-surface dark:text-white font-medium">Rwf {(subtotal() * 0.085).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline mb-lg">
                <span className="font-headline-md text-on-surface dark:text-white">{t("cart.total")}</span>
                <span className="font-display-lg-mobile text-primary dark:text-inverse-primary">Rwf {(subtotal() * 1.085).toFixed(2)}</span>
              </div>
              <Link href="/checkout/shipping" className="w-full bg-primary-container dark:bg-primary dark:text-inverse-on-primary py-4 rounded-xl font-headline-md flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all duration-200">
                {t("cart.proceed_to_checkout")}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <div className="mt-lg flex items-center justify-center gap-2 py-3 bg-secondary-container/10 dark:bg-secondary-container/20 rounded-lg">
                <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                <span className="text-label-sm text-secondary uppercase tracking-widest">{t("cart.secure_checkout")}</span>
              </div>
              <p className="text-label-sm text-on-surface-variant dark:text-outline text-center mb-2">{t("cart.payment_types")}</p>
              <div className="mt-lg grid grid-cols-4 gap-sm opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="h-8 bg-surface-variant dark:bg-surface-variant/30 rounded flex items-center justify-center"><span className="font-bold text-[10px]">VISA</span></div>
                <div className="h-8 bg-surface-variant dark:bg-surface-variant/30 rounded flex items-center justify-center"><span className="font-bold text-[10px]">MC</span></div>
                <div className="h-8 bg-surface-variant dark:bg-surface-variant/30 rounded flex items-center justify-center"><span className="font-bold text-[10px]">AMEX</span></div>
                <div className="h-8 bg-surface-variant dark:bg-surface-variant/30 rounded flex items-center justify-center"><span className="font-bold text-[10px]">APPLE</span></div>
              </div>
            </div>
          </aside>
        )}
      </main>
      <BottomNav />
    </>
  );
}
