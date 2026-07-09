"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useUIStore } from "@/stores/ui-store";

import { FinancialSidebar } from "@/components/admin/financial-sidebar";

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);

  return (
    <>
      <FinancialSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <button className="lg:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">finance</span>
            </button>
            <h1 className="font-headline-md text-headline-md-mobile md:text-headline-md text-primary">{t("admin.financial_reports")}</h1>
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
        <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-lg pb-28 md:pb-12">
          {children}
        </div>
        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-2 h-16 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-sm text-label-sm">{t("admin.dashboard")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/products">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-sm text-label-sm">{t("admin.products")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-primary bg-primary-container/30 rounded-full px-4 py-1" href="/admin/financial">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            <span className="font-label-sm text-label-sm">{t("admin.financial_reports")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/profit-loss">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-sm text-label-sm">{t("admin.profit_loss")}</span>
          </a>
        </nav>
      </main>
    </>
  );
}
