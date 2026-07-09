"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useCartStore } from "@/stores/cart-store";
import { useTranslation } from "@/hooks/useTranslation";

interface Review {
  id: string; rating: number; title: string | null; comment: string | null;
  user: { name: string }; createdAt: string;
}

interface ProductDetail {
  id: string; name: string; slug: string; description: string; brand: string;
  price: number; originalPrice: number | null; images: string[];
  stock: number; specs: Record<string, string> | null;
  rating: number; numReviews: number;
  category: { name: string };
  reviews: Review[];
}

export default function ProductDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/products/${params.slug}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [params?.slug]);

  if (loading) {
    return (
      <>
        <Header showBack title="SmartHub" showCart />
        <main className="pb-32 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <BottomNav />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header showBack title="SmartHub" showCart />
        <main className="pb-32 flex flex-col items-center justify-center min-h-[60vh] px-margin-mobile">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-3">block</span>
          <h3 className="font-headline-md">Product not found</h3>
        </main>
        <BottomNav />
      </>
    );
  }

  const specs = product.specs
    ? Object.entries(product.specs).map(([key, value]) => ({
        icon: key === "chip" ? "dresser" : key === "camera" ? "camera" : key === "battery" ? "battery_charging_full" : key === "display" ? "screenshot_frame" : key === "connectivity" ? "wifi" : key === "waterproof" ? "water_drop" : "info",
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value,
      }))
    : [];

  return (
    <>
      <Header showBack title="SmartHub" showCart />
      <main className="pb-32">
        <section className="relative bg-surface-container-lowest dark:bg-inverse-surface overflow-hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
            {(product.images.length > 0 ? product.images : [""]).map((img, i) => (
              <div key={i} className="flex-shrink-0 w-full snap-center h-[420px] flex items-center justify-center p-xl">
                <img className="h-full object-contain" src={img} alt={product.name} />
              </div>
            ))}
          </div>
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
              {product.images.map((_, i) => (
                <div key={i} className={`h-1.5 ${i === 0 ? "w-6" : "w-1.5"} rounded-full ${i === 0 ? "bg-primary" : "bg-outline-variant"}`} />
              ))}
            </div>
          )}
        </section>
        <section className="px-margin-mobile py-lg space-y-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.stock > 0 ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                {product.stock > 0 ? t("product.in_stock") : t("product.out_of_stock")}
              </span>
              <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface dark:text-white">{product.name}</h2>
              <p className="font-body-md text-on-surface-variant dark:text-outline">{product.brand}</p>
            </div>
            <div className="text-right">
              <p className="font-display-lg-mobile text-primary dark:text-inverse-primary">Rwf {product.price.toFixed(2)}</p>
              {product.originalPrice && (
                <p className="font-label-md text-label-md text-outline dark:text-outline-variant line-through">Rwf {product.originalPrice.toFixed(2)}</p>
              )}
            </div>
          </div>
        </section>
        <div className="h-2 bg-surface-container-low dark:bg-surface-variant/10 border-y border-outline-variant/10" />
        <section className="px-margin-mobile py-lg">
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-2">{t("product.description")}</h3>
          <p className="font-body-md text-on-surface-variant dark:text-outline">{product.description}</p>
        </section>
        {specs.length > 0 && (
          <>
            <div className="h-2 bg-surface-container-low dark:bg-surface-variant/10 border-y border-outline-variant/10" />
            <section className="px-margin-mobile py-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-md">{t("product.specifications")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
                {specs.map((spec) => (
                  <div key={spec.label} className="p-md bg-surface-container dark:bg-surface-variant/15 rounded-2xl flex flex-col gap-2">
                    <span className="material-symbols-outlined text-primary dark:text-inverse-primary">{spec.icon}</span>
                    <div>
                      <p className="font-label-sm text-outline dark:text-outline-variant">{spec.label}</p>
                      <p className="font-label-md text-on-surface dark:text-white">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
        {product.reviews.length > 0 && (
          <>
            <div className="h-2 bg-surface-container-low dark:bg-surface-variant/10 border-y border-outline-variant/10" />
            <section className="px-margin-mobile py-lg">
              <div className="flex justify-between items-center mb-md">
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t("product.reviews")}</h3>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-md font-bold">{product.rating}</span>
                  <span className="font-label-sm text-outline dark:text-outline-variant">({product.numReviews})</span>
                </div>
              </div>
              <div className="space-y-lg">
                {product.reviews.map((review) => {
                  const initials = review.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  const colors = ["bg-primary-container text-on-primary-container", "bg-secondary-container text-on-secondary-container", "bg-tertiary-container text-on-tertiary-container", "bg-surface-container-high text-on-surface-variant"];
                  const color = colors[review.id.length % colors.length];
                  return (
                    <div key={review.id} className="space-y-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center font-label-sm`}>{initials}</div>
                        <div>
                          <p className="font-label-md text-on-surface dark:text-white">{review.user.name}</p>
                          <div className="flex text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.title && <p className="font-label-md font-semibold text-on-surface dark:text-white">{review.title}</p>}
                      {review.comment && <p className="font-body-md text-on-surface-variant dark:text-outline italic">"{review.comment}"</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
        <section className="px-margin-mobile py-lg">
          <div className="p-lg bg-surface-container-high dark:bg-surface-variant/20 rounded-3xl space-y-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary dark:text-inverse-primary">verified_user</span>
              <h4 className="font-label-md font-bold">{t("product.warranty")}</h4>
            </div>
            <p className="font-label-md text-on-surface-variant dark:text-outline">{t("product.warranty_desc")}</p>
          </div>
        </section>
      </main>
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-xl border-t border-outline-variant/30 px-margin-mobile pt-sm pb-8 md:hidden">
        <div className="flex gap-4">
          <button onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0] || "", quantity: 1 })} className="flex-1 h-14 bg-surface-container-highest dark:bg-surface-variant/25 text-primary dark:text-inverse-primary border border-primary/20 font-label-md rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">shopping_cart</span> {t("product.add_to_cart")}
          </button>
          <button onClick={() => router.push("/checkout/shipping")} className="flex-1 h-14 bg-primary text-on-primary font-label-md rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
            {t("product.buy_now")} <span className="material-symbols-outlined">flash_on</span>
          </button>
        </div>
      </footer>
      <BottomNav />
    </>
  );
}
