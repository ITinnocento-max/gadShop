"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/useTranslation";

export default function LoginPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("from");
    if (f) setFrom(f);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.dbRole === "ADMIN") {
        window.location.href = from && from.startsWith("/admin") ? from : "/admin/dashboard";
      } else {
        window.location.href = from || "/";
      }
    }
  }, [isAuthenticated, user, from]);

  if (isAuthenticated && user) {
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        return;
      }
      useAuthStore.getState().login(data.user);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background dark:bg-inverse-surface text-on-surface dark:text-white min-h-screen flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-fixed-dim/20 dark:opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-container/20 dark:opacity-20 blur-[120px] rounded-full" />
      </div>
      <main className="relative z-10 w-full h-screen grid grid-cols-1 md:grid-cols-[2fr_3fr] bg-surface-container-lowest dark:bg-inverse-surface overflow-hidden">
        <section className="hidden md:flex flex-col justify-between p-[5vw] lg:p-[4vw] xl:p-[3.5vw] bg-primary relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="font-headline-lg text-headline-lg lg:text-[3.5vw] xl:text-[3vw] text-on-primary tracking-tighter mb-md">{t("common.app_name")}</h1>
            <p className="font-body-lg text-body-lg lg:text-[1.6vw] xl:text-[1.4vw] text-primary-container">
              {t("auth.access_ecosystem")}
            </p>
          </div>
          <div className="absolute bottom-0 right-0 w-full h-[65%] flex items-end justify-end translate-x-[10%] translate-y-[10%]">
            <div className="relative group w-full h-full flex items-end justify-end">
              <div className="absolute inset-0 bg-secondary-fixed/30 rounded-full blur-3xl scale-110 animate-pulse" />
              <img className="w-[80%] h-auto max-w-[50vw] object-contain relative z-10 drop-shadow-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU4l3j3LE0Wlm57XANPIiG4rQG_JT2pxC37O_tX4jxyMZ0qfEKPm4aavTLJmgKJT0fO656DVeaXmLRrr93-OjPT2dzxOp9D6Mb1QHUgdatrGCXxmvqiVIq2fE_tke2g3u_5gcxQ9NIMomeB5KMRRMddy9oZcSdbDAdZt7X9ofROr9Qtd5E3JpMJ62gVB-0kk91d5_n86SChbkO6wa73hhGNkXOOuHIDODDS6N1LRPOz_U5SbYKRYWvJw" alt="SmartHub products" />
            </div>
          </div>
          <div className="relative z-10 font-label-md text-label-md lg:text-[1.2vw] xl:text-[1vw] text-on-primary/60">&copy; 2026 {t("common.app_name")}. {t("admin.all_rights")}</div>
          <div className="relative z-10 font-label-sm text-label-sm text-on-primary/40 mt-1">Developer: Innocent &amp; Google Profile: InonoTech rw</div>
        </section>
        <section className="flex flex-col justify-center px-[6vw] lg:px-[5vw] xl:px-[4vw] py-[4vw] bg-surface-container-lowest dark:bg-inverse-surface">
          <div className="w-full mx-auto">
            <div className="md:hidden mb-lg">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:text-headline-lg text-primary dark:text-inverse-primary tracking-tighter">{t("common.app_name")}</h1>
            </div>
            <div className="mb-xl lg:mb-[3vh] xl:mb-[4vh]">
              <h2 className="font-headline-md text-headline-md lg:text-[2.5vw] xl:text-[2.2vw] text-on-surface dark:text-white mb-xs">{t("auth.welcome_back")}</h2>
              <p className="font-body-md text-body-md lg:text-[1.3vw] xl:text-[1.1vw] text-on-surface-variant dark:text-outline">{t("auth.sign_in_desc")}</p>
            </div>
            {error && (
              <div className="mb-md p-3 bg-error-container/20 border border-error/30 rounded-xl text-error font-label-md text-label-md">
                {error}
              </div>
            )}
            <form className="space-y-lg lg:space-y-[2vh] xl:space-y-[2.5vh]" onSubmit={handleSubmit}>
              <div className="space-y-xs lg:space-y-[0.8vh]">
                <label className="block font-label-md text-label-md lg:text-[1.1vw] xl:text-[1vw] text-on-surface-variant dark:text-outline" htmlFor="identity">{t("auth.email_or_phone")}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-md lg:pl-[1.5vw] flex items-center pointer-events-none text-outline dark:text-outline-variant group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px] lg:text-[1.3vw]">person</span>
                  </div>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 lg:pl-[3.5vw] pr-md lg:pr-[1.5vw] py-3 lg:py-[1.5vh] xl:py-[1.8vh] bg-surface-container-low dark:bg-surface-variant/10 border border-outline-variant/30 dark:border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface dark:text-white font-body-md lg:text-[1.1vw] xl:text-[1vw]" id="identity" name="identity" placeholder="name@example.com" type="text" />
                </div>
              </div>
              <div className="space-y-xs lg:space-y-[0.8vh]">
                <div className="flex justify-between items-center">
                  <label className="block font-label-md text-label-md lg:text-[1.1vw] xl:text-[1vw] text-on-surface-variant dark:text-outline" htmlFor="password">{t("auth.password")}</label>
                  <a className="font-label-sm text-label-sm lg:text-[0.9vw] xl:text-[0.8vw] text-primary dark:text-inverse-primary hover:underline transition-all" href="#">{t("auth.forgot_password")}</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-md lg:pl-[1.5vw] flex items-center pointer-events-none text-outline dark:text-outline-variant group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px] lg:text-[1.3vw]">lock</span>
                  </div>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 lg:pl-[3.5vw] pr-12 lg:pr-[3.5vw] py-3 lg:py-[1.5vh] xl:py-[1.8vh] bg-surface-container-low dark:bg-surface-variant/10 border border-outline-variant/30 dark:border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface dark:text-white font-body-md lg:text-[1.1vw] xl:text-[1vw]" id="password" name="password" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-md lg:pr-[1.5vw] flex items-center text-outline dark:text-outline-variant hover:text-on-surface-variant dark:hover:text-outline transition-colors">
                    <span className="material-symbols-outlined text-[20px] lg:text-[1.3vw]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <button disabled={loading} className="w-full h-[48px] lg:h-[5.5vh] xl:h-[6vh] bg-primary text-on-primary font-label-md text-label-md lg:text-[1.2vw] xl:text-[1.1vw] rounded-xl shadow-lg shadow-primary/20 dark:shadow-none hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50">{loading ? "Signing in..." : t("auth.sign_in")}</button>
            </form>
            <div className="relative my-xl lg:my-[3vh] xl:my-[4vh]">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30 dark:border-outline-variant/20" />
              </div>
              <div className="relative flex justify-center text-label-sm lg:text-[0.9vw] uppercase">
                <span className="bg-surface-container-lowest dark:bg-inverse-surface px-md lg:px-[1.5vw] text-outline dark:text-outline-variant">{t("auth.or_continue_with")}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-md lg:gap-[1.5vw]">
              <button className="flex items-center justify-center h-[48px] lg:h-[5.5vh] xl:h-[6vh] border border-outline-variant/30 dark:border-outline-variant/20 rounded-xl hover:bg-surface-container-low dark:hover:bg-surface-variant/10 active:scale-95 transition-all">
                <svg className="w-5 h-5 lg:w-[1.5vw] lg:h-[1.5vw]" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>
              <button className="flex items-center justify-center h-[48px] lg:h-[5.5vh] xl:h-[6vh] border border-outline-variant/30 dark:border-outline-variant/20 rounded-xl hover:bg-surface-container-low dark:hover:bg-surface-variant/10 active:scale-95 transition-all">
                <svg className="w-5 h-5 lg:w-[1.5vw] lg:h-[1.5vw]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05 1.72-3.32 1.72-1.24 0-1.63-.78-3.12-.78-1.52 0-1.97.76-3.12.78-1.21.02-2.31-.83-3.35-1.84C2.08 18.25 1 15.39 1 12.63c0-4.38 2.84-6.7 5.59-6.7 1.45 0 2.62.9 3.51.9 1.01 0 2.22-.97 3.79-.97 1.42 0 3.03.62 4.12 1.83-2.62 1.48-2.2 5.09.52 6.22-.72 1.94-1.67 3.71-3.48 6.37zm-3.86-16.14c.73-.89 1.22-2.13 1.08-3.37-1.07.04-2.36.71-3.13 1.6-.69.79-1.29 2.06-1.13 3.26 1.19.09 2.39-.63 3.18-1.49z" />
                </svg>
              </button>
              <button className="flex items-center justify-center h-[48px] lg:h-[5.5vh] xl:h-[6vh] border border-outline-variant/30 dark:border-outline-variant/20 rounded-xl hover:bg-surface-container-low dark:hover:bg-surface-variant/10 active:scale-95 transition-all">
                <svg className="w-6 h-6 lg:w-[1.8vw] lg:h-[1.8vw] text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>
            <div className="mt-2xl lg:mt-[3vh] xl:mt-[4vh] text-center">
              <p className="font-body-md text-body-md lg:text-[1.1vw] xl:text-[1vw] text-on-surface-variant dark:text-outline">
                {t("auth.no_account")} <a className="text-primary dark:text-inverse-primary font-label-md lg:text-[1.1vw] xl:text-[1vw] hover:underline decoration-2 underline-offset-4" href="/register">{t("auth.create_account")}</a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
