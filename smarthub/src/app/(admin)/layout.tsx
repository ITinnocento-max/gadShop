"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminDrawerMenu } from "@/components/admin/admin-drawer";
import { AdminGuard } from "@/components/admin/admin-guard";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background text-on-surface">
        <AdminSidebar />
        <AdminDrawerMenu />
        {children}
      </div>
    </AdminGuard>
  );
}
