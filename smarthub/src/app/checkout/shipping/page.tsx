"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { CustomerGuard } from "@/components/customer/customer-guard";
import { CheckoutStepper } from "@/components/ui/checkout-stepper";
import { useCartStore } from "@/stores/cart-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useTranslation } from "@/hooks/useTranslation";

const shippingMethods = [
  { id: "standard", icon: "package_2", labelKey: "cart.standard", descKey: "checkout.business_days_5_7", cost: 0, color: "text-secondary dark:text-secondary" },
  { id: "express", icon: "rocket_launch", labelKey: "cart.express", descKey: "checkout.business_days_1_2", cost: 15, color: "text-primary dark:text-inverse-primary" },
  { id: "pickup", icon: "store", labelKey: "checkout.in_store_pickup", descKey: "checkout.available_tomorrow", cost: 0, color: "text-secondary dark:text-secondary" },
];

export default function ShippingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("CA");
  const [zip, setZip] = useState("");
  const [shippingId, setShippingId] = useState("standard");
  const setShippingAddress = useCheckoutStore((s) => s.setShippingAddress);
  const setShippingMethod = useCheckoutStore((s) => s.setShippingMethod);

  const handleContinue = () => {
    setShippingAddress({ firstName, lastName, street, city, state, zip });
    setShippingMethod(shippingId);
    router.push("/checkout/payment");
  };
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const shipping = shippingMethods.find((m) => m.id === shippingId)!;
  const tax = subtotal * 0.085;
  const total = subtotal + shipping.cost + tax;
  return (
    <CustomerGuard>
      <Header showBack title="SmartHub" />
      <main className="pt-24 pb-2xl px-margin-mobile max-w-7xl mx-auto">
        <div className="mb-xl">
          <CheckoutStepper currentStep={2} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 space-y-lg">
            <section className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl shadow-sm dark:shadow-none border border-outline-variant/30">
              <div className="flex items-center gap-base mb-lg">
                <span className="material-symbols-outlined text-primary dark:text-inverse-primary">location_on</span>
                <h2 className="font-headline-md text-headline-md">{t("checkout.delivery_address")}</h2>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="md:col-span-1">
                  <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.first_name")}</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full h-12 bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg px-md focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary transition-all" placeholder="John" type="text" />
                </div>
                <div className="md:col-span-1">
                  <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.last_name")}</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full h-12 bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg px-md focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary transition-all" placeholder="Doe" type="text" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.street_address")}</label>
                  <input value={street} onChange={(e) => setStreet(e.target.value)} className="w-full h-12 bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg px-md focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary transition-all" placeholder="123 Tech Lane, Silicon Valley" type="text" />
                </div>
                <div className="md:col-span-1">
                  <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.city")}</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-12 bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg px-md focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary transition-all" placeholder="Mountain View" type="text" />
                </div>
                <div className="md:col-span-1 grid grid-cols-2 gap-sm">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.state")}</label>
                    <select value={state} onChange={(e) => setState(e.target.value)} className="w-full h-12 bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg px-md focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary transition-all">
                      <option>CA</option>
                      <option>NY</option>
                      <option>TX</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.zip")}</label>
                    <input value={zip} onChange={(e) => setZip(e.target.value)} className="w-full h-12 bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg px-md focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary transition-all" placeholder="94043" type="text" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-sm cursor-pointer group">
                    <input className="w-5 h-5 rounded border-outline-variant dark:border-outline-variant/30 text-primary dark:text-inverse-primary focus:ring-primary dark:focus:ring-inverse-primary" type="checkbox" />
                    <span className="font-body-md text-body-md text-on-surface-variant dark:text-outline group-hover:text-on-surface dark:group-hover:text-white">{t("checkout.same_as_billing")}</span>
                  </label>
                </div>
              </form>
            </section>
            <section className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl shadow-sm dark:shadow-none border border-outline-variant/30">
              <div className="flex items-center gap-base mb-lg">
                <span className="material-symbols-outlined text-primary dark:text-inverse-primary">local_shipping</span>
                <h2 className="font-headline-md text-headline-md">{t("checkout.shipping_method")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                {shippingMethods.map((method) => (
                  <div key={method.id} className="relative group">
                    <input checked={shippingId === method.id} onChange={() => setShippingId(method.id)} className="peer absolute opacity-0" id={method.id} name="shipping" type="radio" />
                    <label className="flex flex-col h-full border-2 border-surface-container-highest dark:border-surface-variant/20 rounded-xl p-md cursor-pointer transition-all peer-checked:border-primary dark:peer-checked:border-inverse-primary peer-checked:bg-primary-container/5 dark:peer-checked:bg-primary-container/10 hover:bg-surface-container-low dark:hover:bg-surface-variant/10" htmlFor={method.id}>
                      <div className="flex justify-between items-start mb-base">
                        <span className="material-symbols-outlined text-on-surface-variant dark:text-outline group-hover:text-primary dark:group-hover:text-inverse-primary transition-colors">{method.icon}</span>
                        <span className={`font-label-md text-label-md ${method.color}`}>{method.cost === 0 ? t("checkout.free") : `Rwf ${method.cost.toFixed(2)}`}</span>
                      </div>
                      <span className="font-headline-md text-[18px] text-on-surface dark:text-white mb-xs">{t(method.labelKey)}</span>
                      <span className="font-body-md text-label-sm text-on-surface-variant dark:text-outline">{t(method.descKey)}</span>
                    </label>
                    <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100">
                      <span className="material-symbols-outlined text-primary dark:text-inverse-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <aside className="lg:col-span-4">
            <div className="bg-surface-container-low dark:bg-surface-variant/10 p-lg rounded-xl sticky top-24 border border-outline-variant/30">
              <h3 className="font-headline-md text-[20px] mb-lg text-on-surface dark:text-white">{t("checkout.order_summary")}</h3>
              {items.length === 0 ? (
                <p className="text-on-surface-variant font-label-md mb-lg">{t("cart.empty_title")}</p>
              ) : (
              <div className="space-y-md mb-lg">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-md">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-label-md text-on-surface dark:text-white truncate">{item.name}</h4>
                      <p className="text-label-sm text-on-surface-variant dark:text-outline">{t("checkout.qty")}: {item.quantity}</p>
                      <p className="font-label-md text-primary dark:text-inverse-primary">Rwf {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
              <div className="border-t border-outline-variant/30 pt-md space-y-base mb-lg">
                <div className="flex justify-between text-body-md text-on-surface-variant dark:text-outline">
                  <span>{t("checkout.subtotal")}</span>
                  <span>Rwf {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant dark:text-outline">
                  <span>{t("checkout.shipping")}</span>
                  <span id="shipping-cost" className={shipping.cost === 0 ? "text-secondary" : "text-on-surface dark:text-white"}>
                    {shipping.cost === 0 ? t("checkout.free") : `Rwf ${shipping.cost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant dark:text-outline">
                  <span>{t("checkout.tax")}</span>
                  <span>Rwf {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-headline-md text-headline-md pt-base border-t border-outline-variant/30">
                  <span>{t("checkout.total")}</span>
                  <span className="text-primary dark:text-inverse-primary">Rwf {total.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={handleContinue} className="w-full bg-primary text-on-primary h-14 rounded-full font-headline-md text-[18px] hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center">
                {t("checkout.continue_to_payment")}
              </button>
              <p className="text-center text-label-sm text-on-surface-variant dark:text-outline mt-md flex items-center justify-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                {t("checkout.secure_encrypted")}
              </p>
            </div>
          </aside>
        </div>
      </main>
      <BottomNav />
    </CustomerGuard>
  );
}
