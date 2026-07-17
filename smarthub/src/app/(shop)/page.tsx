"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { ProductCard } from "@/components/store/product-card";
import { CategoryCard } from "@/components/store/category-card";
import { useCartStore } from "@/stores/cart-store";
import { useTranslation } from "@/hooks/useTranslation";

interface Category {
  id: string; name: string; slug: string; image: string | null;
}

interface NewRelease {
  id: string; label: string; title: string; subtitle: string | null;
  buttonText: string; buttonLink: string; imageUrl: string | null;
}

interface ProductData {
  id: string; name: string; slug: string; price: number;
  originalPrice: number | null; images: string[]; brand: string;
  stock: number; rating: number; categoryId: string; featured: boolean;
  category: { name: string };
}

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashProducts, setFlashProducts] = useState<ProductData[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductData[]>([]);
  const [newReleases, setNewReleases] = useState<NewRelease[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = newReleases.length > 0 ? newReleases : [{ id: "fallback", label: t("home.new_release"), title: "Galaxy S24 Ultra Elite", subtitle: null, buttonText: t("common.shop_now"), buttonLink: "/products", imageUrl: null }];

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slides.length, isPaused]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products?sortBy=rating&category=Audio").then((r) => r.json()),
      fetch("/api/products?sortBy=newest").then((r) => r.json()),
      fetch("/api/new-releases").then((r) => r.json()),
    ]).then(([cats, flash, featured, releases]) => {
      setCategories(cats);
      setFlashProducts(flash.slice(0, 4));
      setFeaturedProducts(featured.filter((p: ProductData) => p.featured).slice(0, 4));
      setNewReleases(releases);
    });
  }, []);

  return (
    <>
      <Header showSearch />
      <main className="pb-24">
        <section className="relative overflow-hidden w-full h-[320px] mb-lg px-margin-mobile pt-sm">
          <div
            className="flex h-full gap-4 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ transform: `translateX(-${currentSlide * (100 + 2.5)}%)` }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
          >
            {slides.map((release, i) => (
              <div key={release.id} className="min-w-[calc(100%-0px)] h-full relative rounded-2xl overflow-hidden shrink-0 group">
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{
                  backgroundImage: release.imageUrl ? `url('${release.imageUrl}')` : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1YpLMYb4afngQxHQXGqYPl3zyqQU76M6NEJmx_oXx6P8ab4r_4F7o0tTc_j8-YYbT8Lzwn-6kKWR2LNxpC_F2I6oN2QUMnneMwXNxwi300CJAPkwO_-9eHo66YOVr_SWkBFRS3Z7Xjf_mg3pK0xvqCwx811QViMIzJxIRXb9b0Oy7OOhC40uFhnLC9c1RVtu_pbyc3UwMuurezX-Ix-c7RSO_89IgOWehrrK3XR6z3mQjSmkG9VS4gQ')"
                }} />
                <div className="absolute bottom-10 left-6 z-20 text-white max-w-[200px]">
                  <p className="font-label-md text-label-md text-primary-fixed uppercase tracking-widest mb-1">{release.label}</p>
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile leading-tight mb-4">{release.title}</h2>
                  <button onClick={() => router.push(release.buttonLink)} className="bg-primary text-white font-label-md px-6 py-2 rounded-full active:scale-95 transition-all">{release.buttonText}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </section>

        <section className="mb-lg">
          <div className="flex justify-between items-center px-margin-mobile mb-4">
            <h3 className="font-headline-md text-headline-md">{t("home.categories")}</h3>
            <span onClick={() => router.push("/products")} className="text-primary font-label-md cursor-pointer">{t("common.view_all")}</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-margin-mobile">
            {categories.map((cat) => (
              <div key={cat.id} onClick={() => router.push(`/products?category=${cat.name}`)} className="cursor-pointer">
                <CategoryCard icon={cat.slug} label={cat.name} />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-lg bg-surface-container-low py-6">
          <div className="flex justify-between items-center px-margin-mobile mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-headline-md text-headline-md">{t("home.flash_sales")}</h3>
              <CountdownTimer />
            </div>
            <span onClick={() => router.push("/products")} className="text-primary font-label-md cursor-pointer">{t("home.explore_deals")}</span>
          </div>
          <div className="flex gap-md overflow-x-auto no-scrollbar px-margin-mobile">
            {flashProducts.map((product) => (
              <div key={product.id} onClick={() => router.push(`/products/${product.slug}`)} className="cursor-pointer">
                <ProductCard
                  variant="flash"
                  image={product.images[0] || ""}
                  title={product.name}
                  price={Number(product.price)}
                  originalPrice={product.originalPrice ? Number(product.originalPrice) : undefined}
                  discount={product.originalPrice ? `-${Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%` : undefined}
                  stockLeft={product.stock}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-lg px-margin-mobile">
          <h3 className="font-headline-md text-headline-md mb-4">{t("home.featured_products")}</h3>
          <div className="grid grid-cols-2 gap-md">
            {featuredProducts.map((product) => (
              <div key={product.id} onClick={() => router.push(`/products/${product.slug}`)} className="bg-surface rounded-2xl p-4 shadow-sm relative group active:scale-95 transition-all cursor-pointer">
                <button onClick={(e) => { e.stopPropagation(); }} className="absolute top-3 right-3 z-10 text-on-surface-variant/40 hover:text-error transition-colors">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
                <div className="h-40 mb-3 flex items-center justify-center overflow-hidden rounded-xl">
                  <img className="w-full h-full object-cover" src={product.images[0] || ""} alt={product.name} />
                </div>
                <p className="font-label-md text-on-surface-variant">{product.brand}</p>
                <p className="font-headline-md text-[16px] text-on-surface truncate">{product.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-headline-md text-[18px] text-primary">Rwf {Number(product.price).toFixed(2)}</span>
                  <button onClick={(e) => { e.stopPropagation(); addItem({ id: product.id, name: product.name, price: Number(product.price), image: product.images[0] || "", quantity: 1 }); }} className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-margin-mobile mb-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-primary-container/10 rounded-2xl border border-primary-container/20">
              <span className="material-symbols-outlined text-primary">speed</span>
              <div>
                <p className="font-label-md text-on-surface leading-tight">{t("home.fast_delivery")}</p>
                <p className="text-[10px] text-on-surface-variant">{t("home.fast_delivery_desc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-secondary-container/10 rounded-2xl border border-secondary-container/20">
              <span className="material-symbols-outlined text-secondary">verified_user</span>
              <div>
                <p className="font-label-md text-on-surface leading-tight">{t("home.secure_payments")}</p>
                <p className="text-[10px] text-on-surface-variant">{t("home.secure_payments_desc")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
