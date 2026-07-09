"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

interface Category {
  id: string; name: string; slug: string;
}

interface Product {
  id: string; name: string; slug: string; brand: string;
  price: number; originalPrice: number | null; stock: number;
  images: string[]; featured: boolean; inStock: boolean;
  createdAt: string;
  category: Category;
  vendor: { id: string; name: string };
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (stockStatus !== "all") params.set("stock", stockStatus);
    if (sortBy !== "newest") params.set("sortBy", sortBy);
    params.set("page", String(page));
    params.set("limit", "20");

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/products?${params}`).then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      setData(productsRes);
      setCategories(categoriesRes);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [search, category, stockStatus, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteId(null);
        fetchProducts();
      }
    } catch {
      // ignore
    }
    setDeleting(false);
  };

  const fmt = (v: number) => "RWF " + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md-mobile md:text-headline-md text-primary">{"Products"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6jAEv7x888X42BimUArGeWLtS9MnDaHwOqSgTX0c13jeuDFDOGhAMbJwltx7r19TZDkvBAPK8kC_t1LocXTZchBB2ntQe2r16jny3aiQ8pzLUYhEV4mzaxTbMqM0khIbcIdHn4LQUuSo1dfmVr6kRSvYi7HcxcQuRzco7rCMccO_heVE48x3jOW4gGtkgBDmG7yRoL1CLMoByp2g1AcpmouNjLxmSZFNuwWzYlIkowOuD5ljUz-l87A"
                alt="Admin"
              />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-lg pb-28 md:pb-12 space-y-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full h-10 pl-10 pr-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder={"Search products..."}
                />
              </div>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{"All Categories"}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <select
                value={stockStatus}
                onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
                className="h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{"All Stock"}</option>
                <option value="low">{"Low Stock"}</option>
                <option value="out">{"Out of Stock"}</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="newest">{"Newest"}</option>
                <option value="name">{"Name"}</option>
                <option value="price_asc">{"Price: Low to High"}</option>
                <option value="price_desc">{"Price: High to Low"}</option>
                <option value="stock">{"Stock"}</option>
                <option value="rating">{"Rating"}</option>
              </select>
            </div>
            <button
              onClick={() => router.push("/admin/products/new")}
              className="flex items-center gap-2 px-4 h-10 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              { "Add Product"}
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">{"Product"}</th>
                    <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">{"Category"}</th>
                    <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-right">{"Price"}</th>
                    <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-right">{"Stock"}</th>
                    <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-center">{"Status"}</th>
                    <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-right">{"Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-lg py-12 text-center text-outline">{"Loading..."}</td>
                    </tr>
                  ) : data?.products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-lg py-12 text-center text-outline">{"No products found"}</td>
                    </tr>
                  ) : (
                    data?.products.map((product) => (
                      <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-lg py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-variant overflow-hidden shrink-0">
                              <img
                                className="w-full h-full object-cover"
                                src={Array.isArray(product.images) && product.images[0] ? product.images[0] as string : "https://placehold.co/40x40?text=N"}
                                alt={product.name}
                              />
                            </div>
                            <div>
                              <p className="font-label-md text-on-surface">{product.name}</p>
                              <p className="font-label-sm text-outline">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-lg py-4 font-body-md text-on-surface-variant">{product.category.name}</td>
                        <td className="px-lg py-4 text-right font-label-md">
                          <span className="text-on-surface">{fmt(product.price)}</span>
                          {product.originalPrice && (
                            <span className="text-outline line-through ml-1 text-label-sm">{fmt(product.originalPrice)}</span>
                          )}
                        </td>
                        <td className="px-lg py-4 text-right">
                          <span className={`font-label-md ${product.stock <= 5 ? "text-error" : "text-on-surface"}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-lg py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm ${
                            product.featured
                              ? "bg-primary/10 text-primary"
                              : product.inStock
                              ? "bg-secondary-container/30 text-on-secondary-container"
                              : "bg-error-container/20 text-error"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              product.featured ? "bg-primary" : product.inStock ? "bg-green-500" : "bg-error"
                            }`} />
                            {product.featured ? "Featured" : product.inStock ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-lg py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                              className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-colors"
                              title={"Edit"}
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            {deleteId === product.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  disabled={deleting}
                                  className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">{deleting ? "hourglass_top" : "check"}</span>
                                </button>
                                <button
                                  onClick={() => setDeleteId(null)}
                                  className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteId(product.id)}
                                className="p-2 text-on-surface-variant hover:bg-error-container/20 hover:text-error rounded-lg transition-colors"
                                title={"Delete"}
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="font-body-md text-outline">
                {"Showing"} {(data.page - 1) * data.limit + 1}-{Math.min(data.page * data.limit, data.total)} {"of"} {data.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === data.totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-outline">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg font-label-md transition-colors ${
                          p === page ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-variant/50"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-2 h-16 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-sm text-label-sm">{"Dashboard"}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-primary bg-primary-container/30 rounded-full px-4 py-1" href="/admin/products">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
            <span className="font-label-sm text-label-sm">{"Products"}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/financial">
            <span className="material-symbols-outlined">account_balance</span>
            <span className="font-label-sm text-label-sm">{"Financial Reports"}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/profit-loss">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-sm text-label-sm">{"Profit & Loss"}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-sm text-label-sm">{"Dashboard"}</span>
          </a>
        </nav>
      </main>
  );
}
