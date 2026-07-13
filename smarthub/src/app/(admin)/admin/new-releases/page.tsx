"use client";

import { useEffect, useState, useCallback } from "react";
import { useUIStore } from "@/stores/ui-store";

interface NewRelease {
  id: string;
  label: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  buttonText: string;
  buttonLink: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const emptyForm = {
  label: "New Release",
  title: "",
  subtitle: "",
  description: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  imageUrl: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminNewReleasesPage() {
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [releases, setReleases] = useState<NewRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchReleases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/new-releases");
      const data = await res.json();
      setReleases(data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "smarthub/banners");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, imageUrl: data.url }));
      }
    } catch {
      // ignore
    }
    setUploading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (release: NewRelease) => {
    setEditingId(release.id);
    setForm({
      label: release.label,
      title: release.title,
      subtitle: release.subtitle || "",
      description: release.description || "",
      buttonText: release.buttonText,
      buttonLink: release.buttonLink,
      imageUrl: release.imageUrl || "",
      isActive: release.isActive,
      sortOrder: release.sortOrder,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        subtitle: form.subtitle || null,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
      };

      if (editingId) {
        await fetch(`/api/admin/new-releases/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/new-releases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      fetchReleases();
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/new-releases/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteId(null);
        fetchReleases();
      }
    } catch {
      // ignore
    }
    setDeleting(false);
  };

  const handleToggleActive = async (release: NewRelease) => {
    try {
      await fetch(`/api/admin/new-releases/${release.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !release.isActive }),
      });
      fetchReleases();
    } catch {
      // ignore
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-headline-md-mobile md:text-headline-md text-primary">New Releases</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6jAEv7x888X42BimUArGeWLtS9MnDaHwOqSgTX0c13jeuDFDOGhAMbJwltx7r19TZDkvBAPK8kC_t1LocXTZchBB2ntQe2r16jny3aiQ8pzLUYhEV4mzaxTbMqM0khIbcIdHn4LQUuSo1dfmVr6kRSvYi7HcxcQuRzco7rCMccO_heVE48x3jOW4gGtkgBDmG7yRoL1CLMoByp2g1AcpmouNjLxmSZFNuwWzYlIkowOuD5ljUz-l87A" alt="Admin" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-lg pb-28 md:pb-12 space-y-lg">
        <div className="flex items-center justify-between">
          <p className="font-body-md text-on-surface-variant">
            Manage the hero banner slides shown on the homepage.
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 h-10 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Slide
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">Preview</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">Label</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">Title</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">Button</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-center">Order</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-center">Status</th>
                  <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-lg py-12 text-center text-outline">Loading...</td>
                  </tr>
                ) : releases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-lg py-12 text-center text-outline">No new releases yet. Create your first slide!</td>
                  </tr>
                ) : (
                  releases.map((release) => (
                    <tr key={release.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-4">
                        <div className="w-24 h-14 rounded-lg bg-surface-variant overflow-hidden shrink-0">
                          {release.imageUrl ? (
                            <img className="w-full h-full object-cover" src={release.imageUrl} alt={release.title} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <span className="material-symbols-outlined">image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-lg py-4 font-body-md text-on-surface-variant">{release.label}</td>
                      <td className="px-lg py-4">
                        <p className="font-label-md text-on-surface">{release.title}</p>
                        {release.subtitle && (
                          <p className="font-label-sm text-outline">{release.subtitle}</p>
                        )}
                      </td>
                      <td className="px-lg py-4 font-body-md text-on-surface-variant">{release.buttonText}</td>
                      <td className="px-lg py-4 text-center font-label-md text-on-surface-variant">{release.sortOrder}</td>
                      <td className="px-lg py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(release)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm cursor-pointer transition-colors ${
                            release.isActive
                              ? "bg-secondary-container/30 text-on-secondary-container"
                              : "bg-error-container/20 text-error"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${release.isActive ? "bg-green-500" : "bg-error"}`} />
                          {release.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-lg py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(release)}
                            className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {deleteId === release.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(release.id)}
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
                              onClick={() => setDeleteId(release.id)}
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
      </div>

      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowForm(false)} />
          <div className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-surface-container-lowest rounded-t-2xl md:rounded-2xl shadow-overlay max-h-[90vh] overflow-y-auto w-full md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            <div className="sticky top-0 bg-surface-container-lowest flex items-center justify-between p-lg border-b border-outline-variant/20">
              <h2 className="font-headline-md text-headline-md">{editingId ? "Edit Slide" : "New Slide"}</h2>
              <button onClick={() => setShowForm(false)} className="text-on-surface-variant active:scale-90 transition-transform">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-5">
              <div>
                <label className="block font-label-md text-on-surface mb-1">Label</label>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. New Release"
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Galaxy S24 Ultra Elite"
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Subtitle</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Optional subtitle text"
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full h-20 px-3 py-2 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Background Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center h-10 px-3 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-lg font-body-md cursor-pointer hover:bg-surface-variant/30 transition-colors">
                    <span className="material-symbols-outlined text-[18px] mr-2 text-outline">upload</span>
                    {uploading ? "Uploading..." : form.imageUrl ? "Change Image" : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
                {form.imageUrl && (
                  <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-outline-variant/20">
                    <img className="w-full h-full object-cover" src={form.imageUrl} alt="Preview" />
                    <button
                      onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-on-surface mb-1">Button Text</label>
                  <input
                    value={form.buttonText}
                    onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface mb-1">Button Link</label>
                  <input
                    value={form.buttonLink}
                    onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="/products"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-on-surface mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="font-label-md text-on-surface">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-surface-container-lowest flex items-center justify-end gap-3 p-lg border-t border-outline-variant/20">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 h-10 border border-outline-variant/30 text-on-surface-variant rounded-lg font-label-md hover:bg-surface-variant/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="px-4 h-10 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-30 flex justify-around items-center px-2 pb-2 h-16 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-sm text-label-sm">Dashboard</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/products">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="font-label-sm text-label-sm">Products</span>
        </a>
        <a className="flex flex-col items-center justify-center text-primary bg-primary-container/30 rounded-full px-4 py-1" href="/admin/new-releases">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>new_releases</span>
          <span className="font-label-sm text-label-sm">New Releases</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/financial">
          <span className="material-symbols-outlined">account_balance</span>
          <span className="font-label-sm text-label-sm">Financial</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/profit-loss">
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-label-sm text-label-sm">P&L</span>
        </a>
      </nav>
    </main>
  );
}
