"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { StarRating } from "@/components/store/star-rating";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useTranslation } from "@/hooks/useTranslation";
import { matchesSearch } from "@/lib/search";

interface Product {
  id: string; name: string; slug: string; brand: string;
  price: number; originalPrice: number | null; images: string[];
  rating: number; stock: number; categoryId: string;
  category: { name: string };
}

interface Category {
  id: string; name: string;
}

const sortOptions = [
  { label: "Price", value: "price" },
  { label: "Brand", value: "brand" },
  { label: "Rating", value: "rating" },
];

function ProductsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, hasItem } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0] || "", quantity: 1 });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (search) params.set("search", search);
    if (sortBy) params.set("sortBy", sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then(setProducts);

    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, [category, search, sortBy]);

  const filtered = useMemo(() => {
    if (!search) return products;
    return products.filter((p) => matchesSearch(p, search));
  }, [products, search]);

  return (
    <>
      <Header showBack title="SmartHub" />
      <main className="px-margin-mobile pt-sm space-y-lg pb-24">
        <section className="mt-2">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline dark:text-outline-variant">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-body-md transition-all" placeholder={t("common.search_products")} type="text" />
          </div>
        </section>
        <section className="no-scrollbar overflow-x-auto -mx-margin-mobile px-margin-mobile flex gap-2">
          <button key="all" onClick={() => setCategory("All")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md whitespace-nowrap active:scale-95 transition-all ${
              category === "All"
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high dark:bg-surface-variant/20 text-on-surface-variant dark:text-outline border border-outline-variant/30 dark:border-outline-variant/30"
            }`}
          >
            <span>All</span>
            {category === "All" && <span className="material-symbols-outlined text-[18px]">close</span>}
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setCategory(category === cat.name ? "All" : cat.name)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md whitespace-nowrap active:scale-95 transition-all ${
                category === cat.name
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high dark:bg-surface-variant/20 text-on-surface-variant dark:text-outline border border-outline-variant/30 dark:border-outline-variant/30"
              }`}
            >
              <span>{cat.name}</span>
              {category === cat.name && <span className="material-symbols-outlined text-[18px]">close</span>}
            </button>
          ))}
          {sortOptions.map((opt) => (
            <button key={opt.value} onClick={() => setSortBy(sortBy === opt.value ? "" : opt.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md whitespace-nowrap active:scale-95 transition-all ${
                sortBy === opt.value
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container-high dark:bg-surface-variant/20 text-on-surface-variant dark:text-outline border border-outline-variant/30 dark:border-outline-variant/30"
              }`}
            >
              <span>{opt.label}</span>
              <span className="material-symbols-outlined text-[18px]">{sortBy === opt.value ? "close" : "expand_more"}</span>
            </button>
          ))}
        </section>
        <section>
          <h2 className="font-headline-md text-headline-md-mobile text-on-surface dark:text-white">{t("product.title")}</h2>
          <p className="font-label-md text-on-surface-variant dark:text-outline mt-1">{t("common.found")} {filtered.length} {filtered.length === 1 ? t("common.premium_item") : t("common.premium_items")}</p>
        </section>
        {filtered.length === 0 ? (
          <section className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-3">search_off</span>
            <h3 className="font-headline-md text-on-surface dark:text-white mb-1">{t("common.no_items_found")}</h3>
            <p className="font-body-md text-on-surface-variant dark:text-outline">{t("common.try_adjusting")}</p>
          </section>
        ) : (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
          {filtered.map((product) => {
            const discount = product.originalPrice
              ? `-${Math.round((1 - product.price / product.originalPrice) * 100)}%`
              : undefined;
            return (
            <div key={product.id} onClick={() => router.push(`/products/${product.slug}`)} className="group bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-3 shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 flex flex-col relative transition-all hover:shadow-raised cursor-pointer">
              {discount && (
                <span className="absolute top-2 left-2 z-10 bg-tertiary text-on-tertiary px-2 py-0.5 rounded-lg font-label-sm">{discount}</span>
              )}
              <div className="aspect-square rounded-lg overflow-hidden bg-surface-container-low dark:bg-surface-variant/10 mb-3 relative">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.images[0] || ""} alt={product.name} />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleItem({ id: product.id, slug: product.slug, image: product.images[0] || "", brand: product.brand, title: product.name, price: product.price, originalPrice: product.originalPrice ?? undefined, inStock: product.stock > 0 }); }}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    hasItem(product.id)
                      ? "bg-error/10 text-error"
                      : "bg-white/70 dark:bg-inverse-surface/50 text-on-surface-variant/60 dark:text-outline hover:text-error hover:bg-error/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={hasItem(product.id) ? { fontVariationSettings: "'FILL' 1" } as React.CSSProperties : undefined}>favorite</span>
                </button>
              </div>
              <div className="space-y-1 flex-1 flex flex-col">
                <p className="font-label-sm text-outline dark:text-outline-variant uppercase tracking-wider">{product.brand}</p>
                <h3 className="font-label-md text-on-surface dark:text-white line-clamp-1">{product.name}</h3>
                {product.rating > 0 && (
                  <StarRating rating={product.rating} size="xs" />
                )}
                <div className="flex items-end justify-between pt-1 mt-auto">
                  <div>
                    <p className="font-headline-md text-headline-md-mobile text-primary dark:text-inverse-primary">Rwf {product.price.toFixed(2)}</p>
                    {product.originalPrice && <p className="font-label-sm text-outline dark:text-outline-variant line-through">Rwf {product.originalPrice.toFixed(2)}</p>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAdd(product); }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all ${
                      addedId === product.id
                        ? "bg-tertiary text-on-tertiary"
                        : "bg-primary text-on-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined">{addedId === product.id ? "check" : "add"}</span>
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </section>
        )}
      </main>
      <BottomNav />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>}>
      <ProductsContent />
    </Suspense>
  );
}
