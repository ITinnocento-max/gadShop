"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { CustomerGuard } from "@/components/customer/customer-guard";
import { useTranslation } from "@/hooks/useTranslation";

interface PaymentMethod {
  id: string;
  type: "momo" | "airtel" | "visa" | "mastercard";
  label: string;
  details: string;
  isDefault: boolean;
  icon: string;
  iconBg: string;
}

const initialMethods: PaymentMethod[] = [
  { id: "pm1", type: "momo", label: "MTN MoMo", details: "+256 770 123 456", isDefault: true, icon: "smartphone", iconBg: "bg-[#FFCC00]/20" },
  { id: "pm2", type: "visa", label: "Visa Card", details: "•••• 4821", isDefault: false, icon: "credit_card", iconBg: "bg-primary/10" },
  { id: "pm3", type: "airtel", label: "Airtel Money", details: "+256 750 987 654", isDefault: false, icon: "smartphone", iconBg: "bg-[#E11900]/10" },
];

export default function PaymentMethodsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);

  const setDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const removeMethod = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <CustomerGuard>
      <Header showBack title={t("account.payment_methods")} />
      <main className="flex-grow pt-4 pb-28 px-margin-mobile max-w-4xl mx-auto w-full">
        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t("account.saved_methods")}</h2>
            <span className="text-on-surface-variant dark:text-outline font-label-md">{methods.length} {t("common.items_saved")}</span>
          </div>

          {methods.map((method) => (
            <div key={method.id} className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-md shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 border border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-md group hover:shadow-raised transition-all">
              <div className={`w-12 h-12 rounded-xl ${method.iconBg} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-on-surface dark:text-white">{method.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-label-md text-on-surface dark:text-white truncate">{method.label}</p>
                  {method.isDefault && (
                    <span className="text-[10px] bg-primary-container/20 text-primary px-2 py-0.5 rounded-full font-label-sm uppercase tracking-wider">{t("account.default_badge")}</span>
                  )}
                </div>
                <p className="font-label-sm text-on-surface-variant dark:text-outline">{method.details}</p>
              </div>
              <div className="flex items-center gap-1">
                {!method.isDefault && (
                  <button
                    onClick={() => setDefault(method.id)}
                    className="px-3 py-1.5 text-label-sm font-label-sm text-primary hover:bg-primary-container/10 rounded-lg transition-colors active:scale-95"
                  >
                    {t("account.set_default")}
                  </button>
                )}
                <button
                  onClick={() => removeMethod(method.id)}
                  className="w-9 h-9 flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 rounded-full transition-colors active:scale-90"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-xl">
          <button className="w-full py-4 bg-primary text-on-primary rounded-xl font-label-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md">
            <span className="material-symbols-outlined">add</span>
            {t("account.add_payment_method")}
          </button>
          <p className="text-center text-label-sm text-on-surface-variant mt-md flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            {t("account.payment_encrypted")}
          </p>
        </section>

        <section className="mt-xl bg-surface-container-low dark:bg-surface-variant/10 rounded-xl p-lg border border-outline-variant/10 dark:border-outline-variant/20">
          <h3 className="font-label-md text-on-surface dark:text-white mb-md">{t("account.supported_types")}</h3>
          <div className="grid grid-cols-4 gap-md">
            {[
              { icon: "smartphone", label: "MoMo", bg: "bg-[#FFCC00]/20" },
              { icon: "smartphone", label: "Airtel", bg: "bg-[#E11900]/10" },
              { icon: "credit_card", label: "Visa", bg: "bg-primary/10" },
              { icon: "credit_card", label: "Mastercard", bg: "bg-secondary/10" },
            ].map((p) => (
              <div key={p.label} className="flex flex-col items-center gap-1 p-3 bg-surface dark:bg-inverse-surface rounded-xl">
                <div className={`w-10 h-10 rounded-lg ${p.bg} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-on-surface dark:text-white text-[20px]">{p.icon}</span>
                </div>
                <span className="font-label-sm text-on-surface-variant dark:text-outline">{p.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </CustomerGuard>
  );
}
