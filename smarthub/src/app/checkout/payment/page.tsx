"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { CheckoutStepper } from "@/components/ui/checkout-stepper";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useTranslation } from "@/hooks/useTranslation";

export default function PaymentPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const { shippingAddress, shippingMethod, clearCheckout } = useCheckoutStore();
  const [submitting, setSubmitting] = useState(false);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "airtel" | "card">("momo");

  const methodMap: Record<string, string> = { momo: "MTN_MOMO", airtel: "AIRTEL_MONEY", card: "VISA" };

  async function handleCompletePayment() {
    if (!user?.id || items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          paymentMethod: methodMap[paymentMethod],
          total,
          shippingAddress: shippingAddress || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      clearCart();
      clearCheckout();
      router.push("/orders");
    } catch {
      alert("Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header showBack title="SmartHub" />
      <main className="max-w-7xl mx-auto px-margin-mobile py-lg pb-28">
        <div className="mb-xl">
          <CheckoutStepper currentStep={3} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-8 space-y-lg">
            <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10">
              <div className="flex items-center gap-base mb-lg">
                <span className="material-symbols-outlined text-primary dark:text-inverse-primary">payments</span>
                <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t("checkout.payment_method")}</h2>
              </div>
              <div className="space-y-md">
                <div className="border border-outline-variant dark:border-outline-variant/30 rounded-xl overflow-hidden">
                  <div className="bg-surface-container-low dark:bg-surface-variant/10 px-md py-base font-label-md text-label-md text-on-surface-variant dark:text-outline">{t("checkout.mobile_money")}</div>
                  <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
                    <label className={`relative flex items-center p-md border-2 rounded-xl cursor-pointer hover:bg-surface-container-low dark:hover:bg-surface-variant/10 transition-all ${paymentMethod === "momo" ? "border-primary dark:border-inverse-primary" : "border-outline-variant dark:border-outline-variant/30"}`}>
                      <input checked={paymentMethod === "momo"} onChange={() => setPaymentMethod("momo")} className="hidden peer" name="payment" type="radio" />
                      <div className="flex items-center gap-md w-full">
                        <div className="w-12 h-12 rounded-lg bg-[#FFCC00] flex items-center justify-center p-xs">
                          <img className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtmXpjh8k-2xAsJ2ey89HMRXVzG2M9B_p5RK_AHInFGn8qQdY6mamlPChX-dVbyHSNzdidJ8AwnPUFd_CY0cNvQxJ9zWhTA6boM4PVHc3sYbrVeh5BEkb4ktZTwBEXH5JAb3uSEVfX7RLRWHDb31tTI8HmRGGpTkHfFyafPz789p5ONSS-mqhVdNnSJndeai_Gm7-EDfsortBfN6wn8YKjOqONiSpvSVQDg1HnDm463_J7QJntMxDhKg" alt="MTN MoMo" />
                        </div>
                        <div className="flex-1">
                          <p className="font-label-md text-label-md text-on-surface dark:text-white">MTN MoMo</p>
                          <p className="text-[10px] text-on-surface-variant dark:text-outline uppercase tracking-wider">{t("checkout.fast_secure")}</p>
                        </div>
                        <span className={`material-symbols-outlined text-primary dark:text-inverse-primary ${paymentMethod === "momo" ? "opacity-100" : "opacity-0"}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    </label>
                    <label className={`relative flex items-center p-md border-2 rounded-xl cursor-pointer hover:bg-surface-container-low dark:hover:bg-surface-variant/10 transition-all ${paymentMethod === "airtel" ? "border-primary dark:border-inverse-primary" : "border-outline-variant dark:border-outline-variant/30"}`}>
                      <input checked={paymentMethod === "airtel"} onChange={() => setPaymentMethod("airtel")} className="hidden peer" name="payment" type="radio" />
                      <div className="flex items-center gap-md w-full">
                        <div className="w-12 h-12 rounded-lg bg-[#E11900] flex items-center justify-center p-xs">
                          <img className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaCJjiZTVPagKiDTBObQuLpx5ILWP_x7OIpVRLr1P8Ifh3QzNxrXytzOMUZ2IEh83pstF4eJ6DIk37CyQdb25DltdIh3V5S_2UrIWRoeo8UPxUSZdZULbGVdtymMXHfgO_6EyikyPqVzRZIwEGmt_NJGjJeY1FVqrz9x-c-jinSom2zyeZtJUJhEsuB4-GsvdNY0hoyJvoFWFV6PgTjrTDRzCOWJ3202DaAzw4YrRtIMTyOOxmIjinAQ" alt="Airtel Money" />
                        </div>
                        <div className="flex-1">
                          <p className="font-label-md text-label-md text-on-surface dark:text-white">Airtel Money</p>
                          <p className="text-[10px] text-on-surface-variant dark:text-outline uppercase tracking-wider">{t("checkout.instant_pay")}</p>
                        </div>
                        <span className={`material-symbols-outlined text-primary dark:text-inverse-primary ${paymentMethod === "airtel" ? "opacity-100" : "opacity-0"}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="border border-outline-variant dark:border-outline-variant/30 rounded-xl overflow-hidden">
                  <div className="bg-surface-container-low dark:bg-surface-variant/10 px-md py-base font-label-md text-label-md text-on-surface-variant dark:text-outline">{t("checkout.credit_card")}</div>
                  <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
                    <label className={`relative flex items-center p-md border-2 rounded-xl cursor-pointer hover:bg-surface-container-low dark:hover:bg-surface-variant/10 transition-all ${paymentMethod === "card" ? "border-primary dark:border-inverse-primary" : "border-outline-variant dark:border-outline-variant/30"}`}>
                      <input checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="hidden peer" name="payment" type="radio" />
                      <div className="flex items-center gap-md w-full">
                        <div className="w-12 h-8 rounded bg-[#1434CB] flex items-center justify-center p-xs">
                          <img className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCilSR6IVihns1lkvbY4CMBnKL2qES3zLfMEBiRAWGUC0rQM9Xt4MFh9uWkEYvvcm9rTPOqcZ177OcQSS8xex1QPj4CoIN7tjDVjLNTFva4InY6il7y1RRm_P50OnA6az_t9734Z-0B8W1b1T0e7JCiRiEpOi_A7kAPqK5E1pv7Has7CdStsYylGHxZcDMWYbZaWH3IK4ucpL1Cxcua0KhkgoFjnfz1514NZ0zRqC5Z46c8B0VSYI7UQQ" alt="Visa" />
                        </div>
                        <div className="flex-1">
                          <p className="font-label-md text-label-md text-on-surface dark:text-white">Visa</p>
                          <p className="text-[10px] text-on-surface-variant dark:text-outline uppercase tracking-wider">{t("checkout.international")}</p>
                        </div>
                        <span className={`material-symbols-outlined text-primary dark:text-inverse-primary ${paymentMethod === "card" ? "opacity-100" : "opacity-0"}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    </label>
                    <label className={`relative flex items-center p-md border-2 rounded-xl cursor-pointer hover:bg-surface-container-low dark:hover:bg-surface-variant/10 transition-all ${paymentMethod === "card" ? "border-primary dark:border-inverse-primary" : "border-outline-variant dark:border-outline-variant/30"}`}>
                      <input checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="hidden peer" name="payment" type="radio" />
                      <div className="flex items-center gap-md w-full">
                        <div className="w-12 h-8 rounded bg-[#222222] flex items-center justify-center p-xs">
                          <img className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9dRL_kVShweuASvMRdjRTXIyyqd9ckdFx_O7Oru72Brtqfr5G5L8wudziM6mjIThM_dj27imXTTTuxdIfP4RhBfGdnllGpD-EYYHDUmV8jO-ysXsWBM75YmjLIFfQOHCojtC_dVhcq69gbz1-X1E9qau6IU7fUFgAItlN2Mb1CVnWBxD1OlkOz1Dn3USoD-SSpaVIHppq0y-0ksYJ-SbhVxhBah_PsEyfXh5qruY2WdAqpxOkEz6rzg" alt="Mastercard" />
                        </div>
                        <div className="flex-1">
                          <p className="font-label-md text-label-md text-on-surface dark:text-white">Mastercard</p>
                          <p className="text-[10px] text-on-surface-variant dark:text-outline uppercase tracking-wider">{t("checkout.debit_credit")}</p>
                        </div>
                        <span className={`material-symbols-outlined text-primary dark:text-inverse-primary ${paymentMethod === "card" ? "opacity-100" : "opacity-0"}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-lg pt-lg border-t border-outline-variant dark:border-outline-variant/30">
                {paymentMethod === "momo" || paymentMethod === "airtel" ? (
                  <div className="space-y-md">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.phone_number")}</label>
                      <div className="relative">
                        <span className="absolute left-md top-1/2 -translate-y-1/2 font-body-md text-on-surface-variant dark:text-outline">+256</span>
                        <input className="w-full pl-16 pr-md py-3 bg-surface-container-low dark:bg-surface-variant/10 border-outline-variant dark:border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary focus:border-primary transition-all" placeholder="770 000 000" type="tel" />
                      </div>
                      <p className="text-[12px] text-on-surface-variant dark:text-outline mt-xs">{t("checkout.receive_prompt")}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-md">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.cardholder_name")}</label>
                      <input className="w-full px-md py-3 bg-surface-container-low dark:bg-surface-variant/10 border-outline-variant dark:border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary focus:border-primary" placeholder="John Doe" type="text" />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.card_number")}</label>
                      <div className="relative">
                        <input className="w-full px-md py-3 bg-surface-container-low dark:bg-surface-variant/10 border-outline-variant dark:border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary focus:border-primary" placeholder="0000 0000 0000 0000" type="text" />
                        <span className="absolute right-md top-1/2 -translate-y-1/2 material-symbols-outlined text-outline dark:text-outline-variant">credit_card</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-md">
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.expiry")}</label>
                        <input className="w-full px-md py-3 bg-surface-container-low dark:bg-surface-variant/10 border-outline-variant dark:border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary focus:border-primary" placeholder={t("checkout.mm_yy")} type="text" />
                      </div>
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs">{t("checkout.cvv")}</label>
                        <input className="w-full px-md py-3 bg-surface-container-low dark:bg-surface-variant/10 border-outline-variant dark:border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary focus:border-primary" placeholder="***" type="password" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
            <div className="flex items-center gap-md p-md bg-secondary-container/10 dark:bg-secondary-container/20 border border-secondary-container/30 dark:border-secondary-container/40 rounded-xl">
              <span className="material-symbols-outlined text-secondary">verified_user</span>
              <div>
                <p className="font-label-md text-label-md text-on-secondary-fixed-variant dark:text-on-secondary-container">{t("checkout.pci_security")}</p>
                <p className="text-[12px] text-on-secondary-fixed-variant/70 dark:text-on-secondary-container/70">{t("checkout.payment_encrypted")}</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-md">
              <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-sm dark:shadow-none border border-outline-variant/10 dark:border-outline-variant/30">
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-lg">{t("checkout.order_summary")}</h3>
                {items.length === 0 ? (
                  <p className="text-on-surface-variant font-label-md mb-lg">{t("cart.empty_title")}</p>
                ) : (
                <div className="space-y-md mb-lg">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-md">
                      <div className="w-16 h-16 rounded-lg bg-surface-container-highest dark:bg-surface-variant/20 overflow-hidden flex-shrink-0">
                        <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-md text-label-md text-on-surface dark:text-white truncate">{item.name}</p>
                        <p className="text-[12px] text-on-surface-variant dark:text-outline">{t("checkout.qty")}: {item.quantity}</p>
                        <p className="font-label-md text-label-md text-primary dark:text-inverse-primary">Rwf {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                )}
                <div className="space-y-xs pt-md border-t border-outline-variant dark:border-outline-variant/30">
                  <div className="flex justify-between text-on-surface-variant dark:text-outline font-label-md">
                    <span>{t("checkout.subtotal")}</span>
                    <span>Rwf {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant dark:text-outline font-label-md">
                    <span>{t("checkout.shipping")}</span>
                    <span className="text-secondary">{t("checkout.free")}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant dark:text-outline font-label-md">
                    <span>{t("checkout.tax")} (EST)</span>
                    <span>Rwf {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface dark:text-white font-headline-md pt-base mt-xs border-t border-dashed border-outline-variant dark:border-outline-variant/30">
                    <span>{t("checkout.total")}</span>
                    <span>Rwf {total.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={handleCompletePayment} disabled={submitting} className="w-full bg-primary text-on-primary h-12 rounded-full font-label-md text-label-md mt-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-base disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  {submitting ? "Processing..." : t("checkout.complete_payment")}
                </button>
                <p className="text-[11px] text-center text-on-surface-variant dark:text-outline mt-md">
                  {t("checkout.terms_agreement")}
                </p>
              </section>
              <div className="flex justify-center gap-lg items-center opacity-60 grayscale hover:grayscale-0 transition-all">
                <img className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAToez5SNHEByt4ovh7H7o00f3JrbECZfMy3pFbXOyix8rb2xkYtKmasgX31MRbL4IXA0qSLG_zOnM0B8vApwJbK2YK5k3_genFdqHu_1vnVEikXzXIqh5IVwoWLzgAAIP_ibuOS2seOYW9QprBYXiKL_MTKacyX0oxnj5h1nG7QeQi_ISiEgJVtdOPVSPSnFEZzhgECqCJGvGaeOC1PQEo_RCQAvMiKZTur2Pi2y1g0BNP-2ho2I1_dA" alt="Mastercard SecureCode" />
                <img className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD42VG_DFDC-hLfEBsk4yte0DJxo1tZOmLvBu0vWWajgqhIyhfTqnGrgA4SbzX8BJSvnXa3lQSxl97KORkniCidX4O0Ev17jJpQjTMgF41folkUMx0iyibhLrfxKHE4ToHH9mMCu9dYyyK0EF4Gzgc7Qjt1o3Siu8ospRmF_bm4Y2QGGG6SGgeOhRRvZ9US11FHgaBpL-dioFRQALggQMekOLzj8ukA_aCjDGmR2bZqmpu5X9Q_1N3MqQ" alt="Verified by Visa" />
                <img className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtjDIF9BKbMAx3JJqCZ4H-9Haib1lXnXESIL-JE4IWc-OesNxGzC7kwh-5mo5wwFid37GBDFu5GjsGWKGDPXttROAPkG5dO5idqwQfZggaWmSOD0MjYtuzOlOI-Yn7829tydhg5LlKe5fN6UfosnUKAode60Kk8fLvGiXcczsJLTfheGqmQFEwKVCy4IIgRQmRr6_1ppimcxjNEa8BGuD0uU1RiI8Bga49szIRtnKxKxfamwaprpMO1g" alt="Norton Secured" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
