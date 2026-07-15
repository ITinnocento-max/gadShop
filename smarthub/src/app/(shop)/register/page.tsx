"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/store/header";
import { useTranslation } from "@/hooks/useTranslation";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header showBack title="SmartHub" />
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" />
      <main className="relative z-10 w-full max-w-screen-xl mx-auto px-margin-mobile grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-xl min-h-screen">
        <div className="hidden lg:flex flex-col space-y-lg">
          <div className="flex items-center space-x-sm">
            <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_button</span>
            <h1 className="font-headline-lg text-headline-lg text-primary dark:text-inverse-primary">{t("common.app_name")}</h1>
          </div>
          <h2 className="font-display-lg text-display-lg leading-tight text-on-background dark:text-white">
            {t("auth.join_premium")}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-outline max-w-md">
            {t("auth.access_ecosystem")}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-xl">
            <div className="bg-surface-container-low dark:bg-surface-variant/10 p-md rounded-xl shadow-sm border border-outline-variant/30 dark:border-outline-variant/20">
              <span className="material-symbols-outlined text-primary dark:text-inverse-primary mb-2">verified_user</span>
              <p className="font-label-md text-label-md font-bold">{t("auth.secure_access")}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline">{t("auth.secure_access_desc")}</p>
            </div>
            <div className="bg-surface-container-low dark:bg-surface-variant/10 p-md rounded-xl shadow-sm border border-outline-variant/30 dark:border-outline-variant/20">
              <span className="material-symbols-outlined text-primary dark:text-inverse-primary mb-2">speed</span>
              <p className="font-label-md text-label-md font-bold">{t("auth.fast_delivery")}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline">{t("auth.fast_delivery_desc")}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[480px] p-xl rounded-[32px] shadow-overlay dark:shadow-none border border-white/50 dark:border-outline-variant/30 bg-surface/70 dark:bg-inverse-surface/70 backdrop-blur-xl">
            <div className="mb-lg">
              <div className="lg:hidden flex items-center space-x-sm mb-md">
                <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_button</span>
                <h1 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary">{t("common.app_name")}</h1>
              </div>
              <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background dark:text-white">{t("auth.create_account")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mt-xs">{t("auth.create_account_desc")}</p>
            </div>
            {error && (
              <div className="mb-md p-3 bg-error-container/20 border border-error/30 rounded-xl text-error font-label-md text-label-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-md p-3 bg-tertiary-container/20 border border-tertiary/30 rounded-xl text-tertiary font-label-md text-label-md">
                Account created! Redirecting to login...
              </div>
            )}
            <form className="space-y-md" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs ml-1" htmlFor="full_name">{t("auth.full_name")}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline dark:text-outline-variant">person</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-white/60 dark:bg-surface-variant/30 border border-outline-variant dark:border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" id="full_name" placeholder="John Doe" type="text" />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs ml-1" htmlFor="email">{t("auth.email")}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline dark:text-outline-variant">mail</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-white/60 dark:bg-surface-variant/30 border border-outline-variant dark:border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" id="email" placeholder="name@example.com" type="email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs ml-1" htmlFor="country">{t("auth.country")}</label>
                  <select className="w-full h-12 px-4 bg-white/60 dark:bg-surface-variant/30 border border-outline-variant dark:border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer" id="country">
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="de">Germany</option>
                    <option value="fr">France</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs ml-1" htmlFor="language">{t("auth.language")}</label>
                  <select className="w-full h-12 px-4 bg-white/60 dark:bg-surface-variant/30 border border-outline-variant dark:border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer" id="language">
                    <option value="en">English (US)</option>
                    <option value="es">Espa&ntilde;ol</option>
                    <option value="fr">Fran&ccedil;ais</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs ml-1" htmlFor="password">{t("auth.password")}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline dark:text-outline-variant">lock</span>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-white/60 dark:bg-surface-variant/30 border border-outline-variant dark:border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" id="password" placeholder="••••••••" type="password" />
                  </div>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant dark:text-outline mb-xs ml-1" htmlFor="confirm_password">{t("auth.confirm_password")}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline dark:text-outline-variant">lock_reset</span>
                    <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-white/60 dark:bg-surface-variant/30 border border-outline-variant dark:border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" id="confirm_password" placeholder="••••••••" type="password" />
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-sm py-xs">
                <input checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded border-outline-variant dark:border-outline-variant/30 text-primary dark:text-inverse-primary focus:ring-primary cursor-pointer" id="terms" type="checkbox" />
                <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline leading-relaxed" htmlFor="terms">
                  {t("auth.agree_terms")}
                </label>
              </div>
              <button disabled={loading || success} className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-sm shadow-md dark:shadow-none disabled:opacity-50">
                <span>{loading ? "Creating account..." : t("auth.create_account")}</span>
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
              <div className="text-center pt-md border-t border-outline-variant/30 dark:border-outline-variant/20 mt-md">
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
                  {t("auth.already_have_account")} <a className="text-primary dark:text-inverse-primary font-bold hover:underline" href="/login">{t("auth.sign_in")}</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
