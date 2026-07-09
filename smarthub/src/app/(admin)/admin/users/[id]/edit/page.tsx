"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

interface AdminRole {
  id: string; name: string; displayName: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isNew = params.id === "new";

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "CUSTOMER",
    phone: "", adminRoleId: "", emailVerified: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesRes = await fetch("/api/admin/users?limit=1").catch(() => null);
        const adminRolesRes = await fetch("/api/admin/roles").then((r) => r.json()).catch(() => []);
        setAdminRoles(adminRolesRes);

        if (!isNew) {
          const userRes = await fetch(`/api/admin/users/${params.id}`).then((r) => r.json());
          if (userRes.id) {
            setForm({
              name: userRes.name || "",
              email: userRes.email || "",
              password: "",
              role: userRes.role || "CUSTOMER",
              phone: userRes.phone || "",
              adminRoleId: userRes.adminRoleId || "",
              emailVerified: userRes.emailVerified || false,
            });
          }
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [params.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.name || !form.email) {
      setError("Name and email are required");
      setSaving(false);
      return;
    }
    if (isNew && !form.password) {
      setError("Password is required for new users");
      setSaving(false);
      return;
    }

    try {
      const url = isNew ? "/api/admin/users" : `/api/admin/users/${params.id}`;
      const method = isNew ? "POST" : "PUT";
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role: form.role,
        phone: form.phone || null,
        adminRoleId: form.adminRoleId || null,
        emailVerified: form.emailVerified,
      };
      if (form.password) body.password = form.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to save user");
        setSaving(false);
        return;
      }

      router.push("/admin/users");
    } catch {
      setError("Failed to save user");
      setSaving(false);
    }
  };

  const update = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputCls = "w-full h-12 sm:h-14 md:h-16 px-4 md:px-5 lg:px-6 bg-surface-container-low border border-outline-variant/20 rounded-xl font-body-md outline-none focus:ring-2 focus:ring-primary/20 text-body-md md:text-body-lg lg:text-body-xl";
  const labelCls = "font-label-md text-label-md md:text-label-lg lg:text-headline-sm text-on-surface-variant mb-2 md:mb-2.5 lg:mb-3 block";

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-outline">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-headline-md-mobile md:text-headline-md text-primary">{isNew ? "Add User" : "Edit User"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/users")} className="px-4 md:px-6 h-10 md:h-12 border border-outline-variant rounded-lg font-label-md md:text-label-lg text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 md:px-6 h-10 md:h-12 bg-primary text-on-primary rounded-lg font-label-md md:text-label-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <span className="material-symbols-outlined text-[16px] animate-spin">hourglass_top</span>}
            {isNew ? "Create User" : "Save Changes"}
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-lg pb-28 md:pb-12">
        <form onSubmit={handleSubmit} className="w-full max-w-7xl mx-auto space-y-lg md:space-y-xl lg:space-y-2xl">
          {error && (
            <div className="p-md bg-error-container/20 border border-error/30 rounded-xl text-error font-body-md">{error}</div>
          )}

          <div className="bg-surface-container-lowest p-xl md:p-2xl lg:p-3xl rounded-2xl border border-outline-variant/10 space-y-xl md:space-y-2xl lg:space-y-3xl">
            <h2 className="font-headline-md md:font-headline-lg lg:font-headline-xl text-on-surface">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg md:gap-xl lg:gap-2xl">
              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelCls}>Full Name *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{isNew ? "Password *" : "Password (leave blank to keep current)"}</label>
                <input value={form.password} onChange={(e) => update("password", e.target.value)} type="password" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Role *</label>
                <select value={form.role} onChange={(e) => update("role", e.target.value)} className={inputCls}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} type="tel" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Admin Role</label>
                <select value={form.adminRoleId} onChange={(e) => update("adminRoleId", e.target.value)} className={inputCls}>
                  <option value="">None</option>
                  {adminRoles.map((r) => (
                    <option key={r.id} value={r.id}>{r.displayName}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-1 md:pb-2 lg:pb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.emailVerified}
                    onChange={(e) => update("emailVerified", e.target.checked)}
                    className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="font-body-md md:font-body-lg lg:font-headline-sm text-on-surface">Email Verified</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
