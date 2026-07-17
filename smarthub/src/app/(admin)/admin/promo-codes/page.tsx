"use client";

import { useEffect, useState, useCallback } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useTranslation } from "@/hooks/useTranslation";

interface PromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  productId: string | null;
  userId: string | null;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  description: string | null;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  productId: "",
  userId: "",
  maxUses: "1",
  description: "",
};

export default function AdminPromoCodesPage() {
  const { t } = useTranslation();
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "15");

    try {
      const res = await fetch(`/api/admin/promo-codes?${params}`);
      const data = await res.json();
      setPromoCodes(data.promoCodes || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const fetchFormData = async () => {
    try {
      const [prodRes, userRes] = await Promise.all([
        fetch("/api/admin/products?limit=100").then((r) => r.json()),
        fetch("/api/admin/users?limit=100").then((r) => r.json()),
      ]);
      setProducts(prodRes.products || []);
      setUsers(userRes.users || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (showForm) fetchFormData();
  }, [showForm]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        maxUses: parseInt(form.maxUses) || 1,
      };
      if (form.code.trim()) body.code = form.code.trim().toUpperCase();
      if (form.productId) body.productId = form.productId;
      if (form.userId) body.userId = form.userId;
      if (form.description.trim()) body.description = form.description.trim();

      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        setForm(emptyForm);
        fetchPromoCodes();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create promo code");
      }
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteId(null);
        fetchPromoCodes();
      }
    } catch {
      // ignore
    }
    setDeleting(false);
  };

  const toggleActive = async (promo: PromoCode) => {
    try {
      await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      fetchPromoCodes();
    } catch {
      // ignore
    }
  };

  const fmt = (v: number) => "RWF " + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-lg md:p-xl max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
            <div>
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden mb-sm text-on-surface-variant">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{t("admin.promo_codes")}</h1>
              <p className="font-body-md text-on-surface-variant dark:text-outline mt-xs">{t("admin.create_promo_code")}</p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
              className="bg-primary text-on-primary h-12 px-6 rounded-full font-label-md flex items-center justify-center gap-base hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">{showForm ? "close" : "add"}</span>
              {showForm ? t("common.cancel") : t("admin.create_promo_code")}
            </button>
          </div>

          {showForm && (
            <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-soft mb-xl border border-outline-variant/10 dark:border-outline-variant/20">
              <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white mb-lg">{t("admin.create_promo_code")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant dark:text-outline mb-xs">{t("admin.promo_code")}</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full h-12 px-md bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t("admin.code_optional_hint")}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant dark:text-outline mb-xs">{t("admin.discount_type")}</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full h-12 px-md bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="percentage">{t("admin.percentage")}</option>
                    <option value="fixed_amount">{t("admin.fixed_amount")}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant dark:text-outline mb-xs">{t("admin.discount_value")}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full h-12 px-md bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={form.discountType === "percentage" ? "10" : "5000"}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant dark:text-outline mb-xs">{t("admin.max_uses")}</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    className="w-full h-12 px-md bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant dark:text-outline mb-xs">{t("admin.target_product")}</label>
                  <select
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    className="w-full h-12 px-md bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t("admin.all_products")}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {fmt(p.price)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant dark:text-outline mb-xs">{t("admin.target_user")}</label>
                  <select
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    className="w-full h-12 px-md bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t("admin.all_users")}</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant dark:text-outline mb-xs">{t("admin.description_optional")}</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full h-12 px-md bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t("admin.description_optional")}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-md mt-lg">
                <button
                  onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="px-6 h-10 rounded-full border border-outline-variant text-on-surface hover:bg-surface-variant/30 font-label-md"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !form.discountValue}
                  className="px-6 h-10 rounded-full bg-primary text-on-primary font-label-md hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? "..." : t("common.save")}
                </button>
              </div>
            </div>
          )}

          <div className="mb-lg">
            <div className="relative">
              <span className="absolute left-md top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">search</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-12 pl-12 pr-md bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg focus:ring-2 focus:ring-primary"
                placeholder={t("common.search")}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-xl">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="text-center py-xl">
              <span className="material-symbols-outlined text-[48px] text-outline">local_offer</span>
              <p className="font-body-lg text-on-surface-variant mt-md">{t("admin.no_promo_codes")}</p>
            </div>
          ) : (
            <div className="space-y-md">
              {promoCodes.map((promo) => (
                <div key={promo.id} className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-soft border border-outline-variant/10 dark:border-outline-variant/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                    <div className="flex items-center gap-md">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${promo.isActive ? "bg-primary/10" : "bg-outline/10"}`}>
                        <span className={`material-symbols-outlined text-[24px] ${promo.isActive ? "text-primary" : "text-outline"}`}>local_offer</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-label-lg text-label-lg text-on-surface dark:text-white font-mono">{promo.code}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-label-sm uppercase ${promo.isActive ? "bg-secondary-container/30 text-on-secondary-container" : "bg-outline/20 text-outline"}`}>
                            {promo.isActive ? t("admin.active") : t("admin.inactive")}
                          </span>
                        </div>
                        <p className="font-body-sm text-on-surface-variant dark:text-outline">
                          {promo.discountType === "percentage" ? `${promo.discountValue}%` : fmt(promo.discountValue)}
                          {t("admin.discount_value").toLowerCase()}
                          {promo.description ? ` — ${promo.description}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="font-label-sm text-on-surface-variant">
                        {promo.currentUses}/{promo.maxUses} {t("admin.current_uses").toLowerCase()}
                      </span>
                      <button
                        onClick={() => toggleActive(promo)}
                        className={`px-3 py-1.5 rounded-lg font-label-sm ${promo.isActive ? "text-error hover:bg-error-container/20" : "text-secondary hover:bg-secondary-container/20"}`}
                      >
                        {promo.isActive ? t("admin.inactive") : t("admin.active")}
                      </button>
                      <button
                        onClick={() => setDeleteId(promo.id)}
                        className="w-9 h-9 flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-sm mt-xl">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-label-md ${p === page ? "bg-primary text-on-primary" : "bg-surface-container hover:bg-surface-variant/30 text-on-surface"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-md" onClick={() => setDeleteId(null)}>
          <div className="bg-surface-container-lowest rounded-xl p-lg max-w-sm w-full shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white mb-md">{t("admin.confirm_delete_promo")}</h3>
            <div className="flex justify-end gap-md mt-lg">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-variant/30 font-label-md">
                {t("common.cancel")}
              </button>
              <button
                onClick={() => deleteId && handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-error text-on-error font-label-md hover:brightness-110 disabled:opacity-50"
              >
                {deleting ? "..." : t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
