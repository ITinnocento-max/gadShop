"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useUIStore } from "@/stores/ui-store";

interface Category { id: string; name: string; slug: string; }
interface Vendor { id: string; name: string; }

export default function NewProductPage() {

  const router = useRouter();
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", slug: "", description: "", brand: "",
    price: "", originalPrice: "", stock: "0",
    categoryId: "", vendorId: "", featured: false,
    images: "", specs: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/admin/products?limit=1").then((r) => r.json()).catch(() => ({ products: [] })),
    ]).then(([cats]) => {
      setCategories(cats);
      if (cats.length > 0) setForm((f) => ({ ...f, categoryId: cats[0].id }));
    });

    fetch("/api/admin/products?limit=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.products?.length) {
          const vs = d.products.map((p: { vendor: Vendor }) => p.vendor);
          const unique = vs.filter((v: Vendor, i: number, a: Vendor[]) => a.findIndex((x) => x.id === v.id) === i);
          setVendors(unique);
          if (unique.length > 0) setForm((f) => ({ ...f, vendorId: unique[0].id }));
        }
      });
  }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: f.slug === generateSlug(form.name) || !form.slug ? generateSlug(name) : f.slug,
    }));
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        urls.push(data.url);
      }
      setForm((f) => ({
        ...f,
        images: f.images ? f.images + "\n" + urls.join("\n") : urls.join("\n"),
      }));
    } catch {
      setError("Failed to upload media");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.name || !form.description || !form.brand || !form.price || !form.categoryId || !form.vendorId) {
      setError("Please fill in all required fields");
      setSaving(false);
      return;
    }

    let parsedSpecs = null;
    if (form.specs) {
      try {
        parsedSpecs = JSON.parse(form.specs);
      } catch {
        parsedSpecs = null;
      }
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || generateSlug(form.name),
          description: form.description,
          brand: form.brand,
          price: parseFloat(form.price),
          originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
          stock: parseInt(form.stock) || 0,
          categoryId: form.categoryId,
          vendorId: form.vendorId,
          featured: form.featured,
          images: form.images ? form.images.split("\n").filter(Boolean).map((s) => s.trim()) : [],
          specs: parsedSpecs,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to create product");
        setSaving(false);
        return;
      }

      router.push("/admin/products");
    } catch {
      setError("Failed to create product");
      setSaving(false);
    }
  };

  const update = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputCls = "w-full h-10 md:h-12 lg:h-14 px-3 md:px-4 lg:px-5 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20 text-body-md md:text-body-lg";
  const labelCls = "font-label-md text-label-md md:text-label-lg text-on-surface-variant mb-1.5 md:mb-2 block";

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md-mobile md:text-headline-md text-primary">{"Add Product"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/products")} className="px-4 h-10 border border-outline-variant rounded-lg font-label-md text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
              {"Cancel"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 h-10 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving && <span className="material-symbols-outlined text-[16px] animate-spin">hourglass_top</span>}
              {"Save Product"}
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-lg pb-28 md:pb-12">
          <form onSubmit={handleSubmit} className="w-full max-w-7xl mx-auto space-y-lg md:space-y-xl">
            {error && (
              <div className="p-md bg-error-container/20 border border-error/30 rounded-xl text-error font-body-md">{error}</div>
            )}

            <div className="bg-surface-container-lowest p-lg md:p-xl lg:p-2xl rounded-2xl border border-outline-variant/10 space-y-lg md:space-y-xl">
              <h2 className="font-headline-md md:font-headline-lg text-on-surface">{"Basic Info"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg md:gap-xl">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelCls}>{"Product Name"} *</label>
                  <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} className={inputCls} placeholder="e.g. Wireless Headphones Pro" />
                </div>
                <div>
                  <label className={labelCls}>{"Slug"}</label>
                  <input value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputCls} placeholder="auto-generated" />
                </div>
                <div>
                  <label className={labelCls}>{"Brand"} *</label>
                  <input value={form.brand} onChange={(e) => update("brand", e.target.value)} className={inputCls} placeholder="e.g. Sony" />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelCls}>{"Description"} *</label>
                  <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className={`${inputCls} h-auto py-3 resize-none`} placeholder="Product description..." />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-lg md:p-xl lg:p-2xl rounded-2xl border border-outline-variant/10 space-y-lg md:space-y-xl">
              <h2 className="font-headline-md md:font-headline-lg text-on-surface">{"Pricing & Stock"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg md:gap-xl">
                <div>
                  <label className={labelCls}>{"Price"} *</label>
                  <input value={form.price} onChange={(e) => update("price", e.target.value)} type="number" step="0.01" min="0" className={inputCls} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelCls}>{"Original Price"}</label>
                  <input value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} type="number" step="0.01" min="0" className={inputCls} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelCls}>{"Stock"}</label>
                  <input value={form.stock} onChange={(e) => update("stock", e.target.value)} type="number" min="0" className={inputCls} placeholder="0" />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-lg md:p-xl lg:p-2xl rounded-2xl border border-outline-variant/10 space-y-lg md:space-y-xl">
              <h2 className="font-headline-md md:font-headline-lg text-on-surface">{"Organization"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg md:gap-xl">
                <div>
                  <label className={labelCls}>{"Category"} *</label>
                  <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className={inputCls}>
                    <option value="">{"Select category"}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{"Vendor"} *</label>
                  <select value={form.vendorId} onChange={(e) => update("vendorId", e.target.value)} className={inputCls}>
                    <option value="">{"Select vendor"}</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-1 md:pb-2 lg:pb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => update("featured", e.target.checked)}
                      className="w-5 h-5 md:w-6 md:h-6 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="font-body-md md:font-body-lg text-on-surface">{"Featured Product"}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-lg md:p-xl lg:p-2xl rounded-2xl border border-outline-variant/10 space-y-lg md:space-y-xl">
              <h2 className="font-headline-md md:font-headline-lg text-on-surface">{"Media & Specs"}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg md:gap-xl">
                <div className="space-y-3">
                  <label className={labelCls}>{"Media Upload"}</label>
                  <div className="flex items-center gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 h-10 md:h-12 px-4 border-2 border-dashed border-outline-variant/40 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors font-body-md text-on-surface-variant ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                      <span className="material-symbols-outlined text-[18px]">{uploading ? "hourglass_top" : "cloud_upload"}</span>
                      {uploading ? "Uploading..." : "Choose images or videos"}
                      <input type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                  <label className={labelCls}>{"Image URLs"}</label>
                  <textarea value={form.images} onChange={(e) => update("images", e.target.value)} rows={4} className={`${inputCls} h-auto py-3 resize-none font-mono text-label-sm md:text-body-md`} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
                  <p className="font-label-sm md:font-label-md text-outline mt-1">{"Enter one URL per line"}</p>
                </div>
                <div>
                  <label className={labelCls}>{"Specs"}</label>
                  <textarea value={form.specs} onChange={(e) => update("specs", e.target.value)} rows={4} className={`${inputCls} h-auto py-3 resize-none font-mono text-label-sm md:text-body-md`} placeholder='{"weight": "0.5 kg", "color": "Black"}' />
                </div>
              </div>
            </div>
          </form>
        </div>
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-2 h-16 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard"><span className="material-symbols-outlined">dashboard</span><span className="font-label-sm text-label-sm">{"Dashboard"}</span></a>
          <a className="flex flex-col items-center justify-center text-primary bg-primary-container/30 rounded-full px-4 py-1" href="/admin/products"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span><span className="font-label-sm text-label-sm">{"Products"}</span></a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/financial"><span className="material-symbols-outlined">account_balance</span><span className="font-label-sm text-label-sm">{"Financial Reports"}</span></a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/profit-loss"><span className="material-symbols-outlined">analytics</span><span className="font-label-sm text-label-sm">{"Profit & Loss"}</span></a>
           <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard"><span className="material-symbols-outlined">dashboard</span><span className="font-label-sm text-label-sm">{"Dashboard"}</span></a>
        </nav>
      </main>
  );
}
