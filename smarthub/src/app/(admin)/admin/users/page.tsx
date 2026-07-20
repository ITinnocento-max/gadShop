"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUIStore } from "@/stores/ui-store";

interface UserData {
  id: string; name: string; email: string; role: string; phone: string | null;
  emailVerified: boolean; createdAt: string;
  adminRole: { id: string; name: string; displayName: string } | null;
  _count: { orders: number; products: number };
}

interface UsersResponse {
  users: UserData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-primary/10 text-primary",
  VENDOR: "bg-secondary-container/30 text-on-secondary-container",
  CUSTOMER: "bg-surface-container-high text-on-surface-variant",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  VENDOR: "Vendor",
  CUSTOMER: "Customer",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [refetchKey, setRefetchKey] = useState(0);
  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter !== "all") params.set("role", roleFilter);
    params.set("page", String(page));
    params.set("limit", "20");
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search, roleFilter, page, refetchKey]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteId(null);
        refetch();
      }
    } catch {}
    setDeleting(false);
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-headline-md-mobile md:text-headline-md text-primary">Users</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
            <Image
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6jAEv7x888X42BimUArGeWLtS9MnDaHwOqSgTX0c13jeuDFDOGhAMbJwltx7r19TZDkvBAPK8kC_t1LocXTZchBB2ntQe2r16jny3aiQ8pzLUYhEV4mzaxTbMqM0khIbcIdHn4LQUuSo1dfmVr6kRSvYi7HcxcQuRzco7rCMccO_heVE48x3jOW4gGtkgBDmG7yRoL1CLMoByp2g1AcpmouNjLxmSZFNuwWzYlIkowOuD5ljUz-l87A"
              alt="Admin"
              width={32}
              height={32}
            />
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-lg pb-28 md:pb-12 space-y-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-10 pl-10 pr-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Search users..."
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="VENDOR">Vendor</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
          <button
            onClick={() => router.push("/admin/users/new/edit")}
            className="flex items-center gap-2 px-4 h-10 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add User
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">User</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">Role</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">Admin Role</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-center">Verified</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">Joined</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-lg py-12 text-center text-outline">Loading...</td>
                  </tr>
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-lg py-12 text-center text-outline">No users found</td>
                  </tr>
                ) : (
                  data?.users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-[20px]">person</span>
                          </div>
                          <div>
                            <p className="font-label-md text-on-surface">{user.name}</p>
                            <p className="font-label-sm text-outline">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full font-label-sm text-label-sm ${roleColors[user.role] || "bg-surface-container-high text-on-surface-variant"}`}>
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-lg py-4 font-body-md text-on-surface-variant">
                        {user.adminRole ? user.adminRole.displayName : "—"}
                      </td>
                      <td className="px-lg py-4 text-center">
                        {user.emailVerified ? (
                          <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                        ) : (
                          <span className="material-symbols-outlined text-outline text-[18px]">unpublished</span>
                        )}
                      </td>
                      <td className="px-lg py-4 font-body-md text-on-surface-variant whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-lg py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                            className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {deleteId === user.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={deleting}
                                className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">{deleting ? "hourglass_top" : "check"}</span>
                              </button>
                              <button
                                onClick={() => setDeleteId(null)}
                                className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteId(user.id)}
                              className="p-2 text-on-surface-variant hover:bg-error-container/20 hover:text-error rounded-lg transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="font-body-md text-outline">
              Showing {(data.page - 1) * data.limit + 1}-{Math.min(data.page * data.limit, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === data.totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-outline">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg font-label-md transition-colors ${
                        p === page ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-variant/50"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-2 h-16 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-sm text-label-sm">Dashboard</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-primary bg-primary-container/30 rounded-full px-4 py-1" href="/admin/users">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          <span className="font-label-sm text-label-sm">Users</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/products">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="font-label-sm text-label-sm">Products</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/financial">
          <span className="material-symbols-outlined">account_balance</span>
          <span className="font-label-sm text-label-sm">Financial</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/profit-loss">
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-label-sm text-label-sm">P&L</span>
        </Link>
      </nav>
    </main>
  );
}
