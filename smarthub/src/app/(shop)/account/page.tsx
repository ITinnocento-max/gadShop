"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { CustomerGuard } from "@/components/customer/customer-guard";
import { useTranslation } from "@/hooks/useTranslation";

const languages = ["en", "fr", "sw", "rw"] as const;
const langLabels: Record<string, string> = { en: "English (US)", fr: "Fran&ccedil;ais", sw: "Kiswahili", rw: "Ikinyarwanda" };

const statusColors: Record<string, string> = {
  PENDING: "bg-warning",
  PROCESSING: "bg-secondary",
  SHIPPED: "bg-secondary",
  DELIVERED: "bg-tertiary",
  CANCELLED: "bg-error",
};
const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  product: { images: string[] };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function AccountPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, toggleTheme, language, setLanguage, setMobileMenuOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetch(`/api/orders?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const lastOrder = orders[0];

  const toPay = orders.filter((o) => o.status === "PENDING").length;
  const processing = orders.filter((o) => o.status === "PROCESSING" || o.status === "SHIPPED").length;
  const completed = orders.filter((o) => o.status === "DELIVERED").length;

  const cycleLanguage = () => {
    const idx = languages.indexOf(language as typeof languages[number]);
    setLanguage(languages[(idx + 1) % languages.length]);
  };

  return (
    <CustomerGuard>
      <header className="fixed top-0 w-full z-30 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 h-16 flex items-center justify-between px-margin-mobile">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileMenuOpen(true)} className="active:scale-95 transition-transform text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-headline-md-mobile font-bold text-primary">{t("common.app_name")}</h1>
        </div>
        <button onClick={() => router.push("/cart")} className="active:scale-95 transition-transform text-primary">
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>
      </header>
      <main className="pt-20 pb-24 px-margin-mobile max-w-4xl mx-auto w-full">
        <section className="flex flex-col items-center mt-4 mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-inverse-surface shadow-lg">
              <img className="w-full h-full object-cover" src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCTZpYH3lFSG415REHBkLO6WNwRC9-MNrBh5R45MSGwC4U5MBUioLxSkJvrqIPwot_uTyrSrfr6BjHOJCqLdqAsgIhgiEz5dMxI4-15AtQGzrrt-AHPjnUbxw0hSyAjodPcNqSEdj7qvunWfaSCFWVZhromLzMFzx9olvcxyO30etn0kwDWX0zot4c6rPwFvu0DPKQK_3ht9hn75NCNZ-PcM-dwYfz-8YFUueMZ0W-dnePJz-x44IKC1g"} alt="Profile" />
            </div>
            <button onClick={() => router.push("/account")} className="absolute bottom-0 right-0 bg-primary text-on-primary p-1.5 rounded-full shadow-md active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <div className="text-center mt-4">
            <h2 className="font-headline-md text-headline-md-mobile text-on-surface dark:text-white">{user?.name || "Guest"}</h2>
            <p className="font-body-md text-on-surface-variant dark:text-outline">{user?.email || ""}</p>
          </div>
        </section>
        <section className="mb-8">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 border border-outline-variant/30 dark:border-outline-variant/20">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-label-md text-on-surface dark:text-white">{t("account.recent_order")}</h3>
              <button onClick={() => router.push("/orders")} className="text-primary font-label-sm hover:opacity-80 transition-opacity">{t("account.track_all")}</button>
            </div>
            {loading ? (
              <div className="h-16 flex items-center justify-center text-on-surface-variant">Loading...</div>
            ) : lastOrder ? (
              <div className="flex items-center gap-md">
                <div className="w-16 h-16 bg-surface-container dark:bg-surface-variant/15 rounded-lg overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" src={lastOrder.items[0]?.product?.images?.[0] || lastOrder.items[0]?.image || ""} alt={lastOrder.items[0]?.name || "Order"} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${statusColors[lastOrder.status] || "bg-outline"}`} />
                    <p className={`font-label-sm ${lastOrder.status === "SHIPPED" ? "text-secondary" : "text-on-surface-variant"}`}>{statusLabels[lastOrder.status] || lastOrder.status}</p>
                  </div>
                  <p className="font-label-md text-on-surface dark:text-white truncate">{lastOrder.items[0]?.name || `Order #${lastOrder.id.slice(0, 8)}`}</p>
                  <p className="font-label-sm text-on-surface-variant dark:text-outline">{new Date(lastOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => router.push(`/orders/${lastOrder.id}`)} className="text-outline-variant dark:text-outline-variant/30">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            ) : (
              <p className="text-on-surface-variant font-label-md">No orders yet</p>
            )}
            <div className="mt-md pt-md border-t border-outline-variant/30 dark:border-outline-variant/20 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-headline-md text-primary">{toPay}</p>
                <p className="font-label-sm text-on-surface-variant dark:text-outline">{t("account.to_pay")}</p>
              </div>
              <div>
                <p className="font-headline-md text-primary">{processing}</p>
                <p className="font-label-sm text-on-surface-variant dark:text-outline">{t("account.processing")}</p>
              </div>
              <div>
                <p className="font-headline-md text-primary">{completed}</p>
                <p className="font-label-sm text-on-surface-variant dark:text-outline">{t("account.completed")}</p>
              </div>
            </div>
          </div>
        </section>
        <nav className="space-y-2">
          <h4 className="font-label-sm text-outline dark:text-outline-variant px-2 py-1">{t("account.account_preferences")}</h4>
          <a className="flex items-center justify-between p-md bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none hover:bg-surface-container dark:hover:bg-surface-variant/15 transition-colors active:scale-[0.98]" href="/orders">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary dark:text-inverse-primary">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <span className="font-label-md text-on-surface dark:text-white">{t("account.my_orders")}</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant dark:text-outline-variant/30">chevron_right</span>
          </a>
          <button onClick={() => router.push("/wishlist")} className="w-full flex items-center justify-between p-md bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none hover:bg-surface-container dark:hover:bg-surface-variant/15 transition-colors active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">favorite</span>
              </div>
              <span className="font-label-md text-on-surface dark:text-white">{t("account.wishlist")}</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant dark:text-outline-variant/30">chevron_right</span>
          </button>
          <button onClick={() => router.push("/account/payment-methods")} className="w-full flex items-center justify-between p-md bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none hover:bg-surface-container dark:hover:bg-surface-variant/15 transition-colors active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span className="font-label-md text-on-surface dark:text-white">{t("account.payment_methods")}</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant dark:text-outline-variant/30">chevron_right</span>
          </button>
          <h4 className="font-label-sm text-outline dark:text-outline-variant px-2 py-1 mt-4">{t("account.settings")}</h4>
          <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none divide-y divide-outline-variant/20 dark:divide-outline-variant/30 overflow-hidden">
            <button onClick={cycleLanguage} className="w-full flex items-center justify-between p-md hover:bg-surface-container dark:hover:bg-surface-variant/15 transition-colors active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high dark:bg-surface-variant/20 flex items-center justify-center text-on-surface-variant dark:text-outline">
                  <span className="material-symbols-outlined">language</span>
                </div>
                <div className="text-left">
                  <span className="block font-label-md text-on-surface dark:text-white">{t("account.language")}</span>
                  <span className="block font-label-sm text-on-surface-variant dark:text-outline">{langLabels[language] || t("account.language")}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant dark:text-outline-variant/30">chevron_right</span>
            </button>
            <button onClick={toggleTheme} className="w-full flex items-center justify-between p-md hover:bg-surface-container dark:hover:bg-surface-variant/15 transition-colors active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high dark:bg-surface-variant/20 flex items-center justify-center text-on-surface-variant dark:text-outline">
                  <span className="material-symbols-outlined">{theme === "dark" ? "dark_mode" : "light_mode"}</span>
                </div>
                <div className="text-left">
                  <span className="block font-label-md text-on-surface dark:text-white">{t("account.appearance")}</span>
                  <span className="block font-label-sm text-on-surface-variant dark:text-outline">{theme === "dark" ? t("account.dark_mode") : t("account.light_mode")}</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${theme === "dark" ? "bg-primary" : "bg-outline-variant"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${theme === "dark" ? "left-7" : "left-1"}`} />
              </div>
            </button>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }} className="w-full mt-6 flex items-center justify-center gap-2 p-md border border-error/20 text-error rounded-xl bg-error/5 hover:bg-error/10 transition-colors active:scale-95">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md">{t("common.logout")}</span>
          </button>
        </nav>
      </main>
      {/* Bottom Navigation — Design Spec */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-2 pb-safe bg-surface dark:bg-inverse-surface shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 border-t border-outline-variant/30 dark:border-outline-variant/20 z-50">
        <a className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline hover:bg-surface-variant/50 transition-all rounded-full px-4 py-1" href="/">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-sm text-label-sm">{t("nav.home")}</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline hover:bg-surface-variant/50 transition-all rounded-full px-4 py-1" href="/products">
          <span className="material-symbols-outlined">category</span>
          <span className="font-label-sm text-label-sm">{t("nav.categories")}</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline hover:bg-surface-variant/50 transition-all rounded-full px-4 py-1" href="/orders">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="font-label-sm text-label-sm">{t("nav.orders")}</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline hover:bg-surface-variant/50 transition-all rounded-full px-4 py-1" href="/cart">
          <span className="material-symbols-outlined">shopping_bag</span>
          <span className="font-label-sm text-label-sm">{t("nav.cart")}</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-primary-container/10 text-primary dark:text-inverse-primary rounded-full px-4 py-1" href="/account">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-label-sm text-label-sm">{t("nav.profile")}</span>
        </a>
      </nav>
    </CustomerGuard>
  );
}
